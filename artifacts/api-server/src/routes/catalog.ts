import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { toPublicCar } from "../lib/public-car";
import { ensureCatalogTables } from "../lib/ensure-tables";

/**
 * DB-backed catalog (stored Encar cars + manually entered auction cars).
 * @workspace/db throws at import time when DATABASE_URL is missing, so it is loaded lazily:
 * the rest of the site keeps working until the database is configured.
 */
const router: IRouter = Router();

const loadDb = async () => {
  await ensureCatalogTables();
  return import("@workspace/db");
};

async function getTenant(req: Request, res: Response) {
  const slug = String(req.query.tenant ?? req.header("x-tenant") ?? "").trim();
  if (!slug) {
    res.status(400).json({ error: "tenant is required" });
    return null;
  }
  const { db, tenants } = await loadDb();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  if (!tenant || !tenant.active) {
    res.status(404).json({ error: "tenant not found" });
    return null;
  }
  return tenant;
}

const intParam = (v: unknown) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : undefined;
};

// GET /api/catalog/tenant?slug=dealer1  or  ?host=cars.dealer.com  -> public branding for a dealer site
router.get("/tenant", async (req, res) => {
  try {
    const slug = String(req.query.slug ?? "").trim();
    const host = String(req.query.host ?? "").trim().toLowerCase().replace(/^www\./, "");
    if (!slug && !host) return void res.status(400).json({ error: "slug or host is required" });
    const { db, tenants } = await loadDb();
    const [t] = await db.select().from(tenants).where(slug ? eq(tenants.slug, slug) : eq(tenants.domain, host)).limit(1);
    if (!t || !t.active) return void res.status(404).json({ error: "tenant not found" });
    res.json({ slug: t.slug, name: t.name, logoUrl: t.logoUrl, whatsapp: t.whatsapp, currency: t.currency, language: t.language, makes: (t.filter as any)?.makes ?? [] });
  } catch (err) {
    res.status(500).json({ error: String((err as Error).message ?? err) });
  }
});

// GET /api/catalog/cars?tenant=slug&make=&model=&q=&yearMin=&yearMax=&priceMin=&priceMax=&fuel=&sort=&page=&limit=
router.get("/cars", async (req, res) => {
  try {
    const tenant = await getTenant(req, res);
    if (!tenant) return;
    const { db, cars } = await loadDb();
    const f = tenant.filter ?? {};

    const where: (SQL | undefined)[] = [eq(cars.status, "available")];
    // dealer-level limits first, then the customer's own filters on top
    if (f.makes?.length) where.push(inArray(cars.manufacturer, f.makes));
    if (f.yearMin) where.push(gte(cars.year, f.yearMin));
    if (f.yearMax) where.push(lte(cars.year, f.yearMax));
    if (f.priceMinManwon) where.push(gte(cars.priceManwon, f.priceMinManwon));
    if (f.priceMaxManwon) where.push(lte(cars.priceManwon, f.priceMaxManwon));

    const make = String(req.query.make ?? "");
    if (make) where.push(eq(cars.manufacturer, make));
    const model = String(req.query.model ?? "");
    if (model) where.push(ilike(cars.model, `%${model}%`));
    const fuel = String(req.query.fuel ?? "");
    if (fuel) where.push(eq(cars.fuel, fuel));
    const q = String(req.query.q ?? "").trim();
    if (q) where.push(or(ilike(cars.model, `%${q}%`), ilike(cars.badge, `%${q}%`), ilike(cars.manufacturer, `%${q}%`)));
    const yearMin = intParam(req.query.yearMin);
    if (yearMin) where.push(gte(cars.year, yearMin));
    const yearMax = intParam(req.query.yearMax);
    if (yearMax) where.push(lte(cars.year, yearMax));
    const priceMin = intParam(req.query.priceMin);
    if (priceMin) where.push(gte(cars.priceManwon, priceMin));
    const priceMax = intParam(req.query.priceMax);
    if (priceMax) where.push(lte(cars.priceManwon, priceMax));
    const mileageMax = intParam(req.query.mileageMax);
    if (mileageMax) where.push(lte(cars.mileage, mileageMax));

    const sort = String(req.query.sort ?? "newest");
    const order =
      sort === "price_asc" ? asc(cars.priceManwon)
      : sort === "price_desc" ? desc(cars.priceManwon)
      : sort === "mileage" ? asc(cars.mileage)
      : sort === "year" ? desc(cars.year)
      : desc(cars.encarModifiedAt);

    const limit = Math.min(Math.max(intParam(req.query.limit) ?? 24, 1), 60);
    const page = Math.max(intParam(req.query.page) ?? 1, 1);
    const cond = and(...where);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(cars).where(cond).orderBy(order).limit(limit).offset((page - 1) * limit),
      db.select({ total: sql<number>`count(*)::int` }).from(cars).where(cond),
    ]);

    res.json({
      page,
      limit,
      total,
      cars: rows.map((c) => toPublicCar(c)),
    });
  } catch (err) {
    req.log?.error({ err }, "catalog search failed");
    res.status(500).json({ error: "search failed" });
  }
});

// GET /api/catalog/cars/:id?tenant=slug
router.get("/cars/:id", async (req, res) => {
  try {
    const tenant = await getTenant(req, res);
    if (!tenant) return;
    const id = intParam(req.params.id);
    if (!id) return void res.status(400).json({ error: "bad id" });
    const { db, cars } = await loadDb();
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) return void res.status(404).json({ error: "not found" });
    res.json(toPublicCar(car, { detail: true }));
  } catch (err) {
    req.log?.error({ err }, "catalog detail failed");
    res.status(500).json({ error: "failed" });
  }
});

// GET /api/catalog/auction?tenant=slug  (public list of the dealer's manually entered auction cars)
router.get("/auction", async (req, res) => {
  try {
    const tenant = await getTenant(req, res);
    if (!tenant) return;
    const { db, auctionCars } = await loadDb();
    const rows = await db
      .select()
      .from(auctionCars)
      .where(and(eq(auctionCars.tenantId, tenant.id), eq(auctionCars.status, "available")))
      .orderBy(desc(auctionCars.auctionDate), desc(auctionCars.id))
      .limit(200);
    res.json({ cars: rows });
  } catch (err) {
    req.log?.error({ err }, "auction list failed");
    res.status(500).json({ error: "failed" });
  }
});

async function requireAdmin(req: Request, res: Response) {
  const tenant = await getTenant(req, res);
  if (!tenant) return null;
  const key = req.header("x-admin-key");
  if (!tenant.adminKey || !key || key !== tenant.adminKey) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  return tenant;
}

const str = (v: unknown, max = 300) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const numOrNull = (v: unknown) => {
  const n = Number(v);
  return v !== undefined && v !== null && v !== "" && Number.isFinite(n) ? n : null;
};

// POST /api/catalog/auction?tenant=slug   (header x-admin-key)
router.post("/auction", async (req, res) => {
  try {
    const tenant = await requireAdmin(req, res);
    if (!tenant) return;
    const b = req.body ?? {};
    const auction = str(b.auction, 40);
    if (!auction) return void res.status(400).json({ error: "auction is required" });
    const { db, auctionCars } = await loadDb();
    const date = b.auctionDate ? new Date(b.auctionDate) : null;
    const [row] = await db
      .insert(auctionCars)
      .values({
        tenantId: tenant.id,
        auction,
        auctionDate: date && !isNaN(date.getTime()) ? date : null,
        lotNumber: str(b.lotNumber, 40),
        manufacturer: str(b.manufacturer, 80),
        model: str(b.model, 120),
        year: numOrNull(b.year),
        mileage: numOrNull(b.mileage),
        startPriceManwon: numOrNull(b.startPriceManwon),
        grade: str(b.grade, 40),
        notes: str(b.notes, 1000),
        photoUrls: Array.isArray(b.photoUrls) ? b.photoUrls.filter((u: unknown) => typeof u === "string").slice(0, 30) : [],
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log?.error({ err }, "auction create failed");
    res.status(500).json({ error: "failed" });
  }
});

// DELETE /api/catalog/auction/:id?tenant=slug  (marks unavailable)
router.delete("/auction/:id", async (req, res) => {
  try {
    const tenant = await requireAdmin(req, res);
    if (!tenant) return;
    const id = intParam(req.params.id);
    if (!id) return void res.status(400).json({ error: "bad id" });
    const { db, auctionCars } = await loadDb();
    await db
      .update(auctionCars)
      .set({ status: "unavailable" })
      .where(and(eq(auctionCars.id, id), eq(auctionCars.tenantId, tenant.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err }, "auction delete failed");
    res.status(500).json({ error: "failed" });
  }
});

export default router;

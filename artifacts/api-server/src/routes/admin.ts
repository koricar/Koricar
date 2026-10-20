import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { importApifyItems } from "../lib/import-cars";
import { ensureCatalogTables } from "../lib/ensure-tables";
import { runSync, syncState, probeCar, learnOptionCodes, reresolveOptions } from "../lib/encar-sync";
import { ADMIN_PAGE_HTML } from "../lib/admin-page";

/**
 * Owner-only setup API + page (create dealers, upload Apify datasets) usable from a phone.
 * Disabled unless the ADMIN_TOKEN environment variable is set.
 */
const router: IRouter = Router();

router.get("/ui", (_req, res) => {
  res.type("html").send(ADMIN_PAGE_HTML);
});

function auth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return void res.status(503).json({ error: "ADMIN_TOKEN is not configured" });
  const given = String(req.header("x-admin-token") ?? "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return void res.status(401).json({ error: "unauthorized" });
  next();
}

const num = (v: unknown) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : undefined;
};

router.get("/stats", auth, async (_req, res) => {
  try {
    await ensureCatalogTables();
    const { db, cars, tenants } = await import("@workspace/db");
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(cars);
    const list = await db.select({ slug: tenants.slug, name: tenants.name, filter: tenants.filter }).from(tenants);
    res.json({ cars: total, tenants: list });
  } catch (err) {
    res.status(500).json({ error: String((err as Error).message ?? err) });
  }
});

router.post("/tenant", auth, async (req, res) => {
  try {
    await ensureCatalogTables();
    const { db, tenants } = await import("@workspace/db");
    const b = req.body ?? {};
    const slug = String(b.slug ?? "").trim().toLowerCase();
    const name = String(b.name ?? "").trim();
    if (!/^[a-z0-9-]{2,40}$/.test(slug) || !name) {
      return void res.status(400).json({ error: "slug (a-z, 0-9, -) and name are required" });
    }
    const filter = {
      makes: b.makes ? String(b.makes).split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      yearMin: num(b.yearMin),
      yearMax: num(b.yearMax),
      priceMinManwon: num(b.priceMin),
      priceMaxManwon: num(b.priceMax),
    };
    const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    const adminKey = existing?.adminKey ?? randomBytes(18).toString("hex");
    const whatsapp = b.whatsapp ? String(b.whatsapp).trim() : null;
    await db
      .insert(tenants)
      .values({ slug, name, filter, adminKey, whatsapp })
      .onConflictDoUpdate({ target: tenants.slug, set: { name, filter, whatsapp } });
    res.json({ ok: true, slug, adminKey, filter });
  } catch (err) {
    res.status(500).json({ error: String((err as Error).message ?? err) });
  }
});

router.post("/import", auth, async (req, res) => {
  try {
    await ensureCatalogTables();
    const body = req.body;
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (!items) return void res.status(400).json({ error: "send a JSON array of Apify items" });
    res.json(await importApifyItems(items, body?.markMissing === true));
  } catch (err) {
    res.status(500).json({ error: String((err as Error).message ?? err) });
  }
});

router.post("/sync", auth, async (req, res) => {
  try {
    await ensureCatalogTables();
    if (syncState.running) return void res.json({ started: false, message: "sync already running" });
    const b = req.body ?? {};
    void runSync({ maxNew: num(b.maxNew) ?? 40, maxPages: num(b.maxPages) ?? 20 });
    res.json({ started: true });
  } catch (err) {
    res.status(500).json({ error: String((err as Error).message ?? err) });
  }
});

router.get("/sync/status", auth, (_req, res) => { res.json(syncState); });

router.post("/learn-options", auth, async (_req, res) => {
  try { res.json({ learn: await learnOptionCodes(), reresolve: await reresolveOptions() }); }
  catch (err) { res.status(500).json({ error: String((err as Error).message ?? err) }); }
});

router.get("/probe/:id", auth, async (req, res) => {
  res.json(await probeCar(String(req.params.id).replace(/\D/g, "")));
});

export default router;

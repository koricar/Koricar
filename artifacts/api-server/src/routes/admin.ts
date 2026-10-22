import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { importApifyItems } from "../lib/import-cars";
import { ensureCatalogTables } from "../lib/ensure-tables";
import { runSync, syncState, probeCar, learnOptionCodes, reresolveOptions, backfillReports, probeSearchFilters } from "../lib/encar-sync";
import { buildEncarQuery } from "./cars";
import { searchList } from "../lib/encar-sync";
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
    const [{ withInspection }] = await db.select({ withInspection: sql<number>`count(*) filter (where inspection is not null)::int` }).from(cars);
    const [{ withRecord }] = await db.select({ withRecord: sql<number>`count(*) filter (where record is not null)::int` }).from(cars);
    res.json({ cars: total, withInspection, withRecord, tenants: list });
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
    const logoUrl = b.logoUrl ? String(b.logoUrl).trim() : null;
    const domain = b.domain ? String(b.domain).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "") : null;
    await db
      .insert(tenants)
      .values({ slug, name, filter, adminKey, whatsapp, logoUrl, domain })
      .onConflictDoUpdate({ target: tenants.slug, set: { name, filter, whatsapp, logoUrl, domain } });
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

router.post("/backfill-reports", auth, async (req, res) => {
  try { res.json(await backfillReports(num(req.body?.limit) ?? 60)); }
  catch (err) { res.status(500).json({ error: String((err as Error).message ?? err) }); }
});

router.get("/synced-with-reports", auth, async (_req, res) => {
  try {
    const { pool } = await import("@workspace/db");
    const r = await pool.query(`
      SELECT encar_id, manufacturer, model, badge, year, price_manwon,
             (inspection IS NOT NULL) AS has_inspection, (record IS NOT NULL) AS has_record,
             jsonb_array_length(COALESCE(inspection->'parts','[]'::jsonb)) AS damaged_parts
      FROM cars
      WHERE raw ? '_syncWarnings' AND status = 'available' AND (inspection IS NOT NULL OR record IS NOT NULL)
      ORDER BY damaged_parts DESC, encar_id DESC LIMIT 12`);
    res.json(r.rows.map((x: any) => ({ id: x.encar_id, car: `${x.model ?? ""} ${x.badge ?? ""} ${x.year ?? ""}`.trim(), price: x.price_manwon, inspection: x.has_inspection, record: x.has_record, damagedParts: x.damaged_parts, link: `/cars/${x.encar_id}` })));
  } catch (err) { res.status(500).json({ error: String((err as Error).message ?? err) }); }
});

router.get("/probe-search", auth, async (_req, res) => {
  try { res.json(await probeSearchFilters()); }
  catch (err) { res.status(500).json({ error: String((err as Error).message ?? err) }); }
});

router.get("/filter-test", auth, async (_req, res) => {
  const FUEL: Record<string, string> = { gasoline: "가솔린", diesel: "디젤", electric: "전기", hybrid: "전기" };
  const cases: Array<{ name: string; p: any; check?: (c: any) => string | null }> = [
    { name: "brand=hyundai", p: { brand: "hyundai" }, check: (c) => (c.Manufacturer === "현대" ? null : `maker ${c.Manufacturer}`) },
    { name: "brand=bmw", p: { brand: "bmw" }, check: (c) => (c.Manufacturer === "BMW" ? null : `maker ${c.Manufacturer}`) },
    { name: "model=sonata", p: { model: "sonata" }, check: (c) => (String(c.Model).includes("쏘나타") ? null : `model ${c.Model}`) },
    { name: "year 2020-2022", p: { yearFrom: 2020, yearTo: 2022 }, check: (c) => { const y = parseInt(String(c.FormYear ?? c.Year).slice(0, 4), 10); return y >= 2020 && y <= 2022 ? null : `year ${y}`; } },
    { name: "year from 2023", p: { yearFrom: 2023 }, check: (c) => { const y = parseInt(String(c.FormYear ?? c.Year).slice(0, 4), 10); return y >= 2023 ? null : `year ${y}`; } },
    { name: "year to 2015", p: { yearTo: 2015 }, check: (c) => { const y = parseInt(String(c.FormYear ?? c.Year).slice(0, 4), 10); return y <= 2015 ? null : `year ${y}`; } },
    { name: "price 1000-2000", p: { priceMin: 1000, priceMax: 2000 }, check: (c) => (c.Price >= 1000 && c.Price <= 2000 ? null : `price ${c.Price}`) },
    { name: "price max 800", p: { priceMax: 800 }, check: (c) => (c.Price <= 800 ? null : `price ${c.Price}`) },
    { name: "price min 5000", p: { priceMin: 5000 }, check: (c) => (c.Price >= 5000 ? null : `price ${c.Price}`) },
    { name: "mileage max 30000", p: { mileageMax: 30000 }, check: (c) => (c.Mileage <= 30000 ? null : `km ${c.Mileage}`) },
    { name: "fuel=diesel", p: { fuelType: "diesel" }, check: (c) => (String(c.FuelType).includes("디젤") ? null : `fuel ${c.FuelType}`) },
    { name: "fuel=electric", p: { fuelType: "electric" }, check: (c) => (String(c.FuelType).includes("전기") ? null : `fuel ${c.FuelType}`) },
    { name: "fuel=gasoline", p: { fuelType: "gasoline" }, check: (c) => (String(c.FuelType).includes("가솔린") ? null : `fuel ${c.FuelType}`) },
    { name: "fuel=hybrid", p: { fuelType: "hybrid" }, check: (c) => (String(c.FuelType).includes("+") ? null : `fuel ${c.FuelType}`) },
    { name: "fuel=lpg", p: { fuelType: "lpg" }, check: (c) => (String(c.FuelType).includes("LPG") ? null : `fuel ${c.FuelType}`) },
    { name: "transmission=auto", p: { transmission: "auto" }, check: (c) => (String(c.Transmission ?? "").includes("오토") ? null : `trans ${c.Transmission}`) },
    { name: "transmission=manual", p: { transmission: "manual" }, check: (c) => (String(c.Transmission ?? "").includes("수동") ? null : `trans ${c.Transmission}`) },
    { name: "color=white", p: { color: "white" } },
    { name: "color=black", p: { color: "black" } },
    { name: "sunroof", p: { sunroof: true }, check: (c) => (Array.isArray(c.Options) && c.Options.length ? null : "no options array") },
    { name: "bodyType=suv", p: { bodyType: "suv" } },
    { name: "combo: kia + 2019-2022 + 1500-3000 + diesel + auto", p: { brand: "kia", yearFrom: 2019, yearTo: 2022, priceMin: 1500, priceMax: 3000, fuelType: "diesel", transmission: "auto" },
      check: (c) => { const y = parseInt(String(c.FormYear ?? c.Year).slice(0, 4), 10); const bad = [c.Manufacturer !== "기아" && "maker", (y < 2019 || y > 2022) && "year", (c.Price < 1500 || c.Price > 3000) && "price", !String(c.FuelType).includes("디젤") && "fuel", !String(c.Transmission ?? "").includes("오토") && "trans"].filter(Boolean); return bad.length ? bad.join(",") : null; } },
    { name: "combo: sonata + year>=2018 + km<=80000", p: { model: "sonata", yearFrom: 2018, mileageMax: 80000 }, check: (c) => { const y = parseInt(String(c.FormYear ?? c.Year).slice(0, 4), 10); const bad = [!String(c.Model).includes("쏘나타") && "model", y < 2018 && "year", c.Mileage > 80000 && "km"].filter(Boolean); return bad.length ? bad.join(",") : null; } },
  ];
  const out: any[] = [];
  for (const t of cases) {
    try {
      const { q } = buildEncarQuery(t.p);
      const r = await searchList(q, 0, 20);
      if (!r.ok || !r.json) { out.push({ test: t.name, result: "FAIL_HTTP", status: r.status, q }); continue; }
      const rows: any[] = r.json.SearchResults ?? [];
      const bad = t.check ? rows.map((c) => t.check!(c)).filter(Boolean) : [];
      out.push({ test: t.name, result: rows.length === 0 ? "EMPTY" : bad.length ? "MISMATCH" : "OK", total: r.json.Count, checked: rows.length, wrong: bad.length, sampleWrong: bad.slice(0, 3), sample: rows[0] ? `${rows[0].Manufacturer} ${rows[0].Model} ${rows[0].FormYear} ${rows[0].Price}man ${rows[0].Mileage}km ${rows[0].FuelType}` : null, q });
    } catch (e) { out.push({ test: t.name, result: "ERROR", error: String((e as Error).message) }); }
    await new Promise((r) => setTimeout(r, 250));
  }
  const bad = out.filter((o) => o.result !== "OK");
  res.json({ summary: `${out.length - bad.length}/${out.length} OK`, problems: bad.map((o) => ({ test: o.test, result: o.result, q: o.q, sampleWrong: o.sampleWrong, status: o.status })), all: out });
});

router.get("/probe/:id", auth, async (req, res) => {
  res.json(await probeCar(String(req.params.id).replace(/\D/g, "")));
});

export default router;

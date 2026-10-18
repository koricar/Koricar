/**
 * Create or update a dealer (tenant).
 * Usage: pnpm --filter @workspace/api-server tenant:create <slug> "<name>" [--makes=현대,기아] [--yearMin=2018] [--yearMax=2025]
 *        [--priceMin=500] [--priceMax=4000] [--whatsapp=+8210...] [--domain=cars.example.com] [--currency=USD]
 * Prices are in 만원 (10,000 KRW). Prints the dealer's admin key (shown once).
 */
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool, tenants } from "@workspace/db";

async function main() {
  const [slug, name, ...rest] = process.argv.slice(2);
  if (!slug || !name) throw new Error('usage: tenant:create <slug> "<name>" [--makes=..] [--yearMin=..] ...');
  const o: Record<string, string> = {};
  for (const a of rest) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  }
  const n = (k: string) => (o[k] ? parseInt(o[k], 10) : undefined);
  const filter = {
    makes: o.makes ? o.makes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    yearMin: n("yearMin"),
    yearMax: n("yearMax"),
    priceMinManwon: n("priceMin"),
    priceMaxManwon: n("priceMax"),
  };
  const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  const adminKey = existing?.adminKey ?? randomBytes(18).toString("hex");
  await db
    .insert(tenants)
    .values({ slug, name, filter, adminKey, whatsapp: o.whatsapp, domain: o.domain, currency: o.currency ?? "USD" })
    .onConflictDoUpdate({
      target: tenants.slug,
      set: { name, filter, whatsapp: o.whatsapp, domain: o.domain, ...(o.currency ? { currency: o.currency } : {}) },
    });
  console.log(`tenant "${slug}" saved. admin key: ${adminKey}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

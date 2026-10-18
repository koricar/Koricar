/**
 * Import an Apify Encar dataset (JSON array) into the `cars` table.
 * Usage: pnpm --filter @workspace/api-server import:apify ./dataset.json [--mark-missing]
 *
 * --mark-missing: cars NOT in this file are set to "unavailable". Only use it when the file
 * is a full pull of the same filter (not an incremental one).
 */
import { readFileSync } from "node:fs";
import { notInArray } from "drizzle-orm";
import { db, pool, cars } from "@workspace/db";

type Raw = Record<string, any>;

const pick = (o: Raw, ...keys: string[]) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
  return undefined;
};
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const date = (v: unknown) => {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

function map(r: Raw) {
  const encarId = String(pick(r, "vehicleId", "id", "carId") ?? "");
  if (!encarId) return null;
  // price: Encar uses 만원; some actors give priceManwon, others raw KRW
  let price = num(pick(r, "priceManwon", "price", "sellingPrice"));
  if (price !== null && price > 100000) price = Math.round(price / 10000);
  let year = num(pick(r, "year", "formYear"));
  if (!year) {
    const ym = num(pick(r, "yearMonth", "modelYear"));
    year = ym ? (ym > 9999 ? Math.floor(ym / 100) : ym) : null;
  }
  const photos = pick(r, "photoUrls", "photos", "images");
  const options = pick(r, "optionsStandard", "options");
  return {
    encarId,
    vin: pick(r, "vin") ?? null,
    manufacturer: pick(r, "manufacturer", "manufacturerName", "make") ?? null,
    model: pick(r, "model", "modelName", "modelGroupName") ?? null,
    badge: pick(r, "badge", "gradeName", "grade", "badgeDetail") ?? null,
    year,
    mileage: num(pick(r, "mileage")),
    priceManwon: price === null ? null : Math.round(price),
    fuel: pick(r, "fuel", "fuelName", "fuelType") ?? null,
    transmission: pick(r, "transmission", "transmissionName") ?? null,
    color: pick(r, "color", "colorName") ?? null,
    region: pick(r, "region", "officeCityState", "location") ?? null,
    photoUrls: Array.isArray(photos) ? photos.map(String) : [],
    options: Array.isArray(options) ? options.map(String) : [],
    record: r.record ?? null,
    inspection: r.inspection ?? null,
    diagnosis: r.diagnosis ?? null,
    raw: r,
    status: "available",
    encarModifiedAt: date(pick(r, "modifyDateTime", "modifiedDate")),
    lastSyncedAt: new Date(),
  };
}

async function main() {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) throw new Error("usage: import-apify <dataset.json> [--mark-missing]");
  const items: Raw[] = JSON.parse(readFileSync(file, "utf8"));
  const rows = items.map(map).filter((x): x is NonNullable<ReturnType<typeof map>> => !!x);

  let inserted = 0;
  for (const row of rows) {
    await db
      .insert(cars)
      .values(row)
      .onConflictDoUpdate({
        target: cars.encarId,
        set: { ...row, lastSyncedAt: new Date() },
      });
    inserted++;
  }
  console.log(`upserted ${inserted}/${items.length} cars`);

  if (flags.includes("--mark-missing") && rows.length) {
    const res = await db
      .update(cars)
      .set({ status: "unavailable" })
      .where(notInArray(cars.encarId, rows.map((r) => r.encarId)));
    console.log("marked missing cars unavailable", res.rowCount ?? "");
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

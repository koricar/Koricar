import { notInArray } from "drizzle-orm";

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

export function mapApifyItem(r: Raw) {
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


/** Upsert Apify items into `cars`. Loads @workspace/db lazily (it throws without DATABASE_URL). */
export async function importApifyItems(items: Raw[], markMissing = false) {
  const { db, cars } = await import("@workspace/db");
  const rows = items.map(mapApifyItem).filter((x): x is NonNullable<ReturnType<typeof mapApifyItem>> => !!x);
  for (const row of rows) {
    await db.insert(cars).values(row).onConflictDoUpdate({ target: cars.encarId, set: { ...row, lastSyncedAt: new Date() } });
  }
  let markedUnavailable = 0;
  if (markMissing && rows.length) {
    const res = await db.update(cars).set({ status: "unavailable" }).where(notInArray(cars.encarId, rows.map((r) => r.encarId)));
    markedUnavailable = res.rowCount ?? 0;
  }
  return { received: items.length, upserted: rows.length, markedUnavailable };
}

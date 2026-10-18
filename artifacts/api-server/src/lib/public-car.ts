import type { Car } from "@workspace/db";

/**
 * Converts a stored Encar car into what a dealer's customers may see.
 * Never exposes: plate number, full VIN, dealer id/address/description (may hold phone numbers),
 * inspector name, inspection record number, raw payload.
 */
export function toPublicCar(c: Car, opts: { detail?: boolean } = {}) {
  const base = {
    id: c.id,
    encarId: c.encarId,
    manufacturer: c.manufacturer,
    model: c.model,
    badge: c.badge,
    year: c.year,
    mileage: c.mileage,
    priceManwon: c.priceManwon,
    fuel: c.fuel,
    transmission: c.transmission,
    color: c.color,
    region: c.region,
    status: c.status,
    thumbnail: c.photoUrls?.[0] ?? null,
    updatedAt: c.lastSyncedAt,
    encarUrl: `https://fem.encar.com/cars/detail/${c.encarId}`,
    // last 4 characters only, enough for a dealer to recognise a car without exposing the full VIN
    vinTail: c.vin ? c.vin.slice(-4) : null,
  };
  if (!opts.detail) return base;
  return {
    ...base,
    photos: c.photoUrls ?? [],
    options: c.options ?? [],
    record: scrubRecord(c.record),
    inspection: scrubInspection(c.inspection),
    diagnosis: c.diagnosis ?? null,
  };
}

function scrubRecord(r: unknown) {
  if (!r || typeof r !== "object") return null;
  const { carNo: _carNo, ...rest } = r as Record<string, unknown>;
  return rest;
}

function scrubInspection(i: unknown) {
  if (!i || typeof i !== "object") return null;
  const { inspectorName: _n, recordNo: _r, ...rest } = i as Record<string, unknown>;
  return rest;
}

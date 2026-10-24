# Dealer catalog (Tectop-style) — status & recovery notes

Branch: `feat/dealer-catalog-db` (not merged to master yet). Deploy: Render https://koricar-ba7l.onrender.com, DB: Neon Postgres.
Dealer site: `/?dealer=<slug>` (or custom domain). Admin UI: `/api/admin/ui` (needs `ADMIN_TOKEN`, header `x-admin-token`).

## How it works
- Data comes free from unofficial Encar endpoints (no Apify): list `api.encar.com/search/car/list/general`, detail `/v1/readside/vehicle/{id}`, inspection `/v1/readside/inspection/vehicle/{vehicleId}`, record `/v1/readside/record/vehicle/{vehicleId}/open`.
- Search is LIVE against Encar by default (`source=db` for DB). "No accident" = Encar `Accident.N` + verified against record (my==0 && other==0).
- Cars are stored in DB on sync or on first open (`importOnDemand`). Per-dealer scoping through `tenant`.
- Public data never exposes plate, full VIN, inspector name, inspection record number.

## Key lessons (read before debugging)
1. **Inspection/insurance "not available" bug**: Encar re-lists cars under a NEW listing id; reports are keyed by the underlying *vehicle id* (found in photo path `/carpicture../pic4169/41699821_006.jpg` → `41699821`, or `vehicleId`). Always query reports with that id (`fetchReports` + `vehicleIdFromDetail`), fall back to listing id. Fixed in commit a9bfee0.
2. Transient Encar failures (429/5xx/timeouts) must never be stored as "no report": `getJson` retries 3x; opening a stored car without inspection/record re-fetches (throttled 5 min, `reportStatus` in the response shows last HTTP statuses).
3. Encar filter syntax: use `Year.range(a..b)`, `Price.range(a..b)`, `Mileage.range(0..n)`. Year filter applies to registration year, not model year (FormYear), so ±1 year differences are Encar behavior. List rows lack Transmission/Options fields.
4. Live detail include list must not contain CONTENTS/PARTNERSHIP (400).
5. Damage diagram: coordinates are % of Encar's 640x606 image; body parts → view 1 (`diagramPosition`), frame parts (members, pillars, floors, panels) → view 2 (`diagramPositionInner`); `spreadMarkers` avoids overlaps. UI never says "clean" when data is unknown (amber note, dashes).
6. The dev sandbox cannot reach Encar or Render (proxy allowlist) — verify with the admin tools below, not locally.

## Admin tools (`/api/admin/ui`)
sync, learn-options, backfill-reports ("تعبئة التقارير الناقصة", press repeatedly), probe-search, filter-test (23 checks, expect all OK), `/probe/:id` (raw Encar responses for one car).
Debug a car: `/api/cars/<id>` → field `reportStatus`.

## Open items
- Run backfill several times after deploy so old stored cars get reports.
- Replace remaining "فحص معتمد" marketing texts (home hero/chip, about, deal-of-day) with honest wording.
- Dealer-mode polish (hide Koricar marketing), create real dealer tenants, custom domains (Render + DNS).
- Rotate leaked Neon password and update `DATABASE_URL`; remove `AUTOBELL_EMAIL/PASSWORD` env vars.
- Daily auto-sync; untranslated part names in damage table; merge branch to master after testing.

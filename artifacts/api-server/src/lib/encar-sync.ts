import { and, eq, inArray } from "drizzle-orm";
import { importApifyItems } from "./import-cars";

/**
 * Incremental Encar sync (no paid scraper): list -> diff vs DB -> fetch detail/inspection/record only for NEW cars.
 * Unofficial endpoints; every call is defensive so a blocked/changed endpoint degrades instead of corrupting data.
 */
const API = "https://api.encar.com";
const PHOTO = "https://ci.encar.com";
const HEADERS = { Referer: "https://www.encar.com", "User-Agent": "Mozilla/5.0", Accept: "application/json, text/plain, */*" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, referer?: string) {
  const resp = await fetch(url, { headers: { ...HEADERS, ...(referer ? { Referer: referer } : {}) }, signal: AbortSignal.timeout(12000) });
  const text = await resp.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { ok: resp.ok, status: resp.status, json, text: text.slice(0, 300) };
}

export interface SyncFilter { makes?: string[]; yearMin?: number; yearMax?: number; priceMinManwon?: number; priceMaxManwon?: number }

export function buildListQuery(f: SyncFilter, make?: string): string {
  let q = "(And.Hidden.N._.CarType.A.";
  if (make) q += `_.Manufacturer.${make}.`;
  if (f.yearMin || f.yearMax) q += `_.Year.${f.yearMin ? `${f.yearMin}00` : ""}..${f.yearMax ? `${f.yearMax}99` : ""}.`;
  if (f.priceMinManwon || f.priceMaxManwon) q += `_.Price.${f.priceMinManwon ?? ""}..${f.priceMaxManwon ?? ""}.`;
  return q + ")";
}

const STATUS_KR: Record<string, string> = { X: "교환", W: "판금/용접", C: "부식", A: "흠집", U: "요철", T: "손상" };

export function mapInspection(j: any) {
  if (!j) return null;
  const m = j.master ?? {};
  const d = m.detail ?? {};
  const parts: any[] = [];
  for (const arr of [j.outers, j.inners]) {
    for (const p of Array.isArray(arr) ? arr : []) {
      const st = Array.isArray(p?.statusTypes) ? p.statusTypes : [];
      if (!st.length) continue;
      parts.push({
        part: p?.type?.title ?? "", partCode: p?.type?.code ?? "",
        statuses: st.map((s: any) => STATUS_KR[s?.code] ?? s?.title ?? s?.code),
        ranks: Array.isArray(p?.attributes) ? p.attributes : [],
      });
    }
  }
  const titles = (v: any) => (Array.isArray(v) ? v.map((t: any) => t?.title ?? t?.code).filter(Boolean) : []);
  const serious = titles(d.seriousTypes);
  return {
    accident: !!(m.accdient ?? m.accident), simpleRepair: !!m.simpleRepair,
    flooded: serious.some((t: string) => t.includes("침수")),
    recordNo: d.recordNo ?? m.supplyNum ?? null,
    inspectionDate: d.issueDate ?? (typeof m.registrationDate === "string" ? m.registrationDate.slice(0, 10).replace(/-/g, "") : null),
    validityStartDate: d.validityStartDate ?? null, validityEndDate: d.validityEndDate ?? null,
    firstRegistrationDate: d.firstRegistrationDate ?? null, mileage: d.mileage ?? null,
    boardState: d.boardStateType?.title ?? null, carState: d.carStateType?.title ?? d.mileageStateType?.title ?? null,
    tuning: !!d.tuning, recall: !!d.recall, seriousTypes: serious, usageChangeTypes: titles(d.usageChangeTypes),
    parts, partSummary: {}, repairNeeded: [], innerIssues: [], inspectionPhotoUrls: [],
  };
}

export function mapRecord(j: any, carNo: string | null) {
  if (!j || j.openData === false) return null;
  return {
    carNo: carNo ?? j.carNo ?? null, firstDate: j.firstDate ?? j.regDate ?? null,
    myAccidentCnt: j.myAccidentCnt ?? 0, otherAccidentCnt: j.otherAccidentCnt ?? 0,
    myAccidentCost: j.myAccidentCost ?? 0, otherAccidentCost: j.otherAccidentCost ?? 0,
    ownerChangeCnt: j.ownerChangeCnt ?? 0, carNoChangeCnt: j.carNoChangeCnt ?? 0,
    robberCnt: j.robberCnt ?? 0, totalLossCnt: j.totalLossCnt ?? 0, floodTotalLossCnt: j.floodTotalLossCnt ?? 0,
    governmentUseCnt: j.government ?? j.governmentCnt ?? 0, businessUseCnt: j.business ?? j.businessCnt ?? 0,
    loanUseCnt: j.loan ?? j.loanCnt ?? 0,
    accidents: Array.isArray(j.accidents) ? j.accidents.map((a: any) => ({
      date: a.date, insuranceBenefit: a.insuranceBenefit ?? 0, partCost: a.partCost ?? 0, laborCost: a.laborCost ?? 0, paintingCost: a.paintingCost ?? 0,
    })) : [],
  };
}

const optionNames = new Map<string, string>(); // code -> Korean name, learned at runtime
async function resolveStandardOptions(id: string, codes: string[], warnings: string[]): Promise<string[]> {
  if (!codes.length) return [];
  if (!codes.some((c) => /^\d+$/.test(c))) return codes; // already names
  if (!codes.every((c) => optionNames.has(c))) {
    try {
      const r = await getJson(`${API}/v1/readside/vehicles/car/${id}/options/standard`, `https://fem.encar.com/cars/detail/${id}`);
      const arr = Array.isArray(r.json) ? r.json : Array.isArray(r.json?.options) ? r.json.options : [];
      for (const o of arr) {
        const cd = o?.optionCd ?? o?.code, nm = o?.optionName ?? o?.name ?? o?.title;
        if (cd && nm) optionNames.set(String(cd), String(nm));
      }
      if (!r.ok) warnings.push(`options/standard ${r.status}`);
    } catch (e) { warnings.push(`options/standard ${(e as Error).message}`); }
  }
  const names = codes.map((c) => optionNames.get(c)).filter((x): x is string => !!x);
  if (names.length < codes.length) warnings.push(`options: ${codes.length - names.length}/${codes.length} codes unresolved`);
  return names;
}

/** Fetch one car fully and return it in the Apify item shape that importApifyItems understands. */
export async function fetchFullCar(id: string, listItem?: any) {
  const inc = ["CATEGORY", "SPEC", "PHOTOS", "ADVERTISEMENT", "MANAGE", "OPTIONS", "CONDITION", "CONTACT"].join(",");
  const det = await getJson(`${API}/v1/readside/vehicle/${id}?include=${inc}`, `https://fem.encar.com/cars/detail/${id}`);
  if (!det.ok || !det.json) throw new Error(`detail HTTP ${det.status}`);
  const d = det.json;
  const cat = d.category ?? {}, spec = d.spec ?? {}, ad = d.advertisement ?? {}, cond = d.condition ?? {};
  const carNo: string | null = d.vehicleNo ?? null;
  const warnings: string[] = [];

  let inspection: any = null, record: any = null;
  {
    try { const r = await getJson(`${API}/v1/readside/inspection/vehicle/${id}`, `https://fem.encar.com/cars/detail/${id}`); if (r.ok) inspection = mapInspection(r.json); else warnings.push(`inspection ${r.status}`); } catch (e) { warnings.push(`inspection ${(e as Error).message}`); }
  }
  try {
    const q = carNo ? `?vehicleNo=${encodeURIComponent(carNo)}` : "";
    const r = await getJson(`${API}/v1/readside/record/vehicle/${id}/open${q}`, `https://fem.encar.com/cars/detail/${id}`);
    if (r.ok) record = mapRecord(r.json, carNo); else warnings.push(`record ${r.status}`);
  } catch (e) { warnings.push(`record ${(e as Error).message}`); }

  const opts = d.options ?? {};
  const optionsStandard = await resolveStandardOptions(id, Array.isArray(opts.standard) ? opts.standard.map(String) : [], warnings);
  const photos = (Array.isArray(d.photos) ? d.photos : []).map((p: any) => (p?.path ? `${PHOTO}${p.path}` : null)).filter(Boolean);
  const item = {
    vehicleId: String(id), vin: d.vin ?? null, manufacturer: cat.manufacturerName ?? listItem?.Manufacturer,
    modelGroup: cat.modelGroupName, modelName: cat.modelName ?? listItem?.Model, gradeName: cat.gradeName ?? listItem?.Badge,
    yearMonth: cat.yearMonth, formYear: cat.formYear ?? listItem?.FormYear,
    priceManwon: ad.price ?? listItem?.Price, mileage: spec.mileage ?? listItem?.Mileage,
    fuelName: spec.fuelName ?? listItem?.FuelType, transmissionName: spec.transmissionName ?? listItem?.Transmission,
    displacement: spec.displacement, bodyName: spec.bodyName, colorName: spec.colorName, seatCount: spec.seatCount,
    region: d.contact?.address ?? listItem?.OfficeCityState, modifyDateTime: ad.modifyDateTime ?? ad.modifiedDate ?? null,
    optionsStandard, optionsChoice: Array.isArray(opts.choice) ? opts.choice : [],
    photoUrls: photos.length ? photos : (listItem?.Photos ?? []).map((p: any) => `${PHOTO}${p.location}`),
    record, inspection, diagnosis: null, _syncWarnings: warnings,
  };
  return item;
}

export const syncState: { running: boolean; startedAt?: string; finishedAt?: string; log: string[]; result?: any } = { running: false, log: [] };
const note = (s: string) => { syncState.log.push(`${new Date().toISOString().slice(11, 19)} ${s}`); if (syncState.log.length > 200) syncState.log.shift(); };

export async function runSync(opts: { maxNew?: number; maxPages?: number; markSold?: boolean } = {}) {
  if (syncState.running) return;
  const maxNew = opts.maxNew ?? 40, maxPages = opts.maxPages ?? 20;
  Object.assign(syncState, { running: true, startedAt: new Date().toISOString(), finishedAt: undefined, log: [], result: undefined });
  const result = { listed: 0, new: 0, fetched: 0, failed: 0, priceUpdated: 0, markedSold: 0, deferred: 0, complete: true };
  try {
    const { db, cars, tenants } = await import("@workspace/db");
    const tl = await db.select().from(tenants).where(eq(tenants.active, true));
    const filters: SyncFilter[] = tl.map((t: any) => t.filter ?? {});
    if (!filters.length) throw new Error("no active tenants");

    const listed = new Map<string, any>();
    for (const f of filters) {
      for (const make of f.makes?.length ? f.makes : [undefined]) {
        const q = buildListQuery(f, make);
        for (let page = 0; page < maxPages; page++) {
          const url = `${API}/search/car/list/general?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(`|ModifiedDate|${page * 100}|100`)}`;
          const r = await getJson(url);
          if (!r.ok || !r.json) throw new Error(`list HTTP ${r.status} ${r.text}`);
          const rows: any[] = r.json.SearchResults ?? [];
          for (const c of rows) listed.set(String(c.Id), c);
          note(`${make ?? "all"} page ${page + 1}: ${rows.length}`);
          if (rows.length < 100) break;
          if (page === maxPages - 1) result.complete = false;
          await sleep(300);
        }
      }
    }
    result.listed = listed.size;

    const existing = await db.select({ encarId: cars.encarId, price: cars.priceManwon, mileage: cars.mileage, status: cars.status, hasInsp: cars.inspection }).from(cars);
    const have = new Map(existing.map((e: any) => [e.encarId, e]));

    // price/mileage changes + relist
    for (const [id, c] of listed) {
      const e: any = have.get(id);
      if (!e) continue;
      const price = Math.round(Number(c.Price ?? 0)) || null, mileage = Number(c.Mileage ?? 0) || null;
      if (e.price !== price || e.mileage !== mileage || e.status !== "available") {
        await db.update(cars).set({ priceManwon: price, mileage, status: "available", lastSyncedAt: new Date() }).where(eq(cars.encarId, id));
        result.priceUpdated++;
      }
    }

    // sold / removed (only when the whole list was scanned)
    if (opts.markSold !== false && result.complete) {
      const gone = existing.filter((e: any) => e.status === "available" && !listed.has(e.encarId)).map((e: any) => e.encarId);
      if (gone.length && gone.length < existing.length * 0.5) {
        await db.update(cars).set({ status: "unavailable" }).where(and(inArray(cars.encarId, gone)));
        result.markedSold = gone.length;
      } else if (gone.length) note(`skipped marking ${gone.length} sold (looks like a bad scan)`);
    }

    const fresh = [...listed.keys()].filter((id) => !have.has(id));
    result.new = fresh.length;
    for (const id of fresh.slice(0, maxNew)) {
      try {
        const item = await fetchFullCar(id, listed.get(id));
        await importApifyItems([item], false);
        result.fetched++;
        if (item._syncWarnings.length) note(`${id}: ${item._syncWarnings.join(", ")}`);
      } catch (e) { result.failed++; note(`${id} failed: ${(e as Error).message}`); }
      await sleep(500);
    }
    result.deferred = Math.max(0, fresh.length - maxNew);
    note(`done: ${JSON.stringify(result)}`);
    syncState.result = result;
  } catch (e) {
    note(`ERROR ${(e as Error).message}`);
    syncState.result = { ...result, error: (e as Error).message };
  } finally {
    syncState.running = false; syncState.finishedAt = new Date().toISOString();
  }
}

/** Debug helper: shows HTTP status + shape of each endpoint for one car. */
export async function probeCar(id: string) {
  const out: any = {};
  const ref = `https://fem.encar.com/cars/detail/${id}`;
  const inc = "CATEGORY,SPEC,PHOTOS,ADVERTISEMENT,MANAGE,OPTIONS,CONDITION,CONTACT";
  const targets: Record<string, string> = {
    detail: `${API}/v1/readside/vehicle/${id}?include=${inc}`,
    inspection: `${API}/v1/readside/inspection/vehicle/${id}`,
    record: `${API}/v1/readside/record/vehicle/${id}/open`,
    optionsStandard: `${API}/v1/readside/vehicles/car/${id}/options/standard`,
  };
  for (const [k, url] of Object.entries(targets)) {
    try {
      const r = await getJson(url, ref);
      out[k] = { status: r.status, keys: r.json ? Object.keys(r.json) : null, sample: r.json ? JSON.stringify(r.json).slice(0, 700) : r.text };
      if (k === "detail" && r.json) out.optionsSample = JSON.stringify(r.json.options ?? null).slice(0, 400);
      if (k === "inspection" && r.json) { out.outersSample = JSON.stringify((r.json.outers ?? []).slice(0, 3)).slice(0, 700); out.innersSample = JSON.stringify((r.json.inners ?? []).slice(0, 2)).slice(0, 500); out.masterDetail = JSON.stringify(r.json.master?.detail ?? null).slice(0, 900); }
      if (k === "record" && r.json) out.accidentsSample = JSON.stringify((r.json.accidents ?? []).slice(0, 2)).slice(0, 500);
    } catch (e) { out[k] = { error: (e as Error).message }; }
  }
  return out;
}

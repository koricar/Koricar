import { and, eq, inArray } from "drizzle-orm";
import { importApifyItems } from "./import-cars";

/**
 * Incremental Encar sync (no paid scraper): list -> diff vs DB -> fetch detail/inspection/record only for NEW cars.
 * Unofficial endpoints; every call is defensive so a blocked/changed endpoint degrades instead of corrupting data.
 */
const API = "https://api.encar.com";
const PHOTO = "https://ci.encar.com";
const HEADERS = { Referer: "https://www.encar.com", "User-Agent": "Mozilla/5.0", Accept: "application/json, text/plain, */*" };
const PAGE = 50;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, referer?: string) {
  const resp = await fetch(url, { headers: { ...HEADERS, ...(referer ? { Referer: referer } : {}) }, signal: AbortSignal.timeout(12000) });
  const text = await resp.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { ok: resp.ok, status: resp.status, json, text: text.slice(0, 300) };
}

export interface SyncFilter { makes?: string[]; yearMin?: number; yearMax?: number; priceMinManwon?: number; priceMaxManwon?: number }

const DOMESTIC_MAKES = new Set(["현대", "기아", "제네시스", "쌍용", "KG모빌리티", "르노코리아(삼성)", "르노삼성", "쉐보레(GM대우)", "쉐보레", "대우"]);

export function buildListQuery(f: SyncFilter, make?: string, withRanges = true): string {
  let q = "(And.Hidden.N." + (make && DOMESTIC_MAKES.has(make) ? "_.CarType.Y." : "");
  if (make) q += `_.Manufacturer.${make}.`;
  if (withRanges) {
    if (f.yearMin || f.yearMax) q += `_.Year.range(${f.yearMin ?? 1990}00..${f.yearMax ?? 2099}99).`;
    if (f.priceMinManwon || f.priceMaxManwon) q += `_.Price.range(${f.priceMinManwon ?? 0}..${f.priceMaxManwon ?? 99999}).`;
  }
  return q + ")";
}

/** Client-side check so results are correct even when the query could not carry the ranges. */
function matchesFilter(c: any, f: SyncFilter): boolean {
  const y = parseInt(String(c.FormYear ?? c.Year ?? "").slice(0, 4), 10);
  const price = Number(c.Price ?? 0);
  if (f.yearMin && y && y < f.yearMin) return false;
  if (f.yearMax && y && y > f.yearMax) return false;
  if (f.priceMinManwon && price < f.priceMinManwon) return false;
  if (f.priceMaxManwon && price > f.priceMaxManwon) return false;
  return true;
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
    flooded: !!d.waterlog || serious.some((t: string) => t.includes("침수")),
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

// Encar standard-option code -> Korean name (derived from matching Apify data against Encar codes; extend as new codes appear)
const KNOWN_OPTION_NAMES: Record<string, string> = {
  "002": "전자제어 서스펜션(ECS)",
  "003": "CD 플레이어",
  "029": "헤드램프(HID)",
  "059": "파워 전동 트렁크",
  "075": "헤드램프(LED)",
  "084": "패들 시프트",
  "087": "360도 어라운드 뷰",
  "091": "마사지 시트",
  "093": "커튼/블라인드(후방)",
  "095": "헤드업 디스플레이(HUD)",
  "001": "브레이크 잠김 방지(ABS)",
  "004": "앞좌석 AV 모니터",
  "005": "내비게이션",
  "006": "파워 도어록",
  "007": "파워 윈도우",
  "008": "파워 스티어링 휠",
  "010": "선루프",
  "014": "가죽시트",
  "015": "무선도어 잠금장치",
  "017": "알루미늄 휠",
  "019": "미끄럼 방지(TCS)",
  "020": "에어백(사이드)",
  "021": "전동시트(운전석)",
  "022": "열선시트(앞좌석)",
  "023": "자동 에어컨",
  "024": "전동접이 사이드 미러",
  "026": "에어백(운전석)",
  "027": "에어백(동승석)",
  "030": "ECM 룸미러",
  "031": "스티어링 휠 리모컨",
  "032": "주차감지센서(후방)",
  "033": "타이어 공기압센서(TPMS)",
  "034": "통풍시트(운전석)",
  "035": "전동시트(동승석)",
  "051": "메모리 시트(운전석)",
  "055": "차체자세 제어장치(ESC)",
  "056": "에어백(커튼)",
  "057": "스마트키",
  "058": "후방 카메라",
  "063": "열선시트(뒷좌석)",
  "068": "크루즈 컨트롤(일반)",
  "071": "AUX 단자",
  "072": "USB 단자",
  "074": "하이패스",
  "077": "통풍시트(동승석)",
  "079": "크루즈 컨트롤(어댑티브)",
  "081": "레인센서",
  "082": "열선 스티어링 휠",
  "083": "전동 조절 스티어링 휠",
  "085": "주차감지센서(전방)",
  "086": "후측방 경보 시스템",
  "088": "차선이탈 경보 시스템(LDWS)",
  "092": "커튼/블라인드(뒷좌석)",
  "094": "전자식 주차브레이크(EPB)",
  "096": "블루투스",
  "097": "오토 라이트"
};
const optionNames = new Map<string, string>(Object.entries(KNOWN_OPTION_NAMES));
export const unknownOptionCodes = new Set<string>();
async function resolveStandardOptions(_id: string, codes: string[], warnings: string[]): Promise<string[]> {
  if (!codes.length) return [];
  if (!codes.some((c) => /^\d+$/.test(c))) return codes; // already names
  const names = codes.map((c) => optionNames.get(c)).filter((x): x is string => !!x);
  const missing = codes.filter((c) => !optionNames.has(c));
  missing.forEach((c) => unknownOptionCodes.add(c));
  if (missing.length) warnings.push(`unknown option codes: ${missing.join(",")}`);
  return names;
}

/** Inspection + accident record for one car; records HTTP statuses so missing reports can be diagnosed. */
export async function fetchReports(id: string, carNo: string | null, warnings: string[] = []) {
  const ref = `https://fem.encar.com/cars/detail/${id}`;
  const status: Record<string, number | string> = {};
  let inspection: any = null, record: any = null;
  try {
    const r = await getJson(`${API}/v1/readside/inspection/vehicle/${id}`, ref);
    status.inspection = r.status;
    if (r.ok) inspection = mapInspection(r.json); else if (r.status !== 404) warnings.push(`inspection ${r.status}`);
  } catch (e) { status.inspection = "err"; warnings.push(`inspection ${(e as Error).message}`); }
  try {
    let r = await getJson(`${API}/v1/readside/record/vehicle/${id}/open`, ref);
    status.record = r.status;
    if (!r.ok && carNo) { r = await getJson(`${API}/v1/readside/record/vehicle/${id}/open?vehicleNo=${encodeURIComponent(carNo)}`, ref); status.recordWithNo = r.status; }
    if (r.ok) record = mapRecord(r.json, carNo); else if (r.status !== 404) warnings.push(`record ${r.status}`);
  } catch (e) { status.record = "err"; warnings.push(`record ${(e as Error).message}`); }
  return { inspection, record, status };
}

/** Re-fetch reports for stored cars that have neither inspection nor record. */
export async function backfillReports(limit = 60) {
  const { db, cars } = await import("@workspace/db");
  const rows = await db.select({ encarId: cars.encarId, vin: cars.vin, raw: cars.raw, inspection: cars.inspection, record: cars.record }).from(cars).where(eq(cars.status, "available"));
  const todo = (rows as any[]).filter((r) => !r.inspection && !r.record).slice(0, limit);
  const stats: Record<string, number> = { checked: 0, gotInspection: 0, gotRecord: 0, stillNone: 0 };
  const sample: any[] = [];
  for (const r of todo) {
    const rep = await fetchReports(r.encarId, null);
    stats.checked++;
    if (rep.inspection) stats.gotInspection++;
    if (rep.record) stats.gotRecord++;
    if (!rep.inspection && !rep.record) { stats.stillNone++; if (sample.length < 5) sample.push({ id: r.encarId, status: rep.status }); continue; }
    await db.update(cars).set({ inspection: rep.inspection ?? null, record: rep.record ?? null }).where(eq(cars.encarId, r.encarId));
    await sleep(300);
  }
  return { remainingWithoutReports: Math.max(0, (rows as any[]).filter((r) => !r.inspection && !r.record).length - stats.checked), ...stats, sampleStatuses: sample };
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

  const rep = await fetchReports(id, carNo, warnings);
  const inspection = rep.inspection, record = rep.record;

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
    optionsStandard, optionCodes: Array.isArray(opts.standard) ? opts.standard.map(String) : [], optionsChoice: Array.isArray(opts.choice) ? opts.choice : [],
    photoUrls: photos.length ? photos : (listItem?.Photos ?? []).map((p: any) => `${PHOTO}${p.location}`),
    record, inspection, diagnosis: null, reportStatus: rep.status, _syncWarnings: warnings,
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
        let withRanges = true;
        for (let page = 0; page < maxPages; page++) {
          const mk = (qq: string) => { const u = new URL(`${API}/search/car/list/general`); u.searchParams.set("count", "true"); u.searchParams.set("q", qq); u.searchParams.set("sr", `|ModifiedDate|${page * PAGE}|${PAGE}`); return u.toString(); };
          let q = buildListQuery(f, make, withRanges);
          let r = await getJson(mk(q));
          if (!r.ok && withRanges) {
            note(`list ${r.status} for q=${q}; retrying without year/price in query`);
            withRanges = false; q = buildListQuery(f, make, false); r = await getJson(mk(q));
          }
          if (!r.ok) {
            note(`list ${r.status} for q=${q}`);
            const q2 = q.replace("_.CarType.Y.", "");
            if (q2 !== q) { r = await getJson(mk(q2)); note(`retry without CarType: ${r.status}`); }
          }
          if (!r.ok || !r.json) throw new Error(`list HTTP ${r.status} q=${q} ${r.text}`);
          const rows: any[] = r.json.SearchResults ?? [];
          for (const c of rows) if (matchesFilter(c, f)) listed.set(String(c.Id), c);
          note(`${make ?? "all"} page ${page + 1}: ${rows.length} (kept ${listed.size})`);
          if (rows.length < PAGE) break;
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
    if (unknownOptionCodes.size) note(`unknown option codes seen: ${[...unknownOptionCodes].join(",")}`);
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

/**
 * Learn code -> name pairs from cars that came from Apify (names known) by fetching their codes from Encar.
 * Names are listed in code order, so positions line up; conflicts are reported and skipped.
 */
export async function learnOptionCodes() {
  const { db, cars } = await import("@workspace/db");
  const rows = await db.select({ encarId: cars.encarId, options: cars.options, raw: cars.raw }).from(cars);
  const learned: Record<string, string> = {};
  const conflicts: string[] = [];
  let used = 0, skipped = 0;
  for (const r of rows as any[]) {
    const names: string[] = Array.isArray(r.options) ? r.options : [];
    if (!names.length || r.raw?.optionCodes) continue; // only Apify-origin cars (no stored codes)
    try {
      const det = await getJson(`${API}/v1/readside/vehicle/${r.encarId}?include=OPTIONS`, `https://fem.encar.com/cars/detail/${r.encarId}`);
      const codes: string[] = det.json?.options?.standard ?? [];
      if (!det.ok || codes.length !== names.length) { skipped++; continue; }
      used++;
      codes.forEach((c, i) => {
        if (learned[c] && learned[c] !== names[i]) conflicts.push(`${c}: ${learned[c]} vs ${names[i]}`);
        else learned[c] = names[i];
      });
    } catch { skipped++; }
    await sleep(250);
  }
  for (const [c, n] of Object.entries(learned)) if (!conflicts.some((x) => x.startsWith(c + ":"))) optionNames.set(c, n);
  const fresh = Object.fromEntries(Object.entries(learned).filter(([c]) => !(c in KNOWN_OPTION_NAMES)));
  return { carsUsed: used, carsSkipped: skipped, newCodes: fresh, conflicts };
}

/** Re-resolve option names for synced cars whose raw.optionCodes were stored, using the current dictionary. */
export async function reresolveOptions() {
  const { db, cars } = await import("@workspace/db");
  const rows = await db.select({ encarId: cars.encarId, raw: cars.raw }).from(cars);
  let updated = 0;
  for (const r of rows as any[]) {
    const codes: string[] = r.raw?.optionCodes;
    if (!Array.isArray(codes) || !codes.length) continue;
    const names = codes.map((c) => optionNames.get(c)).filter((x): x is string => !!x);
    await db.update(cars).set({ options: names }).where(eq(cars.encarId, r.encarId));
    updated++;
  }
  return { updated, unknownCodes: [...unknownOptionCodes].filter((c) => !optionNames.has(c)) };
}

/** Tries candidate Encar query filters (accident-free, has-report...) and verifies them against real accident records. */
export async function probeSearchFilters() {
  const base = "(And.Hidden.N._.CarType.Y._.Manufacturer.현대._.ModelGroup.쏘나타.";
  const candidates: Record<string, string> = {
    baseline: "",
    "Accident.N": "_.Accident.N.",
    "Accident.무사고": "_.Accident.무사고.",
    "AccidentFree.Y": "_.AccidentFree.Y.",
    "Record.무사고": "_.Record.무사고.",
    "MyAccidentCnt.0": "_.MyAccidentCnt.0.",
    "Condition.Record": "_.Condition.Record.",
    "Condition.Inspection": "_.Condition.Inspection.",
  };
  const out: any[] = [];
  for (const [name, part] of Object.entries(candidates)) {
    if (name !== "baseline" && name !== "Accident.N") continue; // other candidates already ruled out
    const isAcc = name === "Accident.N";
    const q = `${base}${part})`;
    const u = new URL(`${API}/search/car/list/general`);
    u.searchParams.set("count", "true"); u.searchParams.set("q", q); u.searchParams.set("sr", isAcc ? "|ModifiedDate|0|40" : "|ModifiedDate|0|8");
    try {
      const r = await getJson(u.toString());
      const rows: any[] = r.json?.SearchResults ?? [];
      const entry: any = { filter: name, status: r.status, count: r.json?.Count ?? null, returned: rows.length };
      if (r.ok && rows.length && name !== "baseline") {
        const acc: any[] = [];
        for (const c of rows.slice(0, 40)) {
          const rec = await getJson(`${API}/v1/readside/record/vehicle/${c.Id}/open`, `https://fem.encar.com/cars/detail/${c.Id}`);
          if (!rec.ok) { if (acc.length < 40) acc.push("-"); continue; }
          acc.push(`my${rec.json?.myAccidentCnt ?? 0}/other${rec.json?.otherAccidentCnt ?? 0}/total${rec.json?.accidentCnt ?? "?"}`);
          if (acc.filter((x) => x !== "-").length >= 15) break;
          await sleep(200);
        }
        entry.recordsChecked = acc.filter((x) => x !== "-"); entry.noRecord = acc.filter((x) => x === "-").length;
      }
      out.push(entry);
    } catch (e) { out.push({ filter: name, error: (e as Error).message }); }
    await sleep(300);
  }
  return out;
}

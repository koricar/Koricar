// SAR per 1 KRW, refreshed from a free API and cached; falls back to a recent value.
const FALLBACK_KRW_PER_SAR = 354;
const TTL_MS = 6 * 60 * 60 * 1000;
let krwPerSar = FALLBACK_KRW_PER_SAR;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;

async function refresh(): Promise<void> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/SAR", { signal: AbortSignal.timeout(5000) });
    const j: any = await res.json();
    const r = Number(j?.rates?.KRW);
    if (r > 200 && r < 600) { krwPerSar = r; fetchedAt = Date.now(); return; }
  } catch { /* keep previous value */ }
  fetchedAt = Date.now() - TTL_MS + 5 * 60 * 1000; // retry in 5 minutes
}

export function warmExchangeRate() {
  if (Date.now() - fetchedAt > TTL_MS && !inflight) inflight = refresh().finally(() => { inflight = null; });
}

/** Synchronous: current cached SAR value of 1 만원 (10,000 KRW). Triggers background refresh when stale. */
export function sarPerManwon(): number {
  warmExchangeRate();
  return 10000 / krwPerSar;
}

export function getRateInfo() {
  warmExchangeRate();
  return { krwPerSar, sarPerKrw: 1 / krwPerSar, sarPerManwon: 10000 / krwPerSar, updatedAt: fetchedAt ? new Date(fetchedAt).toISOString() : null };
}

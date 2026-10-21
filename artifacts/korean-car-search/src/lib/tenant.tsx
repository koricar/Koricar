import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface Tenant { slug: string; name: string; logoUrl: string | null; whatsapp: string | null; makes: string[] }
interface Ctx { tenant: Tenant | null; slug: string | null; ready: boolean }

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const KEY = "dealer_slug";
const TenantContext = createContext<Ctx>({ tenant: null, slug: null, ready: true });

function readSlug(): string | null {
  try {
    const q = new URLSearchParams(window.location.search).get("dealer");
    if (q && /^[a-z0-9-]{2,40}$/i.test(q)) { localStorage.setItem(KEY, q.toLowerCase()); return q.toLowerCase(); }
    if (q === "") { localStorage.removeItem(KEY); return null; }
    return localStorage.getItem(KEY);
  } catch { return null; }
}

/** Dealer site: resolved from ?dealer=slug (remembered) or from the custom domain. No tenant = the main Koricar site. */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>({ tenant: null, slug: null, ready: false });
  useEffect(() => {
    let alive = true;
    (async () => {
      const slug = readSlug();
      const host = window.location.hostname.replace(/^www\./, "");
      const isMain = /(^localhost$|onrender\.com$|^\d+\.\d+\.\d+\.\d+$)/.test(host);
      const qs = slug ? `slug=${encodeURIComponent(slug)}` : !isMain ? `host=${encodeURIComponent(host)}` : "";
      if (!qs) { if (alive) setState({ tenant: null, slug: null, ready: true }); return; }
      try {
        const r = await fetch(`${API_BASE}/api/catalog/tenant?${qs}`);
        if (!r.ok) throw new Error(String(r.status));
        const t = (await r.json()) as Tenant;
        if (alive) { setState({ tenant: t, slug: t.slug, ready: true }); document.title = t.name; }
      } catch { if (alive) setState({ tenant: null, slug: null, ready: true }); }
    })();
    return () => { alive = false; };
  }, []);
  if (!state.ready) return null;
  return <TenantContext.Provider value={state}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);
export const waDigits = (n?: string | null) => (n ?? "").replace(/\D/g, "");

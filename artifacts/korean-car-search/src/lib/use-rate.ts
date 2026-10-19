import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
let cached = 10000 / 354; // SAR per 1 만원 (fallback)

export function useSarPerManwon(): number {
  const [v, setV] = useState(cached);
  useEffect(() => {
    fetch(`${API_BASE}/api/rate`)
      .then((r) => r.json())
      .then((j) => { if (j?.sarPerManwon > 0) { cached = j.sarPerManwon; setV(cached); } })
      .catch(() => {});
  }, []);
  return v;
}

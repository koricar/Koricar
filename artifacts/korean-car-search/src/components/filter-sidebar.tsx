import { useState, useEffect, useRef } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CountryCode =
  | "SA" | "AE" | "KW" | "QA" | "BH"
  | "OM" | "IQ" | "LY" | "YE" | "EG" | "MA";

export const COUNTRY_RULES = {
  SA: { minYear: 2010, label: "السعودية", flag: "🇸🇦" },
  AE: { minYear: 2010, label: "الإمارات", flag: "🇦🇪" },
  KW: { minYear: 2008, label: "الكويت", flag: "🇰🇼" },
  QA: { minYear: 2010, label: "قطر", flag: "🇶🇦" },
  BH: { minYear: 2008, label: "البحرين", flag: "🇧🇭" },
  OM: { minYear: 2008, label: "عُمان", flag: "🇴🇲" },
  IQ: { minYear: 2005, label: "العراق", flag: "🇮🇶" },
  LY: { minYear: 2005, label: "ليبيا", flag: "🇱🇾" },
  YE: { minYear: 2005, label: "اليمن", flag: "🇾🇪" },
  EG: { minYear: 2008, label: "مصر", flag: "🇪🇬" },
  MA: { minYear: 2008, label: "المغرب", flag: "🇲🇦" },
} as const;

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(
    key: K,
    value: SearchCarsParams[K]
  ) => void;
  resetFilters: () => void;
  className?: string;
}

type Step = "brand" | "modelGroup" | "model" | "filters";

const BRANDS = [
  { en: "Hyundai", ar: "هيونداي" },
  { en: "Kia", ar: "كيا" },
  { en: "Toyota", ar: "تويوتا" },
  { en: "BMW", ar: "BMW" },
  { en: "Mercedes-Benz", ar: "مرسيدس" },
];

const API_BASE = import.meta.env.VITE_API_URL;

const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i);

export function FilterSidebar({
  filters,
  updateFilter,
  resetFilters,
  className,
}: FilterSidebarProps) {

  const [step, setStep] = useState<Step>("brand");

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedModelGroup, setSelectedModelGroup] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [modelGroups, setModelGroups] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);

  // ✅ حفظ الفلاتر
  useEffect(() => {
    sessionStorage.setItem("car_filters", JSON.stringify(filters));
  }, [filters]);

  // ✅ جلب محفوظ
  useEffect(() => {
    const saved = sessionStorage.getItem("car_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => {
          updateFilter(k as any, v as any);
        });
      } catch {}
    }
  }, []);

  // ───── Fetch helper ─────
  const safeFetch = async (url: string) => {
    if (!API_BASE) {
      console.warn("API_BASE not set");
      return null;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      setLoading(false);
      return data;
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(true);
        setLoading(false);
      }
      return null;
    }
  };

  // ───── جلب modelGroups ─────
  useEffect(() => {
    if (!selectedBrand) return;

    safeFetch(`${API_BASE}/api/cars/filters?brand=${selectedBrand.en}`)
      .then((d) => setModelGroups(d?.modelGroups || []));
  }, [selectedBrand]);

  // ───── جلب models ─────
  useEffect(() => {
    if (!selectedModelGroup || !selectedBrand) return;

    safeFetch(
      `${API_BASE}/api/cars/filters?brand=${selectedBrand.en}&modelGroup=${selectedModelGroup.value}`
    ).then((d) => setModels(d?.models || []));
  }, [selectedModelGroup]);

  const apply = (model?: any) => {
    if (!selectedBrand) return;

    updateFilter("brand", selectedBrand.en);
    updateFilter("model", model?.value || selectedModelGroup?.value);

    setStep("filters");
  };

  const resetAll = () => {
    resetFilters();
    sessionStorage.removeItem("car_filters");
    setStep("brand");
    setSelectedBrand(null);
    setSelectedModelGroup(null);
    setSelectedModel(null);
  };

  return (
    <div className={cn("bg-white rounded-2xl p-4", className)}>

      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <h3 className="font-bold">البحث</h3>
        <button onClick={resetAll}>
          <X />
        </button>
      </div>

      {/* STEP 1 */}
      {step === "brand" && (
        <div className="grid grid-cols-2 gap-2">
          {BRANDS.map((b) => (
            <button
              key={b.en}
              onClick={() => {
                setSelectedBrand(b);
                setStep("modelGroup");
              }}
              className="border p-2 rounded"
            >
              {b.ar}
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 */}
      {step === "modelGroup" && (
        <>
          <button onClick={() => setStep("brand")}>رجوع</button>

          {loading && <Loader2 className="animate-spin" />}

          {modelGroups.map((m) => (
            <button
              key={m.value}
              onClick={() => {
                setSelectedModelGroup(m);
                setStep("model");
              }}
            >
              {m.label} ({m.count})
            </button>
          ))}

          <button onClick={() => apply()}>كل الموديلات</button>
        </>
      )}

      {/* STEP 3 */}
      {step === "model" && (
        <>
          <button onClick={() => setStep("modelGroup")}>رجوع</button>

          {models.map((m) => (
            <button
              key={m.value}
              onClick={() => apply(m)}
            >
              {m.label}
            </button>
          ))}
        </>
      )}

      {/* STEP 4 */}
      {step === "filters" && (
        <div className="space-y-3">

          <select
            value={filters.yearFrom ?? ""}
            onChange={(e) =>
              updateFilter("yearFrom", e.target.value ? +e.target.value : undefined)
            }
          >
            <option value="">من سنة</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="السعر الأدنى"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              updateFilter("priceMin", e.target.value ? +e.target.value : undefined)
            }
          />

          <button
            onClick={() =>
              updateFilter("sunroof", filters.sunroof ? undefined : true)
            }
          >
            فتحة سقف
          </button>

        </div>
      )}
    </div>
  );
}

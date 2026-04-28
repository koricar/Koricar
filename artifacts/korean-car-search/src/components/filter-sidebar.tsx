import { useState, useEffect } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

const BRANDS = [
  { en: "Hyundai", ar: "هيونداي" },
  { en: "Kia", ar: "كيا" },
  { en: "Toyota", ar: "تويوتا" },
  { en: "BMW", ar: "BMW" },
  { en: "Mercedes-Benz", ar: "مرسيدس" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [modelGroups, setModelGroups] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelGroup, setSelectedModelGroup] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // جلب الموديلات
  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);

    fetch(`${API_BASE}/api/cars/filters?brand=${selectedBrand.en}`)
      .then(r => r.json())
      .then(d => {
        setModelGroups(d.modelGroups || []);
        setLoading(false);
      });
  }, [selectedBrand]);

  // جلب الأجيال
  useEffect(() => {
    if (!selectedModelGroup || !selectedBrand) return;
    setLoading(true);

    fetch(`${API_BASE}/api/cars/filters?brand=${selectedBrand.en}&modelGroup=${selectedModelGroup.value}`)
      .then(r => r.json())
      .then(d => {
        setModels(d.models || []);
        setLoading(false);
      });
  }, [selectedModelGroup]);

  return (
    <div className={cn("bg-white rounded-2xl border p-4 space-y-5", className)}>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold">البحث</h3>
        <button onClick={resetFilters} className="text-red-500 text-sm">مسح</button>
      </div>

      {/* BRAND */}
      <div>
        <p className="text-sm mb-2">الماركة</p>
        <div className="grid grid-cols-2 gap-2">
          {BRANDS.map(b => (
            <button
              key={b.en}
              onClick={() => {
                setSelectedBrand(b);
                updateFilter("brand", b.en);
                setSelectedModelGroup(null);
              }}
              className={cn(
                "border rounded-xl py-2 text-sm",
                filters.brand === b.en ? "bg-blue-100 border-blue-500" : ""
              )}
            >
              {b.ar}
            </button>
          ))}
        </div>
      </div>

      {/* MODEL GROUP */}
      {selectedBrand && (
        <div>
          <p className="text-sm mb-2">الموديل</p>

          {loading ? <Loader2 className="animate-spin" /> : (
            <div className="space-y-2 max-h-40 overflow-auto">
              {modelGroups.map(m => (
                <button
                  key={m.value}
                  onClick={() => {
                    setSelectedModelGroup(m);
                    updateFilter("model", m.value);
                  }}
                  className="w-full text-right border rounded-xl px-3 py-2 text-sm"
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODEL */}
      {selectedModelGroup && (
        <div>
          <p className="text-sm mb-2">الجيل</p>

          {loading ? <Loader2 className="animate-spin" /> : (
            <div className="space-y-2 max-h-40 overflow-auto">
              {models.map(m => (
                <button
                  key={m.value}
                  onClick={() => updateFilter("model", m.value)}
                  className="w-full text-right border rounded-xl px-3 py-2 text-sm"
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* باقي الفلاتر دايم ظاهرة */}
      <div>
        <p className="text-sm mb-2">السعر</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="من"
            value={filters.priceMin || ""}
            onChange={e => updateFilter("priceMin", Number(e.target.value))}
            className="border rounded-xl p-2 w-full"
          />
          <input
            type="number"
            placeholder="إلى"
            value={filters.priceMax || ""}
            onChange={e => updateFilter("priceMax", Number(e.target.value))}
            className="border rounded-xl p-2 w-full"
          />
        </div>
      </div>

      <div>
        <p className="text-sm mb-2">الممشى</p>
        <input
          type="number"
          placeholder="أقصى ممشى"
          value={filters.mileageMax || ""}
          onChange={e => updateFilter("mileageMax", Number(e.target.value))}
          className="border rounded-xl p-2 w-full"
        />
      </div>

      <div>
        <p className="text-sm mb-2">وقود</p>
        <div className="grid grid-cols-2 gap-2">
          {["gasoline", "diesel", "hybrid"].map(f => (
            <button
              key={f}
              onClick={() => updateFilter("fuelType", f as any)}
              className={cn("border rounded-xl py-2", filters.fuelType === f && "bg-blue-100")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

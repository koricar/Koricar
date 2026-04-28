import { useState, useEffect } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── COUNTRY_RULES — مطلوب من car-card.tsx ──────────────
export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM" | "IQ" | "LY" | "YE" | "EG" | "MA";

export const COUNTRY_RULES: Record<CountryCode, { minYear: number; label: string; flag: string }> = {
  SA: { minYear: 2010, label: "السعودية",    flag: "🇸🇦" },
  AE: { minYear: 2010, label: "الإمارات",    flag: "🇦🇪" },
  KW: { minYear: 2008, label: "الكويت",      flag: "🇰🇼" },
  QA: { minYear: 2010, label: "قطر",         flag: "🇶🇦" },
  BH: { minYear: 2008, label: "البحرين",     flag: "🇧🇭" },
  OM: { minYear: 2008, label: "عُمان",       flag: "🇴🇲" },
  IQ: { minYear: 2005, label: "العراق",      flag: "🇮🇶" },
  LY: { minYear: 2005, label: "ليبيا",       flag: "🇱🇾" },
  YE: { minYear: 2005, label: "اليمن",       flag: "🇾🇪" },
  EG: { minYear: 2008, label: "مصر",         flag: "🇪🇬" },
  MA: { minYear: 2008, label: "المغرب",      flag: "🇲🇦" },
};

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

const BRANDS = [
  { en: "Hyundai",       ar: "هيونداي" },
  { en: "Kia",           ar: "كيا" },
  { en: "Genesis",       ar: "جينيسيس" },
  { en: "SsangYong",     ar: "سانغ يونغ" },
  { en: "KG Mobility",   ar: "KG موبيليتي" },
  { en: "Renault Korea", ar: "رينو كوريا" },
  { en: "Chevrolet",     ar: "شيفروليه" },
  { en: "BMW",           ar: "BMW" },
  { en: "Mercedes-Benz", ar: "مرسيدس-بنز" },
  { en: "Audi",          ar: "أودي" },
  { en: "Volkswagen",    ar: "فولكسفاغن" },
  { en: "Volvo",         ar: "فولفو" },
  { en: "Toyota",        ar: "تويوتا" },
  { en: "Lexus",         ar: "لكزس" },
  { en: "Honda",         ar: "هوندا" },
  { en: "Nissan",        ar: "نيسان" },
  { en: "Infiniti",      ar: "إنفينيتي" },
  { en: "Porsche",       ar: "بورشه" },
  { en: "Land Rover",    ar: "لاند روفر" },
  { en: "MINI",          ar: "ميني" },
  { en: "Ford",          ar: "فورد" },
  { en: "Jeep",          ar: "جيب" },
  { en: "Lincoln",       ar: "لينكولن" },
  { en: "Cadillac",      ar: "كاديلاك" },
  { en: "Tesla",         ar: "تسلا" },
  { en: "Mazda",         ar: "مازدا" },
  { en: "Subaru",        ar: "سوبارو" },
  { en: "Maserati",      ar: "مازيراتي" },
  { en: "Ferrari",       ar: "فيراري" },
  { en: "Lamborghini",   ar: "لامبورغيني" },
  { en: "Bentley",       ar: "بنتلي" },
  { en: "Rolls-Royce",   ar: "رولز رويس" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i);

interface ModelGroup { value: string; label: string; count: number; }
interface CarModel   { value: string; label: string; count: number; }

type Step = "brand" | "modelGroup" | "model" | "filters";

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const [step, setStep] = useState<Step>("brand");

  const [selectedBrand,      setSelectedBrand]      = useState<typeof BRANDS[0] | null>(null);
  const [selectedModelGroup, setSelectedModelGroup] = useState<ModelGroup | null>(null);
  const [selectedModel,      setSelectedModel]      = useState<CarModel | null>(null);

  const [modelGroups, setModelGroups] = useState<ModelGroup[]>([]);
  const [models,      setModels]      = useState<CarModel[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(false);

  // ── جلب ModelGroups ────────────────────────────────
  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);
    setError(false);
    setModelGroups([]);
    fetch(`${API_BASE}/api/cars/filters?brand=${encodeURIComponent(selectedBrand.en)}`)
      .then(r => r.json())
      .then(d => { setModelGroups(d.modelGroups ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [selectedBrand]);

  // ── جلب Models ────────────────────────────────────
  useEffect(() => {
    if (!selectedBrand || !selectedModelGroup) return;
    setLoading(true);
    setError(false);
    setModels([]);
    fetch(`${API_BASE}/api/cars/filters?brand=${encodeURIComponent(selectedBrand.en)}&modelGroup=${encodeURIComponent(selectedModelGroup.value)}`)
      .then(r => r.json())
      .then(d => { setModels(d.models ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [selectedBrand, selectedModelGroup]);

  // ── تطبيق وانتقال لفلاتر ──────────────────────────
  const applyAndGoFilters = (model?: CarModel) => {
    if (!selectedBrand) return;
    updateFilter("brand", selectedBrand.en);
    if (model) {
      updateFilter("model", model.value);
    } else if (selectedModelGroup) {
      updateFilter("model", selectedModelGroup.value);
    } else {
      updateFilter("model", undefined);
    }
    setStep("filters");
  };

  const handleReset = () => {
    resetFilters();
    setStep("brand");
    setSelectedBrand(null);
    setSelectedModelGroup(null);
    setSelectedModel(null);
    setModelGroups([]);
    setModels([]);
  };

  // ── Breadcrumb ────────────────────────────────────
  const Breadcrumb = () => (
    <div className="flex items-center gap-1 flex-wrap mb-3 text-xs">
      <button onClick={() => { setStep("brand"); setSelectedBrand(null); setSelectedModelGroup(null); setSelectedModel(null); }}
        className="text-blue-600 hover:underline font-medium">الماركات</button>
      {selectedBrand && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => { setStep("modelGroup"); setSelectedModelGroup(null); setSelectedModel(null); }}
          className={cn("hover:underline font-medium", step === "modelGroup" ? "text-blue-600" : "text-gray-600")}>
          {selectedBrand.ar}
        </button>
      </>)}
      {selectedModelGroup && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => { setStep("model"); setSelectedModel(null); }}
          className={cn("hover:underline font-medium", step === "model" ? "text-blue-600" : "text-gray-600")}>
          {selectedModelGroup.label}
        </button>
      </>)}
      {selectedModel && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-blue-600 font-medium">{selectedModel.label}</span>
      </>)}
    </div>
  );

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">البحث والفلترة</h3>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
          <X className="w-3 h-3" /> إعادة تعيين
        </button>
      </div>

      <div className="p-4">

        {/* ══ STEP 1: الماركة ══ */}
        {step === "brand" && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الماركة</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[65vh] overflow-y-auto">
              {BRANDS.map(brand => (
                <button
                  key={brand.en}
                  onClick={() => { setSelectedBrand(brand); setStep("modelGroup"); }}
                  className="text-right px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  {brand.ar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 2: ModelGroup ══ */}
        {step === "modelGroup" && (
          <div>
            <Breadcrumb />
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الموديل</p>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : error ? (
              <p className="text-center text-red-500 text-sm py-4">خطأ في التحميل، حاول مرة أخرى</p>
            ) : (
              <div className="space-y-1 max-h-[65vh] overflow-y-auto">
                {/* كل الماركة */}
                <button
                  onClick={() => applyAndGoFilters()}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <span className="text-sm font-semibold text-gray-700">كل موديلات {selectedBrand?.ar}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                {modelGroups.map(mg => (
                  <button
                    key={mg.value}
                    onClick={() => { setSelectedModelGroup(mg); setStep("model"); }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{mg.label}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{mg.count.toLocaleString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {modelGroups.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">لا توجد موديلات</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 3: Model (الجيل) ══ */}
        {step === "model" && (
          <div>
            <Breadcrumb />
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الجيل</p>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : error ? (
              <p className="text-center text-red-500 text-sm py-4">خطأ في التحميل</p>
            ) : (
              <div className="space-y-1 max-h-[65vh] overflow-y-auto">
                {/* كل الجيل */}
                <button
                  onClick={() => applyAndGoFilters()}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">كل {selectedModelGroup?.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{selectedModelGroup?.count.toLocaleString()}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                {models.map(m => (
                  <button
                    key={m.value}
                    onClick={() => { setSelectedModel(m); applyAndGoFilters(m); }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{m.label}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{m.count.toLocaleString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {models.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">لا توجد أجيال</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 4: فلاتر إضافية ══ */}
        {step === "filters" && (
          <div className="space-y-5">
            {/* ملخص الاختيار */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm space-y-1">
              {selectedBrand && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الماركة</span>
                  <span className="font-semibold text-gray-800">{selectedBrand.ar}</span>
                </div>
              )}
              {selectedModelGroup && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الموديل</span>
                  <span className="font-semibold text-gray-800">{selectedModelGroup.label}</span>
                </div>
              )}
              {selectedModel && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الجيل</span>
                  <span className="font-semibold text-blue-700">{selectedModel.label}</span>
                </div>
              )}
              <button onClick={() => setStep("brand")} className="text-xs text-blue-600 hover:underline pt-1">
                تغيير الاختيار
              </button>
            </div>

            {/* سنة الصنع */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">سنة الصنع</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">من</label>
                  <select
                    value={filters.yearFrom ?? ""}
                    onChange={e => updateFilter("yearFrom", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">أي سنة</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">إلى</label>
                  <select
                    value={filters.yearTo ?? ""}
                    onChange={e => updateFilter("yearTo", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">أي سنة</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* السعر */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">السعر (مليون وون)</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الأدنى"
                  value={filters.priceMin ?? ""}
                  onChange={e => updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  placeholder="الأقصى"
                  value={filters.priceMax ?? ""}
                  onChange={e => updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* الممشى */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">الممشى الأقصى (كم)</p>
              <input
                type="number"
                placeholder="مثال: 100000"
                value={filters.mileageMax ?? ""}
                onChange={e => updateFilter("mileageMax", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* نوع الوقود */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">نوع الوقود</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "gasoline", label: "بنزين" },
                  { value: "diesel",   label: "ديزل" },
                  { value: "hybrid",   label: "هايبرد" },
                  { value: "electric", label: "كهرباء" },
                  { value: "lpg",      label: "غاز LPG" },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => updateFilter("fuelType", filters.fuelType === f.value ? undefined : f.value as any)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                      filters.fuelType === f.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ناقل الحركة */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">ناقل الحركة</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "auto",   label: "أوتوماتيك" },
                  { value: "manual", label: "يدوي" },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => updateFilter("transmission", filters.transmission === t.value ? undefined : t.value as any)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                      filters.transmission === t.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* فتحة سقف */}
            <button
              onClick={() => updateFilter("sunroof", filters.sunroof ? undefined : true)}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                filters.sunroof
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              🌤 فتحة سقف فقط
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

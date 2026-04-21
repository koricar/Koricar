import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM";

interface CountryRule {
  label: string;
  flag: string;
  minYear: number;
}

export const COUNTRY_RULES: Record<CountryCode, CountryRule> = {
  SA: { label: "السعودية", flag: "🇸🇦", minYear: 2021 },
  AE: { label: "الإمارات", flag: "🇦🇪", minYear: 2021 },
  KW: { label: "الكويت",   flag: "🇰🇼", minYear: 2021 },
  QA: { label: "قطر",      flag: "🇶🇦", minYear: 2021 },
  BH: { label: "البحرين",  flag: "🇧🇭", minYear: 2021 },
  OM: { label: "عُمان",    flag: "🇴🇲", minYear: 2021 },
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_OPTIONS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

const FUEL_TYPES = [
  { id: "gasoline", label: "بنزين" },
  { id: "diesel", label: "ديزل" },
  { id: "hybrid", label: "هايبرد" },
  { id: "electric", label: "كهرباء" },
];

const BODY_TYPES = [
  { id: "sedan", label: "سيدان" },
  { id: "suv", label: "عائلية (SUV)" },
  { id: "hatchback", label: "هاتشباك" },
  { id: "coupe", label: "كوبيه" },
];

const COLORS_CONFIG = [
  { key: "white", ar: "أبيض", css: "#F8F8F8", border: "#D1D5DB" },
  { key: "silver", ar: "فضي", css: "#C0C0C0", border: "#9CA3AF" },
  { key: "gray", ar: "رمادي", css: "#6B7280", border: "#4B5563" },
  { key: "black", ar: "أسود", css: "#1A1A1A", border: "#374151" },
  { key: "red", ar: "أحمر", css: "#EF4444", border: "#DC2626" },
  { key: "orange", ar: "برتقالي", css: "#F97316", border: "#EA580C" },
  { key: "yellow", ar: "أصفر", css: "#EAB308", border: "#CA8A04" },
  { key: "green", ar: "أخضر", css: "#22C55E", border: "#16A34A" },
  { key: "lime", ar: "أخضر فاتح", css: "#84CC16", border: "#65A30D" },
  { key: "lightblue", ar: "أزرق فاتح", css: "#60A5FA", border: "#3B82F6" },
  { key: "brown", ar: "بني", css: "#92400E", border: "#78350F" },
];

const LIGHT_COLORS = ["white", "silver", "yellow", "lime"];

// --- تم تعديل الاسم هنا ليتطابق مع الاستخدام في الأسفل ---
export const BRAND_MODELS: Record<string, { label: string; value: string }[]> = {
  "Hyundai": [
    { label: "Palisade", value: "팰리세이드" },
    { label: "Palisade (New)", value: "더 뉴 팰리세이드" },
    { label: "Santa Fe (MX5 2023+)", value: "싼타페 (MX5)" },
    { label: "Santa Fe (New TM)", value: "더 뉴 싼타페" },
    { label: "Santa Fe TM", value: "싼타페 TM" },
    { label: "Grandeur (GN7 2022+)", value: "그랜저 (GN7)" },
    { label: "Grandeur Hybrid (GN7)", value: "그랜저 하이브리드 (GN7)" },
    { label: "Grandeur (New IG)", value: "더 뉴 그랜جر IG" },
    { label: "Grandeur HG", value: "그랜저 HG" },
    { label: "Sonata (DN8)", value: "쏘나타 (DN8)" },
    { label: "Sonata Hybrid (DN8)", value: "쏘나타 하이브리드 (DN8)" },
    { label: "Sonata LF", value: "LF 쏘나타" },
    { label: "Elantra (CN7 2020+)", value: "아반떼 (CN7)" },
    { label: "Elantra Hybrid (CN7)", value: "아반떼 하이브리드 (CN7)" },
    { label: "Elantra MD", value: "아반떼 MD" },
    { label: "Tucson (NX4 2020+)", value: "투싼 (NX4)" },
    { label: "Tucson (New TL)", value: "더 뉴 투싼 TL" },
    { label: "Kona (OS)", value: "코나 (OS)" },
    { label: "Kona (SX2 2023+)", value: "코나 (SX2)" },
    { label: "Ioniq 5", value: "아이오닉 5" },
    { label: "Ioniq 5 N", value: "아이오닉 5 N" },
    { label: "Ioniq 6", value: "아이오닉 6" },
    { label: "Ioniq 9", value: "아이오닉 9" },
    { label: "Staria", value: "스타리아" },
    { label: "Staria Lounge", value: "스타리아 라운지" },
    { label: "Grand Starex (New)", value: "더 뉴 그랜드 스타렉س" },
    { label: "Casper", value: "캐스퍼" },
    { label: "Casper Electric", value: "캐스퍼 일렉트릭" },
    { label: "Nexo (Hydrogen)", value: "넥쏘" },
    { label: "Venue", value: "베뉴" },
    { label: "Accent", value: "엑센트" },
    { label: "Veloster", value: "벨로ستر" },
    { label: "Porter 2", value: "포터 2" },
  ],
  "Kia": [
    { label: "Carnival (4th Gen)", value: "카니발 4세대" },
    { label: "Carnival (All New)", value: "올 뉴 카니발" },
    { label: "Carnival (New)", value: "더 뉴 카니발" },
    { label: "Carnival Limousine", value: "카니발 리무진" },
    { label: "Sorento (4th Gen 2020+)", value: "쏘렌토 4세대" },
    { label: "Sorento Hybrid (4th Gen)", value: "쏘렌토 하이브리드 4세대" },
    { label: "Sorento PHEV (4th Gen)", value: "쏘렌토 플러그인 하이브리드 4세대" },
    { label: "Sorento (New 4th Gen)", value: "더 뉴 쏘렌토 4세대" },
    { label: "Sportage (5th Gen 2021+)", value: "스포تي지 5세대" },
    { label: "Sportage Hybrid (5th Gen)", value: "스포تي지 5세대 하이브리드" },
    { label: "Sportage PHEV (5th Gen)", value: "스포تي지 5세대 플러그인 하이브리드" },
    { label: "K8", value: "K8" },
    { label: "K8 Hybrid", value: "K8 하이브리드" },
    { label: "K5 (3rd Gen)", value: "K5 3세대" },
    { label: "K5 Hybrid (3rd Gen)", value: "K5 하이브리드 3세대" },
    { label: "K5 (New 2nd Gen)", value: "더 뉴 K5 2세대" },
    { label: "K3", value: "K3" },
    { label: "K3 (New 2nd Gen)", value: "더 뉴 K3 2세대" },
    { label: "K9", value: "K9" },
    { label: "Seltos", value: "셀토스" },
    { label: "Seltos (New)", value: "더 뉴 셀토스" },
    { label: "Niro (All New)", value: "디 올 뉴 니로" },
    { label: "Niro Hybrid", value: "니로 하이브리드" },
    { label: "Niro EV", value: "니로 EV" },
    { label: "EV3", value: "EV3" },
    { label: "EV6", value: "EV6" },
    { label: "EV6 GT", value: "EV6 GT" },
    { label: "EV9", value: "EV9" },
    { label: "Stinger", value: "스팅어" },
    { label: "Mohave (2008-2015)", value: "모하비" },
    { label: "The New Mohave (2016-2019)", value: "더 뉴 모하비" },
    { label: "Mohave The Master (2019+)", value: "모하비 더 마ستر" },
    { label: "Morning", value: "모닝" },
    { label: "Ray", value: "레이" },
    { label: "Soul", value: "쏘울" },
    { label: "Telluride", value: "텔루라이드" },
  ],
  "Genesis": [
    { label: "GV80", value: "GV80" },
    { label: "GV80 Coupe", value: "GV80 쿠페" },
    { label: "GV70", value: "GV70" },
    { label: "GV70 Electrified", value: "GV70 전동화" },
    { label: "GV60", value: "GV60" },
    { label: "GV60 Sport Plus", value: "GV60 스포츠 플러스" },
    { label: "G80 (RG3 2020+)", value: "G80 (RG3)" },
    { label: "G80 Electrified", value: "G80 전동화" },
    { label: "G80", value: "G80" },
    { label: "G90 (RS4 2022+)", value: "G90 (RS4)" },
    { label: "G90", value: "G90" },
    { label: "G70 (New)", value: "더 뉴 G70" },
    { label: "G70 (2nd Gen)", value: "G70 2세대" },
    { label: "EQ900", value: "EQ900" },
  ],
  "SsangYong": [
    { label: "Rexton G4", value: "렉스턴 G4" },
    { label: "Rexton Sports", value: "렉스턴 스포츠" },
    { label: "Rexton Sports Khan", value: "렉스턴 스포츠 칸" },
    { label: "Korando", value: "코란도" },
    { label: "Korando e-Motion", value: "코란도 이모션" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Tivoli Air", value: "티볼리 에어" },
    { label: "Musso", value: "무쏘" },
    { label: "Actyon", value: "액티언" },
    { label: "Actyon Sports", value: "액티언 스포츠" },
  ],
  "KG Mobility": [
    { label: "Torres", value: "토레스" },
    { label: "Torres EVX", value: "토레스 EVX" },
    { label: "Rexton G4", value: "렉스턴 G4" },
    { label: "Rexton Sports", value: "렉스턴 스포츠" },
    { label: "Rexton Sports Khan", value: "렉스턴 스포츠 칸" },
    { label: "Korando", value: "코란도" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Musso", value: "무쏘" },
    { label: "Actyon Sports", value: "액티언 스포츠" },
  ],
  "Renault Samsung": [
    { label: "QM6", value: "QM6" },
    { label: "QM6 LPe", value: "QM6 LPe" },
    { label: "SM6", value: "SM6" },
    { label: "XM3", value: "XM3" },
    { label: "SM3", value: "SM3" },
    { label: "SM5", value: "SM5" },
    { label: "SM7", value: "SM7" },
    { label: "QM3", value: "QM3" },
    { label: "QM5", value: "QM5" },
  ],
  "Chevrolet": [
    { label: "Trailblazer", value: "트레일블레이저" },
    { label: "Trax", value: "트랙스" },
    { label: "Malibu", value: "말리부" },
    { label: "Spark", value: "스파크" },
    { label: "Equinox", value: "이쿼녹스" },
    { label: "Colorado", value: "콜로라도" },
    { label: "Traverse", value: "트래버스" },
    { label: "Tahoe", value: "타호" },
  ],
  "BMW": [
    { label: "1 Series (F40)", value: "1시리즈 (F40)" },
    { label: "3 Series (G20)", value: "3시리즈 (G20)" },
    { label: "5 Series (G60)", value: "5시리즈 (G60)" },
    { label: "5 Series (G30)", value: "5시리즈 (G30)" },
    { label: "7 Series (G70)", value: "7시리즈 (G70)" },
    { label: "X1 (U11)", value: "X1 (U11)" },
    { label: "X3 (G01)", value: "X3 (G01)" },
    { label: "X5 (G05)", value: "X5 (G05)" },
    { label: "i4", value: "i4" },
    { label: "i5", value: "i5" },
    { label: "i7", value: "i7" },
    { label: "iX", value: "iX" },
  ],
  "Mercedes-Benz": [
    { label: "A-Class W177", value: "A-클래스 W177" },
    { label: "C-Class W206", value: "C-클래스 W206" },
    { label: "E-Class W214", value: "E-클래스 W214" },
    { label: "E-Class W213", value: "E-클래스 W213" },
    { label: "S-Class W223", value: "S-클래스 W223" },
    { label: "S-Class W222", value: "S-클래스 W222" },
    { label: "GLC X254", value: "GLC-클래스 X254" },
    { label: "GLE W167", value: "GLE-클래스 W167" },
    { label: "EQA", value: "EQA" },
    { label: "EQE", value: "EQE" },
    { label: "EQS", value: "EQS" },
  ],
  "Audi": [
    { label: "A4 (B9)", value: "A4 (B9)" },
    { label: "A6 (C8)", value: "A6 (C8)" },
    { label: "A7 Sportback (C8)", value: "A7 스포트백 (C8)" },
    { label: "Q5 (FY)", value: "Q5 (FY)" },
    { label: "Q7 (4M)", value: "Q7 (4M)" },
    { label: "e-tron GT", value: "e-트론 GT" },
  ],
  "Volkswagen": [
    { label: "Tiguan 2nd Gen", value: "티구안 2세대" },
    { label: "Passat (B8)", value: "파سا트 (B8)" },
    { label: "ID.4", value: "ID.4" },
    { label: "Golf 8th Gen", value: "골ف 8세대" },
    { label: "Arteon", value: "아테온" },
  ],
  "Toyota": [
    { label: "Camry (XV70)", value: "캠리 (XV70)" },
    { label: "RAV4 5th Gen", value: "RAV4 5세대" },
    { label: "Prius 5th Gen", value: "프리우스 5세대" },
    { label: "Sienna 4th Gen", value: "시에نا 4세대" },
  ],
  "Porsche": [
    { label: "Cayenne (PO536)", value: "카이엔 (PO536)" },
    { label: "Panamera (971)", value: "파나메라 (971)" },
    { label: "911 (992)", value: "911 (992)" },
    { label: "Taycan", value: "타يكان" },
    { label: "Macan", value: "마칸" },
  ],
  "Land Rover": [
    { label: "Range Rover 5th Gen", value: "레인지로버 5세대" },
    { label: "Defender 110", value: "디펜더 110" },
    { label: "Discovery 5th Gen", value: "디스커버리 5세대" },
  ],
};

const uf = (fn: any) => fn as (key: string, value: any) => void;

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();
  const u = uf(updateFilter);

  const selectedBrand = filters.brand || "";
  // تم تغيير الاسم هنا أيضاً ليتطابق مع الثابت BRAND_MODELS
  const brandModels = selectedBrand ? ((BRAND_MODELS as any)[selectedBrand] ?? []) : [];
  const hasModelList = brandModels.length > 0;

  const selectedCountry = ((filters as any).country ?? "") as CountryCode | "";
  const compatibleOnly = !!((filters as any).compatibleOnly);

  const handleBrandChange = (brand: string) => {
    u("brand", brand || undefined);
    u("model", undefined);
  };

  const handleCountryChange = (country: string) => {
    u("country", country || undefined);
    if (!country) {
      u("compatibleOnly", undefined);
    }
  };

  const handleCompatibleToggle = (mode: "all" | "compatible") => {
    u("compatibleOnly", mode === "compatible" ? true : undefined);
    if (mode === "compatible" && selectedCountry) {
      updateFilter("yearFrom", COUNTRY_RULES[selectedCountry].minYear);
    } else {
      updateFilter("yearFrom", undefined);
    }
  };

  const toggleFuel = (type: any) => updateFilter("fuelType", filters.fuelType === type ? undefined : type);
  const toggleBody = (type: any) => updateFilter("bodyType", filters.bodyType === type ? undefined : type);
  const toggleColor = (key: string) => updateFilter("color", filters.color === key ? undefined : (key as any));

  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          التصفية
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
        >
          مسح الكل
        </button>
      </div>

      <div className="space-y-3 pb-4 border-b border-border">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          دولتك
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">اختر دولتك</option>
            {Object.entries(COUNTRY_RULES).map(([code, rule]) => (
              <option key={code} value={code}>
                {rule.flag} {rule.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {selectedCountry && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => handleCompatibleToggle("all")}
              className={cn(
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                !compatibleOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              بحث عام
            </button>
            <button
              onClick={() => handleCompatibleToggle("compatible")}
              className={cn(
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                compatibleOnly
                  ? "border-green-500 bg-green-500/10 text-green-600"
                  : "border-border bg-background text-muted-foreground hover:border-green-400/40"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              متوافق فقط
            </button>
          </div>
        )}

        {selectedCountry && compatibleOnly && (
          <div className="bg-green-50 border border-green-300 rounded-xl px-3 py-2 text-xs text-green-800 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              يعرض فقط سيارات {COUNTRY_RULES[selectedCountry].minYear}+ المتوافقة مع أنظمة {COUNTRY_RULES[selectedCountry].flag} {COUNTRY_RULES[selectedCountry].label}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الماركة</label>
        <div className="relative">
          <select
            className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={isLoadingBrands}
          >
            <option value="">كل الماركات</option>
            {brandsData?.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الموديل</label>
        {hasModelList ? (
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={(filters as any).model || ""}
              onChange={(e) => u("model", e.target.value || undefined)}
            >
              <option value="">كل الموديلات</option>
              {brandModels.map((m: any) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        ) : (
          <input
            type="text"
            placeholder={selectedBrand ? "اكتب اسم الموديل..." : "اختر الماركة أولاً..."}
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={(filters as any).model || ""}
            onChange={(e) => u("model", e.target.value || undefined)}
          />
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">سنة الصنع</label>
        <div className="grid grid-cols-2 gap-3">
          {(["yearFrom", "yearTo"] as const).map((key, i) => (
            <div key={key} className="relative">
              <select
                className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                value={filters[key] || ""}
                onChange={(e) => updateFilter(key, e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">{i === 0 ? "من" : "إلى"}</option>
                {YEARS_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع الوقود</label>
        <div className="grid grid-cols-2 gap-2">
          {FUEL_TYPES.map((fuel) => {
            const isSelected = filters.fuelType === fuel.id;
            return (
              <button
                key={fuel.id}
                onClick={() => toggleFuel(fuel.id)}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">اللون</label>
        <div className="flex flex-wrap gap-2">
          {COLORS_CONFIG.map((c) => {
            const isSelected = filters.color === c.key;
            return (
              <button
                key={c.key}
                onClick={() => toggleColor(c.key)}
                title={c.ar}
                className={cn(
                  "relative w-8 h-8 rounded-full transition-all focus:outline-none",
                  isSelected
                    ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: c.css, border: `2px solid ${c.border}` }}
              >
                {isSelected && (
                  <Check
                    className="absolute inset-0 m-auto w-4 h-4"
                    style={{ color: LIGHT_COLORS.includes(c.key) ? "#374151" : "#fff" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={filters.sunroof || false}
              onChange={(e) => updateFilter("sunroof", e.target.checked || undefined)}
            />
            <div className="w-6 h-6 rounded-md border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary/50"></div>
            <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
            فتحة سقف
          </span>
        </label>
      </div>
    </div>
  );
}

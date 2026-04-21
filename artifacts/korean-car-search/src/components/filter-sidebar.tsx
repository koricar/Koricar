import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

type ModelOption = { label: string; value: string };

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

const uf = (fn: any) => fn as (key: string, value: any) => void;

const BRAND_MODELS: Record<string, ModelOption[]> = {
  "Hyundai": [
    { label: "Palisade", value: "팰리세이드" },
    { label: "Palisade (New)", value: "더 뉴 팰리세이드" },
    { label: "Santa Fe MX5 (2023+)", value: "싼타페 (MX5)" },
    { label: "Santa Fe (New)", value: "더 뉴 싼타페" },
    { label: "Santa Fe TM", value: "싼타페 TM" },
    { label: "Grandeur GN7 (2022+)", value: "그랜저 (GN7)" },
    { label: "Grandeur Hybrid GN7", value: "그랜저 하이브리드 (GN7)" },
    { label: "Grandeur IG (New)", value: "더 뉴 그랜저 IG" },
    { label: "Grandeur HG", value: "그랜저 HG" },
    { label: "Sonata DN8", value: "쏘나타 (DN8)" },
    { label: "Sonata Hybrid DN8", value: "쏘나타 하이브리드 (DN8)" },
    { label: "Sonata LF", value: "LF 쏘나타" },
    { label: "Elantra CN7 (2020+)", value: "아반떼 (CN7)" },
    { label: "Elantra Hybrid CN7", value: "아반떼 하이브리드 (CN7)" },
    { label: "Elantra MD", value: "아반떼 MD" },
    { label: "Tucson NX4 (2020+)", value: "투싼 (NX4)" },
    { label: "Kona", value: "코나" },
    { label: "Ioniq 5", value: "아이오닉 5" },
    { label: "Ioniq 6", value: "아이오닉 6" },
    { label: "Staria", value: "스타리아" },
    { label: "Grand Starex (New)", value: "더 뉴 그랜드 스타렉스" },
    { label: "Casper", value: "캐스퍼" },
    { label: "Nexo (Hydrogen)", value: "넥쏘" },
  ],
  "Kia": [
    { label: "Carnival 4th Gen", value: "카니발 4세대" },
    { label: "Carnival (New)", value: "더 뉴 카니발" },
    { label: "Sorento 4th Gen (2020+)", value: "쏘렌토 4세대" },
    { label: "Sorento (New)", value: "더 뉴 쏘렌토 4세대" },
    { label: "Sportage 5th Gen (2021+)", value: "스포티지 5세대" },
    { label: "Sportage 5th Gen Hybrid", value: "스포티지 5세대 하이브리드" },
    { label: "K8", value: "K8" },
    { label: "K8 Hybrid", value: "K8 하이브리드" },
    { label: "K5 3rd Gen", value: "K5 3세대" },
    { label: "K5 Hybrid 3rd Gen", value: "K5 하이브리드 3세대" },
    { label: "K3", value: "K3" },
    { label: "K3 2nd Gen (New)", value: "더 뉴 K3 2세대" },
    { label: "Seltos", value: "셀토스" },
    { label: "Seltos (New)", value: "더 뉴 셀토스" },
    { label: "Niro (All New)", value: "디 올 뉴 니로" },
    { label: "EV6", value: "EV6" },
    { label: "EV9", value: "EV9" },
    { label: "Stinger", value: "스팅어" },
    { label: "Mohave", value: "모하비" },
    { label: "Morning", value: "모닝" },
    { label: "Ray", value: "레이" },
  ],
  "Genesis": [
    { label: "GV80", value: "GV80" },
    { label: "GV70", value: "GV70" },
    { label: "GV60", value: "GV60" },
    { label: "G80 RG3 (2020+)", value: "G80 (RG3)" },
    { label: "G80", value: "G80" },
    { label: "G90 RS4 (2022+)", value: "G90 (RS4)" },
    { label: "G90", value: "G90" },
    { label: "G70 (New)", value: "더 뉴 G70" },
    { label: "EQ900", value: "EQ900" },
  ],
  "SsangYong": [
    { label: "Rexton", value: "렉스턴" },
    { label: "Korando", value: "코란도" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Musso", value: "무쏘" },
    { label: "Actyon", value: "액티언" },
  ],
  "KG Mobility": [
    { label: "Torres", value: "토레스" },
    { label: "Rexton", value: "렉스턴" },
    { label: "Korando", value: "코란도" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Musso", value: "무쏘" },
  ],
  "Renault Samsung": [
    { label: "QM6", value: "QM6" },
    { label: "SM6", value: "SM6" },
    { label: "XM3", value: "XM3" },
  ],
  "Renault Korea": [
    { label: "QM6", value: "QM6" },
    { label: "SM6", value: "SM6" },
    { label: "XM3", value: "XM3" },
    { label: "Arkana", value: "아르카나" },
  ],
  "Chevrolet": [
    { label: "Trailblazer", value: "트레일블레이저" },
    { label: "Equinox", value: "이쿼녹스" },
    { label: "Spark", value: "스파크" },
    { label: "Malibu", value: "말리부" },
    { label: "Colorado", value: "콜로라도" },
    { label: "Traverse", value: "트래버스" },
  ],
  "BMW": [
    { label: "3 Series G20 (2019+)", value: "3시리즈 (G20)" },
    { label: "3 Series F30 (2012-2018)", value: "3시리즈 (F30)" },
    { label: "5 Series G60 (2023+)", value: "5시리즈 (G60)" },
    { label: "5 Series G30 (2017-2023)", value: "5시리즈 (G30)" },
    { label: "7 Series G70 (2022+)", value: "7시리즈 (G70)" },
    { label: "X3 G01", value: "X3 (G01)" },
    { label: "X5 G05 (2018+)", value: "X5 (G05)" },
    { label: "X7 G07", value: "X7 (G07)" },
    { label: "i4", value: "i4" },
    { label: "iX", value: "iX" },
  ],
  "Mercedes-Benz": [
    { label: "C-Class W206 (2021+)", value: "C-클래스 W206" },
    { label: "C-Class W205 (2014-2021)", value: "C-클래스 W205" },
    { label: "E-Class W214 (2024+)", value: "E-클래스 W214" },
    { label: "E-Class W213 (2016-2023)", value: "E-클래스 W213" },
    { label: "S-Class W223 (2021+)", value: "S-클래스 W223" },
    { label: "GLC X254 (2023+)", value: "GLC-클래스 X254" },
    { label: "GLC X253 (2015-2022)", value: "GLC-클래스 X253" },
    { label: "GLE W167 (2019+)", value: "GLE-클래스 W167" },
    { label: "GLS X167 (2019+)", value: "GLS-클래스 X167" },
  ],
  "Audi": [
    { label: "A4 B9 (2015+)", value: "A4 (B9)" },
    { label: "A6 C8 (2018+)", value: "A6 (C8)" },
    { label: "A8 D5 (2017+)", value: "A8 (D5)" },
    { label: "Q5 FY (2017+)", value: "Q5 (FY)" },
    { label: "Q7 4M (2015+)", value: "Q7 (4M)" },
    { label: "Q8 4M (2018+)", value: "Q8 (4M)" },
    { label: "e-tron GT", value: "e-트론 GT" },
  ],
  "Toyota": [
    { label: "Camry XV70 (2017-2024)", value: "캠리 (XV70)" },
    { label: "Camry XV80 (2024+)", value: "캠리 (XV80)" },
    { label: "RAV4 5th Gen (2018+)", value: "RAV4 5세대" },
    { label: "Prius 5th Gen (2023+)", value: "프리우스 5세대" },
    { label: "Crown Crossover (2022+)", value: "크라운 크로스오버" },
  ],
  "Lexus": [
    { label: "ES300h 7th Gen", value: "ES300h 7세대" },
    { label: "LS500h 5th Gen", value: "LS500h 5세대" },
    { label: "NX450h+ 2nd Gen (2021+)", value: "NX450h+ 2세대" },
    { label: "RX450h 4th Gen", value: "RX450h 4세대" },
  ],
  "Porsche": [
    { label: "Cayenne PO536 (2018+)", value: "카이엔 (PO536)" },
    { label: "Panamera 976 (2023+)", value: "파나메라 (976)" },
    { label: "911 (992) (2019+)", value: "911 (992)" },
    { label: "Taycan", value: "타이칸" },],
    "Volkswagen": [
    { label: "Tiguan 2nd Gen (2016+)", value: "티구안 2세대" },
    { label: "Passat B8", value: "파사트 (B8)" },
    { label: "Touareg 3rd Gen", value: "투아렉 3세대" },
    { label: "ID.4", value: "ID.4" },
    { label: "Golf 8th Gen", value: "골프 8세대" },
  ],
  "Land Rover": [
    { label: "Range Rover 5th Gen (2022+)", value: "레인지로버 5세대" },
    { label: "Range Rover Sport 3rd Gen", value: "레인지로버 스포츠 3세대" },
    { label: "Range Rover Velar", value: "레인지로버 벨라" },
    { label: "Discovery 5th Gen", value: "디스커버리 5세대" },
    { label: "Defender 90/110", value: "디펜더" },
  ],
  "Jaguar": [
    { label: "F-Pace", value: "F-페이스" },
    { label: "XE", value: "XE" },
    { label: "XF", value: "XF" },
    { label: "I-Pace", value: "I-페이스" },
  ],
  "MINI": [
    { label: "Countryman F60", value: "컨트리맨 (F60)" },
    { label: "Cooper 3-Door F56", value: "쿠퍼 3도어 (F56)" },
    { label: "Clubman F54", value: "클럽맨 (F54)" },
  ],
  "Ford": [
    { label: "Explorer 6th Gen", value: "익스플로러 6세대" },
    { label: "Mustang Mach-E", value: "머스탱 마하-E" },
    { label: "Bronco", value: "브롱코" },
  ],
  "Jeep": [
    { label: "Grand Cherokee WL (2021+)", value: "그랜드 체로키 WL" },
    { label: "Wrangler JL", value: "랭글러 JL" },
    { label: "Compass", value: "컴패스" },
  ],
  "Lincoln": [
    { label: "Navigator 4th Gen", value: "네비게이터 4세대" },
    { label: "Aviator", value: "에비에이터" },
  ],
  "Cadillac": [
    { label: "Escalade 5th Gen", value: "에스컬레이드 5세대" },
    { label: "XT5", value: "XT5" },
    { label: "XT6", value: "XT6" },
    { label: "Lyriq", value: "리릭" },
  ],
  "Infiniti": [
    { label: "QX80", value: "QX80" },
    { label: "QX60", value: "QX60" },
    { label: "Q50", value: "Q50" },
  ],
  "Maserati": [
    { label: "Ghibli", value: "기블리" },
    { label: "Levante", value: "르반떼" },
    { label: "Quattroporte", value: "콰트로포르테" },
    { label: "Grecale", value: "그레칼레" },
  ],
  "Honda": [
    { label: "Odyssey 5th Gen", value: "오디세이 5세대" },
    { label: "CR-V 6th Gen", value: "CR-V 6세대" },
    { label: "Accord 10th Gen", value: "어코드 10세대" },
  ],
  "Nissan": [
    { label: "Patrol Y62", value: "패트롤 Y62" },
    { label: "Murano 3rd Gen", value: "무라노 3세대" },
    { label: "Ariya", value: "아리야" },
  
  ],
  "Volvo": [
    { label: "XC60 2nd Gen (2017+)", value: "XC60 2세대" },
    { label: "XC90 2nd Gen", value: "XC90 2세대" },
    { label: "XC40 Recharge", value: "XC40 리차지" },
    { label: "C40 Recharge", value: "C40 리차지" },
  ],
};

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();
  const u = uf(updateFilter);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const fuelTypes = [
    { id: "gasoline", label: "بنزين" },
    { id: "diesel",   label: "ديزل" },
    { id: "hybrid",   label: "هايبرد" },
    { id: "electric", label: "كهرباء" },
  ];

  const bodyTypes = [
    { id: "sedan",     label: "سيدان" },
    { id: "suv",       label: "عائلية (SUV)" },
    { id: "hatchback", label: "هاتشباك" },
    { id: "coupe",     label: "كوبيه" },
  ];

  const selectedBrand    = filters.brand || "";
  const brandModels      = selectedBrand ? (BRAND_MODELS[selectedBrand] ?? []) : [];
  const hasModelList     = brandModels.length > 0;
  const selectedCountry  = ((filters as any).country ?? "") as CountryCode | "";
  const compatibleOnly   = !!((filters as any).compatibleOnly);

  const handleBrandChange = (brand: string) => {
    u("brand", brand || undefined);
    u("model", undefined);
  };

  const handleCountryChange = (country: string) => {
    u("country", country || undefined);
    if (!country) u("compatibleOnly", undefined);
  };

  const handleCompatibleToggle = (mode: "all" | "compatible") => {
    u("compatibleOnly", mode === "compatible" ? true : undefined);
    if (mode === "compatible" && selectedCountry) {
      updateFilter("yearFrom", COUNTRY_RULES[selectedCountry].minYear);
    } else {
      updateFilter("yearFrom", undefined);
    }
  };

  const toggleFuel  = (type: any) => updateFilter("fuelType",  filters.fuelType  === type ? undefined : type);
  const toggleBody  = (type: any) => updateFilter("bodyType",  filters.bodyType  === type ? undefined : type);
  const toggleColor = (key: string) => updateFilter("color",   filters.color     === key  ? undefined : (key as any));

  const colors = [
    { key: "white",     ar: "أبيض",      css: "#F8F8F8", border: "#D1D5DB" },
    { key: "silver",    ar: "فضي",        css: "#C0C0C0", border: "#9CA3AF" },
    { key: "gray",      ar: "رمادي",      css: "#6B7280", border: "#4B5563" },
    { key: "black",     ar: "أسود",       css: "#1A1A1A", border: "#374151" },
    { key: "red",       ar: "أحمر",       css: "#EF4444", border: "#DC2626" },
    { key: "orange",    ar: "برتقالي",    css: "#F97316", border: "#EA580C" },
    { key: "yellow",    ar: "أصفر",       css: "#EAB308", border: "#CA8A04" },
    { key: "green",     ar: "أخضر",       css: "#22C55E", border: "#16A34A" },
    { key: "lime",      ar: "أخضر فاتح", css: "#84CC16", border: "#65A30D" },
    { key: "lightblue", ar: "أزرق فاتح", css: "#60A5FA", border: "#3B82F6" },
    { key: "brown",     ar: "بني",        css: "#92400E", border: "#78350F" },
  ];

  const lightColors = ["white", "silver", "yellow", "lime"];

  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6", className)}>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          التصفية
        </h3>
        <button onClick={resetFilters} className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors">
          مسح الكل
        </button>
      </div>

      {/* Country Filter */}
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
              <option key={code} value={code}>{rule.flag} {rule.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {selectedCountry && (
          <div className="grid grid-cols-2 gap-2">
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
          <div className="bg-green-50 border border-green-300 rounded-xl px-3 py-2 text-xs text-green-800 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>يعرض فقط سيارات {COUNTRY_RULES[selectedCountry].minYear}+ المتوافقة مع {COUNTRY_RULES[selectedCountry].flag} {COUNTRY_RULES[selectedCountry].label}</span>
          </div>
        )}

        {selectedCountry && !compatibleOnly && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>بعض السيارات قد لا تتوافق مع اشتراطات {COUNTRY_RULES[selectedCountry].label}</span>
          </div>
        )}
      </div>

      {/* Brand */}
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
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Model */}
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
              {brandModels.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        ) : (
          <input
            type="text"
            placeholder={selectedBrand ? "اكتب اسم الموديل..." : "اختر الماركة أولاً أو اكتب الموديل..."}
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={(filters as any).model || ""}
            onChange={(e) => u("model", e.target.value || undefined)}
          />
        )}
      </div>

      {/* Year */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">سنة الصنع</label>
        <div className="grid grid-cols-2 gap-3">
          {(["yearFrom", "yearTo"] as const).map((key, i) => (
            <div key={key} className="relative">
              <select
                className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                value={filters[key] || ""}
                onChange={(e) => updateFilter(key, e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">{i === 0 ? "من" : "إلى"}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">السعر (مليون وون)</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="الحد الأدنى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMin || ""}
            onChange={(e) => updateFilter("priceMin", e.target.value ? parseInt(e.target.value) : undefined)} />
          <input type="number" placeholder="الحد الأقصى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMax || ""}
            onChange={(e) => updateFilter("priceMax", e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الممشى الأقصى (كم)</label>
        <input type="number" placeholder="مثال: 100000"
          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          value={filters.mileageMax || ""}
          onChange={(e) => updateFilter("mileageMax", e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      {/* Fuel */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع الوقود</label>
        <div className="grid grid-cols-2 gap-2">
          {fuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel.id;
            return (
              <button key={fuel.id} onClick={() => toggleFuel(fuel.id)}
                className={cn("py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
                {isSelected && <Check className="w-4 h-4" />}
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع السيارة</label>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((body) => {
            const isSelected = filters.bodyType === body.id;
            return (
              <button key={body.id} onClick={() => toggleBody(body.id)}
                className={cn("py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
                {isSelected && <Check className="w-4 h-4" />}
                {body.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">
          اللون
          {filters.color && (
            <button onClick={() => updateFilter("color", undefined)} className="mr-2 text-xs font-normal text-muted-foreground hover:text-destructive transition-colors">(مسح)</button>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const isSelected = filters.color === c.key;
            return (
              <button key={c.key} onClick={() => toggleColor(c.key)} title={c.ar}
                className={cn("relative w-8 h-8 rounded-full transition-all focus:outline-none",
                  isSelected ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:scale-105")}
                style={{ backgroundColor: c.css, border: `2px solid ${c.border}` }}>
                {isSelected && (
                  <Check className="absolute inset-0 m-auto w-4 h-4"
                    style={{ color: lightColors.includes(c.key) ? "#374151" : "#fff" }} />
                )}
              </button>
            );
          })}
        </div>
        {filters.color && <p className="text-xs text-muted-foreground">{colors.find((c) => c.key === filters.color)?.ar}</p>}
      </div>

      {/* Sunroof */}
      <div className="space-y-4 pt-4 border-t border-border">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" className="peer sr-only"
              checked={filters.sunroof || false}
              onChange={(e) => updateFilter("sunroof", e.target.checked || undefined)} />
            <div className="w-6 h-6 rounded-md border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary/50"></div>
            <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">فتحة سقف</span>
        </label>
      </div>

    </div>
  );
}

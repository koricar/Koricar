import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

type ModelOption = { label: string; value: string };

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
    { label: "1 Series F40 (2019+)", value: "1시리즈 (F40)" },
    { label: "2 Series Gran Coupe F44", value: "2시리즈 그란쿠페 (F44)" },
    { label: "3 Series G20 (2019+)", value: "3시리즈 (G20)" },
    { label: "3 Series F30 (2012-2018)", value: "3시리즈 (F30)" },
    { label: "3 Series E90 (2005-2011)", value: "3시리즈 (E90)" },
    { label: "4 Series F32", value: "4시리즈 (F32)" },
    { label: "5 Series G60 (2023+)", value: "5시리즈 (G60)" },
    { label: "5 Series G30 (2017-2023)", value: "5시리즈 (G30)" },
    { label: "5 Series F10 (2010-2017)", value: "5시리즈 (F10)" },
    { label: "6 Series GT G32", value: "6시리즈 GT (G32)" },
    { label: "7 Series G70 (2022+)", value: "7시리즈 (G70)" },
    { label: "7 Series G11", value: "7시리즈 (G11)" },
    { label: "X1 F48", value: "X1 (F48)" },
    { label: "X3 G01", value: "X3 (G01)" },
    { label: "X4 G02", value: "X4 (G02)" },
    { label: "X5 G05 (2018+)", value: "X5 (G05)" },
    { label: "X6 G06", value: "X6 (G06)" },
    { label: "X7 G07", value: "X7 (G07)" },
    { label: "iX3", value: "iX3" },
    { label: "i4", value: "i4" },
    { label: "iX", value: "iX" },
  ],
  "Mercedes-Benz": [
    { label: "A-Class W177 (2018+)", value: "A-클래스 W177" },
    { label: "C-Class W206 (2021+)", value: "C-클래스 W206" },
    { label: "C-Class W205 (2014-2021)", value: "C-클래스 W205" },
    { label: "C-Class W204 (2007-2014)", value: "C-클래스 W204" },
    { label: "E-Class W214 (2024+)", value: "E-클래스 W214" },
    { label: "E-Class W213 (2016-2023)", value: "E-클래스 W213" },
    { label: "E-Class W212 (2009-2016)", value: "E-클래스 W212" },
    { label: "S-Class W223 (2021+)", value: "S-클래스 W223" },
    { label: "S-Class W222 (2014-2020)", value: "S-클래스 W222" },
    { label: "S-Class W221 (2005-2013)", value: "S-클래스 W221" },
    { label: "CLS C257 (2018+)", value: "CLS-클래스 C257" },
    { label: "GLA X247 (2020+)", value: "GLA-클래스 X247" },
    { label: "GLA X156 (2014-2019)", value: "GLA-클래스 X156" },
    { label: "GLB X247 (2019+)", value: "GLB-클래스 X247" },
    { label: "GLC X254 (2023+)", value: "GLC-클래스 X254" },
    { label: "GLC X253 (2015-2022)", value: "GLC-클래스 X253" },
    { label: "GLE W167 (2019+)", value: "GLE-클래스 W167" },
    { label: "GLE W166 (2015-2019)", value: "GLE-클래스 W166" },
    { label: "GLS X167 (2019+)", value: "GLS-클래스 X167" },
    { label: "EQA H243", value: "EQA H243" },
    { label: "EQC N293", value: "EQC N293" },
  ],
  "Audi": [
    { label: "A3 8Y (2020+)", value: "A3 (8Y)" },
    { label: "A3 (New)", value: "뉴 A3" },
    { label: "A4 B9 (2015+)", value: "A4 (B9)" },
    { label: "A5 F5 (2016+)", value: "A5 (F5)" },
    { label: "A6 C8 (2018+)", value: "A6 (C8)" },
    { label: "A6 (New)", value: "뉴 A6" },
    { label: "A7 4K (2018+)", value: "A7 (4K)" },
    { label: "A8 D5 (2017+)", value: "A8 (D5)" },
    { label: "Q3 F3 (2019+)", value: "Q3 (F3)" },
    { label: "Q5 FY (2017+)", value: "Q5 (FY)" },
    { label: "Q7 4M (2015+)", value: "Q7 (4M)" },
    { label: "Q8 4M (2018+)", value: "Q8 (4M)" },
    { label: "e-tron", value: "e-트론" },
    { label: "e-tron GT", value: "e-트론 GT" },
  ],
  "Volkswagen": [
    { label: "Tiguan 2nd Gen (2016+)", value: "티구안 2세대" },
    { label: "Tiguan Allspace", value: "티구안 올스페이스" },
    { label: "Tiguan (New)", value: "뉴 티구안" },
    { label: "Golf 8th Gen (2019+)", value: "골프 8세대" },
    { label: "Golf 7th Gen", value: "골프 7세대" },
    { label: "Arteon", value: "아테온" },
    { label: "Jetta 7th Gen", value: "제타 7세대" },
    { label: "Touareg 3rd Gen (2018+)", value: "투아렉 3세대" },
    { label: "Passat (New)", value: "더 뉴 파사트" },
  ],
  "Toyota": [
    { label: "Camry XV80 (2024+)", value: "캠리 (XV80)" },
    { label: "Camry XV70 (2017-2024)", value: "캠리 (XV70)" },
    { label: "Camry (New)", value: "뉴 캠리" },
    { label: "RAV4 5th Gen (2018+)", value: "RAV4 5세대" },
    { label: "RAV4 4th Gen", value: "RAV4" },
    { label: "Prius 5th Gen (2023+)", value: "프리우스 5세대" },
    { label: "Prius 4th Gen (2015-2022)", value: "프리우스 4세대" },
    { label: "Crown Crossover (2022+)", value: "크라운 크로스오버" },
    { label: "Sienna 4th Gen", value: "시에나 4세대" },
    { label: "Avalon 5th Gen", value: "아발론 5세대" },
    { label: "GR86", value: "GR86" },
  ],
  "Lexus": [
    { label: "ES300h 7th Gen", value: "ES300h 7세대" },
    { label: "ES300h (New)", value: "뉴 ES300h" },
    { label: "ES350 (New)", value: "뉴 ES350" },
    { label: "IS250", value: "IS250" },
    { label: "IS300h", value: "IS300h" },
    { label: "LS500h 5th Gen", value: "LS500h 5세대" },
    { label: "LS460", value: "LS460" },
    { label: "NX450h+ 2nd Gen (2021+)", value: "NX450h+ 2세대" },
    { label: "NX350h 2nd Gen (2021+)", value: "NX350h 2세대" },
    { label: "NX300h 1st Gen", value: "NX300h" },
    { label: "RX450h 4th Gen", value: "RX450h 4세대" },
    { label: "UX250h", value: "UX250h" },
    { label: "CT200h", value: "CT200h" },
  ],
  "Porsche": [
    { label: "Cayenne PO536 (2018+)", value: "카이엔 (PO536)" },
    { label: "Cayenne (New)", value: "뉴 카이엔" },
    { label: "Panamera 971 (2016+)", value: "파나메라 (971)" },
    { label: "Panamera 976 (2023+)", value: "파나메라 (976)" },
    { label: "911 (992) (2019+)", value: "911 (992)" },
    { label: "Taycan", value: "타이칸" },
    { label: "Macan", value: "마칸" },
    { label: "718 Boxster", value: "718 박스터" },
    { label: "718 Cayman", value: "718 카이맨" },
  ],
  "Volvo": [
    { label: "XC60 2nd Gen (2017+)", value: "XC60 2세대" },
    { label: "XC90 2nd Gen", value: "XC90 2세대" },
    { label: "XC40", value: "XC40" },
    { label: "XC40 Recharge", value: "XC40 리차지" },
    { label: "C40 Recharge", value: "C40 리차지" },
    { label: "S90", value: "S90" },
    { label: "S60 3rd Gen", value: "S60 3세대" },
    { label: "S60", value: "S60" },
    { label: "V60 Cross Country 2nd Gen", value: "V60 크로스컨트리 2세대" },
    { label: "V90 Cross Country", value: "V90 크로스컨트리" },
  ],
};

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const fuelTypes = [
    { id: "gasoline", label: "بنزين" },
    { id: "diesel", label: "ديزل" },
    { id: "hybrid", label: "هايبرد" },
    { id: "electric", label: "كهرباء" },
  ];

  const bodyTypes = [
    { id: "sedan", label: "سيدان" },
    { id: "suv", label: "عائلية (SUV)" },
    { id: "hatchback", label: "هاتشباك" },
    { id: "coupe", label: "كوبيه" },
  ];

  const selectedBrand = filters.brand || "";
  const brandModels = selectedBrand ? (BRAND_MODELS[selectedBrand] ?? []) : [];
  const hasModelList = brandModels.length > 0;

  const handleBrandChange = (brand: string) => {
    updateFilter("brand", brand);
    updateFilter("model", undefined);
  };

  const toggleFuel = (type: any) => {
    updateFilter("fuelType", filters.fuelType === type ? undefined : type);
  };

  const toggleBody = (type: any) => {
    updateFilter("bodyType", filters.bodyType === type ? undefined : type);
  };

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

      {/* Brand Filter */}
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

      {/* Model Filter — dropdown when brand is selected, text input otherwise */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الموديل</label>
        {hasModelList ? (
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={filters.model || ""}
              onChange={(e) => updateFilter("model", e.target.value || undefined)}
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
            value={filters.model || ""}
            onChange={(e) => updateFilter("model", e.target.value || undefined)}
          />
        )}
      </div>

      {/* Year Range */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">سنة الصنع</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={filters.yearFrom || ""}
              onChange={(e) => updateFilter("yearFrom", e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">من</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={filters.yearTo || ""}
              onChange={(e) => updateFilter("yearTo", e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">إلى</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">السعر (مليون وون)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="الحد الأدنى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMin || ""}
            onChange={(e) => updateFilter("priceMin", e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <input
            type="number"
            placeholder="الحد الأقصى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMax || ""}
            onChange={(e) => updateFilter("priceMax", e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الممشى الأقصى (كم)</label>
        <input
          type="number"
          placeholder="مثال: 100000"
          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          value={filters.mileageMax || ""}
          onChange={(e) => updateFilter("mileageMax", e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>

      {/* Fuel Types */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع الوقود</label>
        <div className="grid grid-cols-2 gap-2">
          {fuelTypes.map((fuel) => {
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

      {/* Body Types */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع السيارة</label>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((body) => {
            const isSelected = filters.bodyType === body.id;
            return (
              <button
                key={body.id}
                onClick={() => toggleBody(body.id)}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {body.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checkboxes */}
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
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">فتحة سقف</span>
        </label>
      </div>

    </div>
  );
}

import { Link } from "wouter";
import { Gauge, Fuel, Settings2, MapPin, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import type { Car } from "@workspace/api-client-react";
import { COUNTRY_RULES, type CountryCode } from "@/components/filter-sidebar";

const COLOR_SWATCHES: Record<string, { css: string }> = {
  white:     { css: "#F8F8F8" },
  black:     { css: "#1A1A1A" },
  gray:      { css: "#6B7280" },
  silver:    { css: "#C0C0C0" },
  red:       { css: "#EF4444" },
  lightblue: { css: "#60A5FA" },
  brown:     { css: "#92400E" },
  green:     { css: "#22C55E" },
  yellow:    { css: "#EAB308" },
  orange:    { css: "#F97316" },
  lime:      { css: "#84CC16" },
};

const FUEL_MAP: Record<string, string> = {
  gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد", electric: "كهرباء",
};

const TRANS_MAP: Record<string, string> = {
  auto: "أوتوماتيك", manual: "عادي",
};

type Option = { id: string; ar: string };

function getCompatibility(year: number | undefined, country: CountryCode | "") {
  if (!country || !year) return null;
  const rule = COUNTRY_RULES[country];
  return year >= rule.minYear ? "compatible" : "incompatible";
}

// قراءة الدولة من sessionStorage
function getSelectedCountry(): CountryCode | "" {
  try {
    const saved = sessionStorage.getItem("car_search_filters");
    if (saved) {
      const parsed = JSON.parse(saved);
      return (parsed.country as CountryCode) || "";
    }
  } catch {}
  return "";
}

export function CarCard({ car }: { car: Car }) {
  const colorSwatch = COLOR_SWATCHES[car.color];
  const options: Option[] = (car as any).options ?? [];
  const selectedCountry = getSelectedCountry();
  const compatibility = getCompatibility(car.year, selectedCountry);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 flex flex-col h-full">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">

        {/* Source badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          {car.source}
          <ExternalLink className="w-3 h-3 text-primary" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {car.inspected && (
            <div className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              فحص معتمد
            </div>
          )}
          {car.sunroof && (
            <div className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
              فتحة سقف
            </div>
          )}
          {/* توافق الدولة */}
          {compatibility === "compatible" && selectedCountry && (
            <div className="bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {COUNTRY_RULES[selectedCountry].flag} متوافق
            </div>
          )}
          {compatibility === "incompatible" && selectedCountry && (
            <div className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {COUNTRY_RULES[selectedCountry].flag} غير متوافق
            </div>
          )}
        </div>

        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
            <span className="font-semibold opacity-50">لا توجد صورة</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">

        {/* Brand + Year */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-primary mb-1 block uppercase tracking-wider">{car.brand}</span>
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {car.model}
            </h3>
          </div>
          <div className="bg-secondary/50 text-secondary-foreground font-numbers font-bold text-sm px-2.5 py-1 rounded-md shrink-0">
            {car.year}
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-black font-numbers text-foreground">
            {car.priceFormatted || formatPriceKRW(car.price)}
          </span>
        </div>

        {/* تنبيه غير متوافق */}
        {compatibility === "incompatible" && selectedCountry && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>موديل {car.year} قد لا يدخل {COUNTRY_RULES[selectedCountry].label} — تواصل معنا للتأكد</span>
          </div>
        )}

        {/* Options */}
        {options.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">الخيارات</p>
            <div className="flex flex-wrap gap-1.5">
              {options.slice(0, 6).map((opt) => (
                <span key={opt.id} className="text-[11px] font-medium text-foreground/80 bg-secondary/70 border border-border/50 rounded-full px-2.5 py-1 leading-none">
                  {opt.ar}
                </span>
              ))}
              {options.length > 6 && (
                <span className="text-[11px] font-medium text-muted-foreground bg-secondary/40 border border-border/30 rounded-full px-2.5 py-1 leading-none">
                  +{options.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="font-numbers font-medium">{formatNumber(car.mileage)} كم</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="font-medium">{FUEL_MAP[car.fuelType] ?? car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="font-medium">{TRANS_MAP[car.transmission] ?? car.transmission}</span>
          </div>
          {car.colorAr ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-4 h-4 rounded-full border border-border/60 shrink-0 shadow-sm" style={{ backgroundColor: colorSwatch?.css ?? "#ccc" }} />
              <span className="font-medium">{car.colorAr}</span>
            </div>
          ) : car.location ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
              <span className="font-medium truncate">{car.location}</span>
            </div>
          ) : null}
        </div>

        <Link
          href={`/cars/${car.id}`}
          className="mt-5 w-full block text-center py-3 rounded-xl bg-secondary/50 text-secondary-foreground font-bold hover:bg-primary hover:text-white transition-all duration-300 active:scale-[0.98]"
        >
          التفاصيل كاملة
        </Link>
      </div>
    </div>
  );
}

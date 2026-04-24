import { Link } from "wouter";
import { Gauge, Fuel, Settings2, MapPin, ExternalLink, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
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
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 flex flex-col h-full">

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

        {/* Year pill on image */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full font-numbers shadow-lg">
          {car.year}
        </div>

        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
            <span className="font-semibold opacity-50">لا توجد صورة</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick view on hover */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
          <Link
            href={`/cars/${car.id}`}
            className="px-5 py-2 bg-white text-slate-900 text-xs font-black rounded-full shadow-lg flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            عرض التفاصيل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Brand + Model */}
        <div className="mb-2">
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{car.brand}</span>
          <h3 className="text-base font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors mt-0.5">
            {car.model}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-xl font-black font-numbers text-foreground">
            {car.priceFormatted || formatPriceKRW(car.price)}
          </span>
        </div>

        {/* Incompatibility warning */}
        {compatibility === "incompatible" && selectedCountry && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>موديل {car.year} قد لا يدخل {COUNTRY_RULES[selectedCountry].label}</span>
          </div>
        )}

        {/* Options */}
        {options.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {options.slice(0, 4).map((opt) => (
                <span key={opt.id} className="text-[10px] font-medium text-foreground/70 bg-secondary/60 border border-border/40 rounded-full px-2 py-0.5">
                  {opt.ar}
                </span>
              ))}
              {options.length > 4 && (
                <span className="text-[10px] font-medium text-muted-foreground bg-secondary/40 border border-border/30 rounded-full px-2 py-0.5">
                  +{options.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Gauge className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-numbers font-medium">{formatNumber(car.mileage)} كم</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Fuel className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-medium">{FUEL_MAP[car.fuelType] ?? car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-medium">{TRANS_MAP[car.transmission] ?? car.transmission}</span>
          </div>
          {car.colorAr ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <span className="w-3 h-3 rounded-full border border-border/60 shadow-sm block" style={{ backgroundColor: colorSwatch?.css ?? "#ccc" }} />
              </div>
              <span className="font-medium">{car.colorAr}</span>
            </div>
          ) : car.location ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium truncate">{car.location}</span>
            </div>
          ) : null}
        </div>

        {/* CTA */}
        <Link
          href={`/cars/${car.id}`}
          className="mt-4 w-full block text-center py-2.5 rounded-xl bg-secondary/60 text-secondary-foreground text-sm font-bold hover:bg-primary hover:text-white transition-all duration-300 active:scale-[0.98] group-hover:bg-primary group-hover:text-white"
        >
          التفاصيل كاملة
        </Link>
      </div>
    </div>
  );
}

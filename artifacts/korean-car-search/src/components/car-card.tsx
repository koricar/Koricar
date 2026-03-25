import { Link } from "wouter";
import {
  Gauge, Fuel, Settings2, MapPin, ExternalLink, ShieldCheck,
  Maximize2, Map, Camera, Flame, Wind, Key, Thermometer,
  ScanLine, Lightbulb, ArrowLeftRight, EyeOff, Monitor,
  Zap, Leaf, Plug, Mountain, MemoryStick, Armchair, Star,
} from "lucide-react";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import type { Car } from "@workspace/api-client-react";

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

type Option = { id: string; ar: string };

const OPTION_ICON: Record<string, React.ReactNode> = {
  sunroof_pano:    <Maximize2 className="w-5 h-5" />,
  sunroof:         <Maximize2 className="w-5 h-5" />,
  navigation:      <Map className="w-5 h-5" />,
  camera_rear:     <Camera className="w-5 h-5" />,
  camera_360:      <Camera className="w-5 h-5" />,
  heated_seat:     <Flame className="w-5 h-5" />,
  ventilated_seat: <Wind className="w-5 h-5" />,
  smart_key:       <Key className="w-5 h-5" />,
  leather_seat:    <Armchair className="w-5 h-5" />,
  auto_ac:         <Thermometer className="w-5 h-5" />,
  parking_sensor:  <ScanLine className="w-5 h-5" />,
  led_lights:      <Lightbulb className="w-5 h-5" />,
  cruise_control:  <Gauge className="w-5 h-5" />,
  lane_assist:     <ArrowLeftRight className="w-5 h-5" />,
  blind_spot:      <EyeOff className="w-5 h-5" />,
  hud:             <Monitor className="w-5 h-5" />,
  power_seat:      <Zap className="w-5 h-5" />,
  memory_seat:     <MemoryStick className="w-5 h-5" />,
  awd:             <Mountain className="w-5 h-5" />,
  hybrid:          <Leaf className="w-5 h-5" />,
  electric:        <Zap className="w-5 h-5" />,
  phev:            <Plug className="w-5 h-5" />,
};

export function CarCard({ car }: { car: Car }) {
  const translateFuel = (fuel: string) => {
    const map: Record<string, string> = {
      gasoline: "بنزين",
      diesel: "ديزل",
      hybrid: "هايبرد",
      electric: "كهرباء",
    };
    return map[fuel] || fuel;
  };

  const translateTransmission = (trans: string) => {
    const map: Record<string, string> = {
      auto: "اوتوماتيك",
      manual: "عادي",
    };
    return map[trans] || trans;
  };

  const colorSwatch = COLOR_SWATCHES[car.color];
  const options: Option[] = (car as any).options ?? [];

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          {car.source}
          <ExternalLink className="w-3 h-3 text-primary" />
        </div>

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
        </div>

        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground group-hover:scale-105 transition-transform duration-500">
            <span className="font-semibold opacity-50">لا توجد صورة</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-primary mb-1 block uppercase tracking-wider">{car.brand}</span>
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {car.model}
            </h3>
          </div>
          <div className="bg-secondary/50 text-secondary-foreground font-numbers font-bold text-sm px-2.5 py-1 rounded-md">
            {car.year}
          </div>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-black font-numbers text-foreground flex items-baseline gap-1">
            {car.priceFormatted || formatPriceKRW(car.price)}
          </span>
        </div>

        {/* Hardware Options Grid — icon tiles like the reference image */}
        {options.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">الخيارات المتاحة</p>
            <div className="grid grid-cols-4 gap-1.5">
              {options.slice(0, 8).map((opt) => (
                <div
                  key={opt.id}
                  className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl bg-secondary/60 border border-border/40 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  title={opt.ar}
                >
                  <span className="text-primary/80">
                    {OPTION_ICON[opt.id] ?? <Star className="w-5 h-5" />}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight line-clamp-2">
                    {opt.ar}
                  </span>
                </div>
              ))}
              {options.length > 8 && (
                <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl bg-secondary/40 border border-border/30">
                  <span className="text-xs font-bold text-muted-foreground">+{options.length - 8}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="w-4 h-4 text-primary/70" />
            <span className="font-numbers font-medium">{formatNumber(car.mileage)} كم</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{translateFuel(car.fuelType)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{translateTransmission(car.transmission)}</span>
          </div>
          {car.colorAr ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="w-4 h-4 rounded-full border border-border/60 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: colorSwatch?.css ?? "#ccc" }}
              />
              <span className="font-medium">{car.colorAr}</span>
            </div>
          ) : car.location ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70" />
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

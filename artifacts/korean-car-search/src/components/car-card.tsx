import { Link } from "wouter";
import { Gauge, Fuel, Settings2, MapPin, ExternalLink } from "lucide-react";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import type { Car } from "@workspace/api-client-react";

export function CarCard({ car }: { car: Car }) {
  // Translate types for display
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

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* Source Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          {car.source}
          <ExternalLink className="w-3 h-3 text-primary" />
        </div>
        
        {car.sunroof && (
          <div className="absolute top-3 left-3 z-10 bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
            فتحة سقف
          </div>
        )}

        {/* placeholder if no image, otherwise user-provided image */}
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
        
        {/* Gradient overlay for bottom of image */}
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
          {car.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="font-medium truncate">{car.location}</span>
            </div>
          )}
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

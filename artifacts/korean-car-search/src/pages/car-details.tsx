import { useParams, Link } from "wouter";
import { useGetCarById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Loader2, Calendar, Settings2, Fuel, Gauge
} from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRY_RULES, type CountryCode } from "@/components/country-rules";

const FUEL_MAP: Record<string, string> = { gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد", electric: "كهرباء" };
const TRANS_MAP: Record<string, string> = { auto: "أوتوماتيك", manual: "عادي" };

function getSelectedCountry(): CountryCode | "" {
  try {
    const saved = sessionStorage.getItem("car_search_filters");
    if (saved) return (JSON.parse(saved).country as CountryCode) || "";
  } catch {}
  return "";
}

export default function CarDetails() {
  const { id } = useParams();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const { data: carData, isLoading, isError } = useGetCarById(id || "", {
    query: { enabled: !!id }
  });

  const car = carData as any;

  useEffect(() => {
    setCurrentImgIndex(0);
  }, [id]);

  const carImages: string[] = Array.isArray(car?.images) && car.images.length > 0 
    ? car.images 
    : (car?.imageUrl ? [car.imageUrl] : []);

  const nextImage = () => {
    if (carImages.length <= 1) return;
    setCurrentImgIndex((prev) => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    if (carImages.length <= 1) return;
    setCurrentImgIndex((prev) => (prev - 1 + carImages.length) % carImages.length);
  };

  if (isLoading) {
    return <Layout><div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-primary mb-4" /></div></Layout>;
  }

  if (isError || !car) {
    return <Layout><div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4"><h2 className="text-3xl font-black mb-4">السيارة غير موجودة</h2><Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-xl">العودة للبحث</Link></div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-muted border-b border-border/50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">{car?.model || "—"}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            
            <motion.div className="rounded-3xl overflow-hidden shadow-2xl bg-card aspect-[16/10] relative group">
              {carImages.length > 0 ? (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={carImages[currentImgIndex]}
                      src={carImages[currentImgIndex]}
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    />
                  </AnimatePresence>
                  {carImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute right-4 p-2 rounded-full bg-black/50 text-white">❮</button>
                      <button onClick={nextImage} className="absolute left-4 p-2 rounded-full bg-black/50 text-white">❯</button>
                    </>
                  )}
                </div>
              ) : <div className="w-full h-full flex items-center justify-center bg-secondary">لا توجد صور</div>}
            </motion.div>

            {carImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {carImages.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImgIndex(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 ${i === currentImgIndex ? "border-primary" : ""}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* تم تحديث هذا القسم ليظهر البيانات */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center">
                <Calendar className="w-5 h-5 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">السنة</span>
                <span className="font-bold">{car?.year || "—"}</span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center">
                <Gauge className="w-5 h-5 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">الممشى</span>
                <span className="font-bold">{car?.mileage || "—"}</span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center">
                <Fuel className="w-5 h-5 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">الوقود</span>
                <span className="font-bold">{FUEL_MAP[car?.fuel?.toLowerCase() as string] || car?.fuel || "—"}</span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center">
                <Settings2 className="w-5 h-5 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">الناقل</span>
                <span className="font-bold">{TRANS_MAP[car?.transmission?.toLowerCase() as string] || car?.transmission || "—"}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-28 space-y-6">
                <QuoteRequestForm carName={car?.title || car?.model} carPrice={car?.priceFormatted || formatPriceKRW(car?.price || 0)} carId={car?.id} />
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

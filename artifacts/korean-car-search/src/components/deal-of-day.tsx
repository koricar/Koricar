import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const DEALS = [
  {
    id: 1,
    brand: "HYUNDAI",
    brandEn: "hyundai",
    model: "Palisade 3.8 4WD",
    modelEn: "palisade",
    year: 2022,
    ourPriceAR: 87700,
    images: [
      "https://www.hyundaiusa.com/content/dam/hyundai/us/myhyundai/Image/2024/palisade/compare/2024-Hyundai-Palisade-compare.jpg",
      "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ],
    accent: "#3b82f6",
    mileage: "42,000 كم",
    fuel: "بنزين",
    inspected: true,
  },
  {
    id: 2,
    brand: "KIA",
    brandEn: "kia",
    model: "Sportage 1.6T AWD",
    modelEn: "sportage",
    year: 2023,
    ourPriceAR: 78200,
    images: [
      "https://www.kia.com/content/dam/kia/global/en/models/sportage/nq5/24my/pc/kv/sportage-24my-pc-kv.jpg",
      "https://images.unsplash.com/photo-1622251802628-3b91e0bf46ea?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    accent: "#10b981",
    mileage: "18,500 كم",
    fuel: "هايبرد",
    inspected: true,
  },
  {
    id: 3,
    brand: "GENESIS",
    brandEn: "genesis",
    model: "G80 2.5T",
    modelEn: "g80",
    year: 2023,
    ourPriceAR: 112500,
    images: [
      "https://www.genesis.com/content/dam/genesis-app/models/g80/2024/exterior/genesis-g80-2024-exterior-01.jpg",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
    ],
    accent: "#8b5cf6",
    mileage: "9,200 كم",
    fuel: "بنزين",
    inspected: true,
  },
];

// أسعار السوق الخليجي (ريال سعودي)
const GULF_PRICES: Record<string, Record<number, number>> = {
  "hyundai palisade": { 2020: 118000, 2021: 125000, 2022: 135000, 2023: 145000, 2024: 158000 },
  "hyundai tucson":   { 2020: 78000,  2021: 85000,  2022: 92000,  2023: 98000,  2024: 108000 },
  "hyundai sonata":   { 2020: 72000,  2021: 78000,  2022: 84000,  2023: 90000,  2024: 98000  },
  "kia sportage":     { 2020: 82000,  2021: 88000,  2022: 95000,  2023: 105000, 2024: 115000 },
  "kia sorento":      { 2020: 95000,  2021: 102000, 2022: 112000, 2023: 122000, 2024: 132000 },
  "kia carnival":     { 2021: 115000, 2022: 125000, 2023: 135000, 2024: 145000 },
  "genesis g80":      { 2020: 145000, 2021: 155000, 2022: 168000, 2023: 180000, 2024: 195000 },
  "genesis gv80":     { 2021: 175000, 2022: 188000, 2023: 200000, 2024: 215000 },
  "genesis g70":      { 2020: 118000, 2021: 125000, 2022: 135000, 2023: 145000 },
};

function getGulfPrice(brandEn: string, modelEn: string, year: number): number | null {
  const key = `${brandEn} ${modelEn}`;
  const prices = GULF_PRICES[key];
  if (!prices) return null;
  if (prices[year]) return prices[year];
  const years = Object.keys(prices).map(Number).sort();
  const closest = years.reduce((prev, curr) =>
    Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
  );
  return prices[closest];
}

// مكون الصورة مع fallback تلقائي
function CarImage({ images, alt }: { images: string[]; alt: string }) {
  const [imgIndex, setImgIndex] = useState(0);

  return (
    <img
      src={images[imgIndex]}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        if (imgIndex < images.length - 1) {
          setImgIndex(imgIndex + 1);
        }
      }}
    />
  );
}

function useCountdown() {
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s <= 1 ? getSecondsUntilMidnight() : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { h, m, s };
}

export function DealOfDay() {
  const [current, setCurrent] = useState(0);
  const { h, m, s } = useCountdown();
  const deal = DEALS[current];

  const marketPrice = getGulfPrice(deal.brandEn, deal.modelEn, deal.year);
  const saving = marketPrice ? marketPrice - deal.ourPriceAR : null;
  const savingPct = saving && marketPrice ? Math.round((saving / marketPrice) * 100) : null;

  return (
    <section className="py-10 bg-gradient-to-b from-slate-950 to-slate-900" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-orange-400 text-[11px] uppercase tracking-widest font-bold">عرض اليوم الحصري</p>
              <h2 className="text-white text-xl font-black">سعر لن يتكرر غداً 🔥</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-xs">ينتهي خلال</span>
            <div className="flex items-center gap-1">
              {[h, m, s].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-slate-800 text-white font-black text-sm px-2 py-1 rounded-lg font-numbers min-w-[32px] text-center">
                    {unit}
                  </span>
                  {i < 2 && <span className="text-orange-400 font-black">:</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deal Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{ boxShadow: `0 0 60px ${deal.accent}22` }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden bg-slate-800">
                <CarImage
                  images={deal.images}
                  alt={`${deal.brand} ${deal.model}`}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-900/60 to-transparent" />

                {saving && saving > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg shadow-orange-500/40">
                    وفّر {saving.toLocaleString()} ريال 💰
                  </div>
                )}

                {deal.inspected && (
                  <div className="absolute bottom-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    فحص معتمد
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-1/2 p-6 bg-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: deal.accent }}>
                    {deal.brand}
                  </span>
                  <h3 className="text-white text-2xl font-black mt-1 mb-1">{deal.model}</h3>
                  <p className="text-slate-400 text-sm mb-4">{deal.year} • {deal.mileage} • {deal.fuel}</p>

                  <div className="bg-slate-800/60 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">السوق المحلي الخليجي</span>
                      {marketPrice ? (
                        <span className="text-slate-300 text-sm line-through font-numbers">
                          {marketPrice.toLocaleString()} ريال
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">غير متوفر</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-sm">سعرنا شامل كل شيء</span>
                      <span className="font-black text-xl font-numbers" style={{ color: deal.accent }}>
                        {deal.ourPriceAR.toLocaleString()} ريال
                      </span>
                    </div>

                    {saving && saving > 0 && savingPct && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
                        <span className="text-orange-400 text-xs font-bold">💰 توفيرك</span>
                        <span className="text-orange-400 font-black text-sm font-numbers">
                          {saving.toLocaleString()} ريال ({savingPct}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/search"
                    className="flex-1 text-center py-3 rounded-xl font-bold text-white text-sm transition-all"
                    style={{ background: deal.accent, boxShadow: `0 8px 24px ${deal.accent}44` }}
                  >
                    احجز الآن ←
                  </Link>
                  <Link
                    href="/search"
                    className="px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {DEALS.map((d, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 8,
                background: i === current ? deal.accent : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

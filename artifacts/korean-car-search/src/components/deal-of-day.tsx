import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
import { Link } from "wouter";

const DEALS = [
  {
    id: 1,
    brand: "HYUNDAI",
    brandEn: "Hyundai",
    model: "Palisade 3.8 4WD",
    modelEn: "Palisade",
    year: 2022,
    priceKRW: "3,200만원",
    ourPriceAR: 87700,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    accent: "#3b82f6",
    mileage: "42,000 كم",
    fuel: "بنزين",
    inspected: true,
  },
  {
    id: 2,
    brand: "KIA",
    brandEn: "Kia",
    model: "Sportage 1.6T AWD",
    modelEn: "Sportage",
    year: 2023,
    priceKRW: "2,850만원",
    ourPriceAR: 78200,
    image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80",
    accent: "#10b981",
    mileage: "18,500 كم",
    fuel: "هايبرد",
    inspected: true,
  },
  {
    id: 3,
    brand: "GENESIS",
    brandEn: "Genesis",
    model: "G80 2.5T",
    modelEn: "G80",
    year: 2023,
    priceKRW: "4,100만원",
    ourPriceAR: 112500,
    image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
    accent: "#8b5cf6",
    mileage: "9,200 كم",
    fuel: "بنزين",
    inspected: true,
  },
];

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

const API_BASE = import.meta.env.VITE_API_URL || "https://koricar-ba7l.onrender.com";

export function DealOfDay() {
  const [current, setCurrent] = useState(0);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState("");
  const [loadingPrice, setLoadingPrice] = useState(false);
  const { h, m, s } = useCountdown();
  const deal = DEALS[current];

  // جلب سعر السوق من API
  useEffect(() => {
    setMarketPrice(null);
    setPriceSource("");
    setLoadingPrice(true);

    const fetchPrice = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/market-price?brand=${deal.brandEn}&model=${deal.modelEn}&year=${deal.year}`
        );
        const data = await res.json();
        if (data.marketPrice) {
          setMarketPrice(data.marketPrice);
          setPriceSource(data.source);
        }
      } catch (e) {
        console.error("Failed to fetch market price:", e);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [current]);

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

          {/* Countdown */}
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
              <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden bg-slate-800">
                <img src={deal.image} alt={deal.model} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 to-transparent" />

                {/* Saving badge — يظهر فقط لو عندنا سعر حقيقي */}
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

                  {/* Price comparison */}
                  <div className="bg-slate-800/60 rounded-xl p-4 mb-4 border border-white/5">

                    {/* سعر السوق المحلي */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">السوق المحلي الخليجي</span>
                      {loadingPrice ? (
                        <span className="flex items-center gap-1 text-slate-500 text-xs">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          جاري البحث...
                        </span>
                      ) : marketPrice ? (
                        <div className="text-left">
                          <span className="text-slate-300 text-sm line-through font-numbers">
                            {marketPrice.toLocaleString()} ريال
                          </span>
                          {priceSource && (
                            <p className="text-slate-500 text-[10px] mt-0.5">المصدر: {priceSource}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">غير متوفر حالياً</span>
                      )}
                    </div>

                    {/* سعرنا */}
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-sm">سعرنا شامل كل شيء</span>
                      <span className="font-black text-xl font-numbers" style={{ color: deal.accent }}>
                        {deal.ourPriceAR.toLocaleString()} ريال
                      </span>
                    </div>

                    {/* التوفير */}
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

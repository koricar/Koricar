import { useEffect, useRef } from "react";
import { Flame, TrendingDown, Bell, Zap } from "lucide-react";

const TICKER_ITEMS = [
  { icon: <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />, text: "تم بيع 7 سيارات اليوم — الطلب مرتفع! 🔥" },
  { icon: <TrendingDown className="w-3.5 h-3.5 text-green-400 shrink-0" />, text: "Hyundai Tucson 2022 — وصل للتو بسعر 38,500 ريال فقط" },
  { icon: <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />, text: "KIA Sportage 2023 — أرخص بـ 30,000 ريال من السوق المحلي!" },
  { icon: <Bell className="w-3.5 h-3.5 text-blue-400 shrink-0" />, text: "Genesis G80 2024 — سعر مفاجئ: 95,000 ريال شامل الشحن والجمارك" },
  { icon: <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />, text: "عرض محدود: فحص مجاني مع كل طلب استيراد هذا الأسبوع ✅" },
  { icon: <TrendingDown className="w-3.5 h-3.5 text-green-400 shrink-0" />, text: "Hyundai Palisade 2023 — توفير يصل إلى 45,000 ريال مقارنة بالسوق" },
  { icon: <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />, text: "أكثر من 230,000 سيارة كورية متاحة الآن — ابحث عن سيارتك!" },
];

export function TickerBanner() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="w-full overflow-hidden bg-slate-900 border-b border-slate-700/60 py-2 relative z-40"
      dir="rtl"
    >
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: "ticker 40s linear infinite",
          width: "max-content",
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-slate-300 text-xs font-medium"
          >
            {item.icon}
            {item.text}
            <span className="text-slate-600 mx-2">•</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

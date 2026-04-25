import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const EXAMPLES = [
  { model: "Hyundai Tucson 2022",  local: 98000,  ours: 58000 },
  { model: "KIA Sportage 2023",    local: 115000, ours: 74000 },
  { model: "Hyundai Sonata 2023",  local: 88000,  ours: 52000 },
  { model: "Genesis G80 2023",     local: 168000, ours: 108000 },
  { model: "Hyundai Palisade 2022",local: 135000, ours: 88000 },
];

export function SavingsPopup() {
  const [visible, setVisible] = useState(false);
  const [example] = useState(() => EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);

  useEffect(() => {
    // Show after 8 seconds, only once per session
    const shown = sessionStorage.getItem("savings_popup_shown");
    if (shown) return;
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("savings_popup_shown", "1");
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const saving = example.local - example.ours;
  const pct = Math.round((saving / example.local) * 100);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setVisible(false)}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
            dir="rtl"
          >
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-sm w-full pointer-events-auto">

              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />

              {/* Header */}
              <div className="p-5 pb-0 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 text-[11px] font-bold uppercase tracking-widest">مقارنة الأسعار</p>
                    <p className="text-white font-black text-base">وفّر {saving.toLocaleString()} ريال! 💰</p>
                  </div>
                </div>
                <button
                  onClick={() => setVisible(false)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  هل تعلم أن <span className="text-white font-bold">{example.model}</span> في السوق المحلي يكلف أكثر بكثير مما نقدمه؟
                </p>

                {/* Comparison bars */}
                <div className="space-y-3 mb-5">
                  {/* Local market */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">السوق المحلي</span>
                      <span className="text-slate-300 font-numbers font-bold">{example.local.toLocaleString()} ريال</span>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/70 rounded-full w-full" />
                    </div>
                  </div>

                  {/* Our price */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">سعرنا شامل كل شيء</span>
                      <span className="text-green-400 font-numbers font-bold">{example.ours.toLocaleString()} ريال</span>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(example.ours / example.local) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Saving highlight */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-5 flex items-center justify-between">
                  <span className="text-green-300 text-sm font-bold">توفيرك المتوقع</span>
                  <span className="text-green-400 font-black text-lg font-numbers">
                    {saving.toLocaleString()} ريال ({pct}%)
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href="/search"
                  onClick={() => setVisible(false)}
                  className="w-full block text-center py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  ابحث عن سيارتك الآن
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setVisible(false)}
                  className="w-full text-center text-slate-500 text-xs mt-3 hover:text-slate-400 transition-colors"
                >
                  لا شكراً، سأدفع أكثر في السوق المحلي
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

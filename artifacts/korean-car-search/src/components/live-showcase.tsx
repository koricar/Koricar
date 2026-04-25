import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, ExternalLink, Play, Users, Eye } from "lucide-react";
import { Link } from "wouter";

// غيّر هذا لما يكون عندك فيديو أو Live
const YOUTUBE_CHANNEL = "@KoriCarSA";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@KoriCarSA";

// لما تبدأ Live، ضع Live Video ID هنا
// مثال: https://youtube.com/watch?v=ABC123 → VIDEO_ID = "ABC123"
const LIVE_VIDEO_ID = ""; // اتركه فارغ لما ما في Live

// فيديو تجريبي لما ما في Live (فيديو عن السيارات الكورية)
// غيّره بأول فيديو تنشره
const DEMO_VIDEO_ID = "tPMEGMqMlvA";

const HIGHLIGHTS = [
  { icon: "🔍", title: "بحث ذكي", desc: "ابحث من بين 200,000+ سيارة" },
  { icon: "💰", title: "أسعار مفاجئة", desc: "وفّر حتى 50% مقارنة بالسوق" },
  { icon: "✅", title: "فحص معتمد", desc: "كل سيارة مفحوصة ميكانيكياً" },
  { icon: "🚢", title: "شحن لبابك", desc: "نتولى كل شيء حتى الاستلام" },
];

export function LiveShowcase() {
  const [isLive, setIsLive] = useState(!!LIVE_VIDEO_ID);
  const [viewers] = useState(Math.floor(Math.random() * 200) + 50);

  const videoId = LIVE_VIDEO_ID || DEMO_VIDEO_ID;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;

  return (
    <section className="py-12 bg-slate-950" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 mb-4">
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">بث مباشر الآن</span>
                <span className="flex items-center gap-1 text-red-400 text-xs">
                  <Users className="w-3 h-3" />
                  {viewers}
                </span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">شاهد كيف يعمل الموقع</span>
              </>
            )}
          </div>

          <h2 className="text-white text-2xl md:text-4xl font-black mb-2">
            {isLive ? "🔴 نحن الآن في بث مباشر!" : "شاهد كوري‌كار في العمل 🎬"}
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            {isLive
              ? "انضم الآن وشاهد كيف نساعدك تجد سيارتك الكورية المثالية بأفضل سعر"
              : "نشرح كيف تبحث وتستورد سيارتك الكورية خطوة بخطوة"
            }
          </p>
        </motion.div>

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Left — YouTube */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900"
            style={{ minHeight: 320 }}
          >
            {/* Live badge */}
            {isLive && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}

            {/* YouTube embed */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                title="KoriCar YouTube"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Channel info */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm">
                  K
                </div>
                <div>
                  <p className="text-white font-bold text-sm">كوري‌كار</p>
                  <p className="text-slate-400 text-xs">{YOUTUBE_CHANNEL}</p>
                </div>
              </div>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                اشترك
              </a>
            </div>
          </motion.div>

          {/* Right — Website highlights */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Website preview card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-slate-800 rounded-lg px-3 py-1 text-slate-400 text-xs font-numbers">
                  koricar-ba7l.onrender.com
                </div>
              </div>

              {/* Mini website preview */}
              <div className="bg-slate-800 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-black text-sm">كوري‌<span className="text-primary">كار</span></span>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">+200K سيارة</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {["Hyundai Palisade", "KIA Sportage", "Genesis G80", "KIA Carnival"].map((car) => (
                    <div key={car} className="bg-slate-700/50 rounded-lg p-2">
                      <div className="w-full h-8 bg-slate-600/50 rounded mb-1" />
                      <p className="text-white text-[10px] font-bold truncate">{car}</p>
                      <p className="text-primary text-[10px] font-numbers">من 45,000 ريال</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/search"
                  className="block w-full text-center py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  ابحث الآن ←
                </Link>
              </div>
            </div>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-3">
              {HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900 border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/search"
              className="block w-full text-center py-3.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              ابدأ البحث عن سيارتك الآن ←
            </Link>
          </motion.div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-500 text-xs mt-6">
          {isLive
            ? "🔴 البث المباشر يعمل الآن — انضم وشارك أسئلتك"
            : "📅 نبث مباشرة كل أسبوع — اشترك في القناة لتصلك الإشعارات"
          }
        </p>
      </div>
    </section>
  );
}

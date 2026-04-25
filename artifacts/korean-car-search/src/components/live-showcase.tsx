import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const YOUTUBE_CHANNEL = "@KoriCarSA";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@KoriCarSA";
const LIVE_VIDEO_ID = "";
const DEMO_VIDEO_ID = "8aYaL-a3hCY";

export function LiveShowcase() {
  const [isLive] = useState(!!LIVE_VIDEO_ID);
  const [viewers] = useState(Math.floor(Math.random() * 200) + 50);

  const videoId = LIVE_VIDEO_ID || DEMO_VIDEO_ID;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <section className="py-12 bg-slate-950" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

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

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900"
        >
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
            <div className="flex items-center gap-3">
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                اشترك في القناة
              </a>
              <Link
                href="/search"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors"
              >
                ابحث الآن ←
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom note */}
        <p className="text-center text-slate-500 text-xs mt-5">
          {isLive
            ? "🔴 البث المباشر يعمل الآن — انضم وشارك أسئلتك"
            : "📅 اشترك في القناة لتصلك إشعارات البث المباشر الأسبوعي"
          }
        </p>
      </div>
    </section>
  );
}

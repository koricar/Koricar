import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, FilterX, ChevronLeft, ChevronRight, Car, Bell } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useSearchCars } from "@workspace/api-client-react";
import { useCarFilters } from "@/hooks/use-car-filters";
import { Layout } from "@/components/layout";
import { CarCard } from "@/components/car-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { useAlertContext } from "@/contexts/alert-context";
import { useState, useEffect, useRef } from "react";
import { TickerBanner } from "@/components/ticker-banner";
import { DealOfDay } from "@/components/deal-of-day";
import { SavingsPopup } from "@/components/savings-popup";

const BRAND_ALIASES: Record<string, string> = {
  "bmw": "BMW", "bimmer": "BMW",
  "mercedes": "Mercedes-Benz", "benz": "Mercedes-Benz", "mercedes-benz": "Mercedes-Benz",
  "hyundai": "Hyundai", "kia": "Kia", "genesis": "Genesis", "audi": "Audi",
  "toyota": "Toyota", "lexus": "Lexus", "porsche": "Porsche",
  "volkswagen": "Volkswagen", "vw": "Volkswagen", "volvo": "Volvo",
  "ford": "Ford", "jeep": "Jeep",
  "land rover": "Land Rover", "landrover": "Land Rover", "range rover": "Land Rover",
  "mini": "MINI", "nissan": "Nissan", "honda": "Honda", "infiniti": "Infiniti",
  "ssangyong": "SsangYong", "chevrolet": "Chevrolet", "chevy": "Chevrolet",
  "ferrari": "Ferrari", "lamborghini": "Lamborghini", "maserati": "Maserati",
  "بي ام دبليو": "BMW", "بي أم دبليو": "BMW", "بي ام": "BMW", "بي إم دبليو": "BMW",
  "مرسيدس": "Mercedes-Benz", "بنز": "Mercedes-Benz", "مرسيدس بنز": "Mercedes-Benz",
  "هيونداي": "Hyundai", "هونداي": "Hyundai", "هيونده": "Hyundai",
  "كيا": "Kia", "جينيسيس": "Genesis", "جنيسس": "Genesis", "جينيسس": "Genesis",
  "اودي": "Audi", "أودي": "Audi", "تويوتا": "Toyota", "طيوطا": "Toyota",
  "لكزس": "Lexus", "لكسس": "Lexus", "بورش": "Porsche", "بورشه": "Porsche",
  "فولكس": "Volkswagen", "فولكسفاغن": "Volkswagen", "فولفو": "Volvo",
  "فورد": "Ford", "جيب": "Jeep",
  "رنج روفر": "Land Rover", "لاندروفر": "Land Rover", "رينج روفر": "Land Rover",
  "ميني": "MINI", "نيسان": "Nissan", "هوندا": "Honda",
  "انفينيتي": "Infiniti", "إنفينيتي": "Infiniti", "سانيونج": "SsangYong",
  "شيفروليه": "Chevrolet", "شيفرولية": "Chevrolet",
  "فيراري": "Ferrari", "لامبورغيني": "Lamborghini", "مازيراتي": "Maserati",
};

function parseHeroSearch(text: string): { brand?: string; model?: string } {
  const lower = text.toLowerCase().trim();
  const sorted = Object.entries(BRAND_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, brand] of sorted) {
    if (lower.includes(alias)) {
      const remaining = text.trim().replace(new RegExp(alias, "i"), "").trim();
      return { brand, model: remaining || undefined };
    }
  }
  return { model: text.trim() || undefined };
}

const HOW_IT_WORKS = [
  { step: "١", icon: "🔍", title: "ابحث عن سيارتك", desc: "ابحث من بين أكثر من 200,000 سيارة كورية بفلاتر دقيقة: الماركة، الموديل، السعر، اللون، والمزيد." },
  { step: "٢", icon: "📋", title: "اطلب تسعيرة مجانية", desc: "اختر السيارة واضغط 'طلب تسعيرة استيراد' — سنرسل لك التكلفة الكاملة شاملة الشحن والجمارك." },
  { step: "٣", icon: "🛡️", title: "فحص وتخليص جمركي", desc: "نتولى فحص السيارة ميكانيكياً وظاهرياً، ونعالج كافة الإجراءات الجمركية نيابةً عنك." },
  { step: "٤", icon: "🚗", title: "استلم سيارتك", desc: "توصيل السيارة إلى بلدك بأمان. أنت تنتظر فقط — نحن نتولى الباقي!" },
];

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=1600&q=80",
    badge: "🔥 أكثر من 200,000 سيارة",
    title: "استورد سيارتك الكورية",
    highlight: "بثقة وسهولة",
    sub: "نبحث في أكبر منصات بيع السيارات في كوريا (Encar, K Car) لنوفر لك أفضل الخيارات.",
    accent: "#3b82f6",
  },
  {
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&q=80",
    badge: "⚡ هايبرد وكهرباء",
    title: "مستقبل السيارات",
    highlight: "في يدك الآن",
    sub: "أحدث موديلات هايبرد وكهربائية بفحص معتمد وأسعار تنافسية مباشرة من كوريا.",
    accent: "#10b981",
  },
  {
    image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1600&q=80",
    badge: "🏆 Genesis & Hyundai",
    title: "الفخامة الكورية",
    highlight: "بأسعار لا تصدق",
    sub: "أفخم السيارات الكورية بفحص معتمد وضمان جودة عالية — من كوريا إلى بابك.",
    accent: "#8b5cf6",
  },
  {
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&q=80",
    badge: "🚙 عائلية وعملية",
    title: "SUV وسيدان",
    highlight: "لكل احتياج",
    sub: "تشكيلة ضخمة من السيارات العائلية والاقتصادية — اختر ما يناسبك بكل سهولة.",
    accent: "#f59e0b",
  },
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80",
    badge: "✅ فحص وشحن وجمارك",
    title: "استيراد متكامل",
    highlight: "نحن نتولى كل شيء",
    sub: "من الفحص الميكانيكي إلى التخليص الجمركي — نوفر لك تجربة استيراد آمنة 100%.",
    accent: "#06b6d4",
  },
];

function HeroCarousel({
  query,
  onQueryChange,
  onSearch,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressVal = useRef(0);
  const DURATION = 5000;

  const goTo = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
    progressVal.current = 0;
  };

  const goNext = () => goTo((current + 1) % HERO_SLIDES.length);
  const goPrev = () => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    if (paused) return;
    progressVal.current = 0;
    setProgress(0);
    const step = 100 / (DURATION / 50);
    const id = setInterval(() => {
      progressVal.current += step;
      setProgress(Math.min(progressVal.current, 100));
      if (progressVal.current >= 100) {
        clearInterval(id);
        goNext();
      }
    }, 50);
    return () => clearInterval(id);
  }, [current, paused]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "520px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/75 to-slate-900/40" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <div className="h-full transition-none" style={{ width: `${progress}%`, background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div key={`badge-${current}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-sm font-bold backdrop-blur-sm"
            style={{ background: `${slide.accent}22`, borderColor: `${slide.accent}55`, color: slide.accent }}
          >
            {slide.badge}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1 key={`title-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 leading-tight"
          >
            {slide.title} <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${slide.accent}, #fff)` }}>
              {slide.highlight}
            </span>
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p key={`sub-${current}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            {slide.sub}
          </motion.p>
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="relative w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
            <input
              type="text"
              placeholder="ابحث عن ماركة، موديل، أو مواصفات..."
              className="w-full bg-transparent border-none text-white placeholder:text-white/50 px-12 py-4 text-lg font-medium focus:outline-none focus:ring-0"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
            />
          </div>
          <button onClick={onSearch} className="hidden sm:block px-8 py-4 text-white rounded-xl font-bold transition-all shadow-lg" style={{ background: slide.accent }}>
            بحث
          </button>
        </motion.div>

        <div className="flex gap-3 mt-8 flex-wrap justify-center">
          {[
            { icon: "🚗", num: "+200K", label: "سيارة متاحة" },
            { icon: "🛡️", num: "100%",  label: "فحص معتمد" },
            { icon: "🌍", num: "شحن",   label: "دولي سريع" },
            { icon: "💬", num: "24/7",  label: "دعم فوري" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 text-white text-sm font-bold" style={{ background: "rgba(255,255,255,0.08)" }}>
              <span>{s.icon}</span>
              <span style={{ color: slide.accent }}>{s.num}</span>
              <span className="text-white/70 font-normal">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute top-5 left-5 z-20 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white text-xs font-bold">
        {current + 1} / {HERO_SLIDES.length}
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {HERO_SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i)} className="h-2 rounded-full transition-all duration-300"
            style={{ width: i === current ? 28 : 8, background: i === current ? s.accent : "rgba(255,255,255,0.4)", boxShadow: i === current ? `0 0 8px ${s.accent}` : "none" }}
          />
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            كيف يعمل koricar؟
          </span>
          <h2 className="text-3xl font-black text-foreground mb-3">4 خطوات بسيطة</h2>
          <p className="text-muted-foreground text-lg">وسيارتك الكورية في بابك 🚢</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-10 right-[12.5%] left-[12.5%] h-0.5 bg-gradient-to-l from-primary/10 via-primary/40 to-primary/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 group-hover:border-primary/40 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-lg shadow-primary/40">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { filters, updateFilter, resetFilters } = useCarFilters({ page: 1, limit: 12 });
  const { openModal } = useAlertContext();
  const [debouncedModel] = useDebounce(filters.model, 500);
  const apiParams = { ...filters, query: undefined, model: debouncedModel || undefined };

  const handleHeroSearch = () => {
    const raw = filters.query?.trim();
    if (!raw) return;
    const { brand, model } = parseHeroSearch(raw);
    if (brand) updateFilter("brand", brand);
    updateFilter("model", model || undefined);
    updateFilter("query", undefined);
    updateFilter("page", 1);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const { data, isLoading, isError } = useSearchCars(apiParams);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <Layout>
      {/* ── Ticker ── */}
      <TickerBanner />

      {/* ── Hero Carousel ── */}
      <HeroCarousel
        query={filters.query || ""}
        onQueryChange={(v) => updateFilter("query", v || undefined)}
        onSearch={handleHeroSearch}
      />

      {/* ── Deal of the Day ── */}
      <DealOfDay />

      {/* ── How It Works ── */}
      <HowItWorks />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-border" />
      </div>

      {/* ── Results ── */}
      <section id="results-section" className="py-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                نتائج البحث
                {data?.total !== undefined && (
                  <span className="inline-block ms-3 text-sm font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-full font-numbers">
                    {data.total} سيارة
                  </span>
                )}
              </h2>
              <button onClick={() => openModal(filters)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 hover:border-primary transition-all">
                <Bell className="w-4 h-4" />
                تنبيه بهذا البحث
              </button>
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">جاري جلب السيارات المتاحة...</p>
              </div>
            ) : isError ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-destructive text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <FilterX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">عذراً، حدث خطأ</h3>
                <p className="text-muted-foreground max-w-md">يرجى المحاولة مرة أخرى لاحقاً أو تغيير معايير البحث.</p>
              </div>
            ) : !data || data.cars.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Car className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">لا توجد نتائج</h3>
                <p className="text-muted-foreground max-w-md mb-8">لم نتمكن من العثور على سيارات تطابق معايير البحث الخاصة بك.</p>
                <button onClick={resetFilters} className="px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors">
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <>
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {data.cars.map((car) => (
                      <motion.div key={car.id} variants={itemVariants} layout>
                        <CarCard car={car} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {data.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button disabled={data.page <= 1} onClick={() => updateFilter('page', data.page - 1)} className="p-3 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1 font-numbers px-4 font-bold text-foreground">
                      <span className="w-8 text-center">{data.page}</span>
                      <span className="text-muted-foreground font-sans font-normal mx-1">من</span>
                      <span className="w-8 text-center">{data.totalPages}</span>
                    </div>
                    <button disabled={data.page >= data.totalPages} onClick={() => updateFilter('page', data.page + 1)} className="p-3 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Savings Popup ── */}
      <SavingsPopup />
    </Layout>
  );
}

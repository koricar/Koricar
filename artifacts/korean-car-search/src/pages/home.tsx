import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, FilterX, ChevronLeft, ChevronRight, Car, Bell } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useSearchCars } from "@workspace/api-client-react";
import { useCarFilters } from "@/hooks/use-car-filters";
import { Layout } from "@/components/layout";
import { CarCard } from "@/components/car-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { useAlertContext } from "@/contexts/alert-context";

// Map of Arabic and English brand names to the official brand key
const BRAND_ALIASES: Record<string, string> = {
  // English
  "bmw": "BMW", "bimmer": "BMW",
  "mercedes": "Mercedes-Benz", "benz": "Mercedes-Benz", "mercedes-benz": "Mercedes-Benz",
  "hyundai": "Hyundai",
  "kia": "Kia",
  "genesis": "Genesis",
  "audi": "Audi",
  "toyota": "Toyota",
  "lexus": "Lexus",
  "porsche": "Porsche",
  "volkswagen": "Volkswagen", "vw": "Volkswagen",
  "volvo": "Volvo",
  "ford": "Ford",
  "jeep": "Jeep",
  "land rover": "Land Rover", "landrover": "Land Rover", "range rover": "Land Rover",
  "mini": "MINI",
  "nissan": "Nissan",
  "honda": "Honda",
  "infiniti": "Infiniti",
  "ssangyong": "SsangYong",
  "chevrolet": "Chevrolet", "chevy": "Chevrolet",
  "ferrari": "Ferrari",
  "lamborghini": "Lamborghini",
  "maserati": "Maserati",
  // Arabic
  "بي ام دبليو": "BMW", "بي أم دبليو": "BMW", "بي ام": "BMW", "بي إم دبليو": "BMW",
  "مرسيدس": "Mercedes-Benz", "بنز": "Mercedes-Benz", "مرسيدس بنز": "Mercedes-Benz",
  "هيونداي": "Hyundai", "هونداي": "Hyundai", "هيونده": "Hyundai",
  "كيا": "Kia",
  "جينيسيس": "Genesis", "جنيسس": "Genesis", "جينيسس": "Genesis",
  "اودي": "Audi", "أودي": "Audi",
  "تويوتا": "Toyota", "طيوطا": "Toyota",
  "لكزس": "Lexus", "لكسس": "Lexus",
  "بورش": "Porsche", "بورشه": "Porsche",
  "فولكس": "Volkswagen", "فولكسفاغن": "Volkswagen",
  "فولفو": "Volvo",
  "فورد": "Ford",
  "جيب": "Jeep",
  "رنج روفر": "Land Rover", "لاندروفر": "Land Rover", "رينج روفر": "Land Rover",
  "ميني": "MINI",
  "نيسان": "Nissan",
  "هوندا": "Honda",
  "انفينيتي": "Infiniti", "إنفينيتي": "Infiniti",
  "سانيونج": "SsangYong",
  "شيفروليه": "Chevrolet", "شيفرولية": "Chevrolet",
  "فيراري": "Ferrari",
  "لامبورغيني": "Lamborghini",
  "مازيراتي": "Maserati",
};

function parseHeroSearch(text: string): { brand?: string; model?: string } {
  const lower = text.toLowerCase().trim();
  // Sort by length descending so "land rover" matches before "land"
  const sorted = Object.entries(BRAND_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, brand] of sorted) {
    if (lower.includes(alias)) {
      const remaining = text.trim().replace(new RegExp(alias, "i"), "").trim();
      return { brand, model: remaining || undefined };
    }
  }
  // No brand found — treat the whole text as a model search
  return { model: text.trim() || undefined };
}

export default function Home() {
  const { filters, updateFilter, resetFilters } = useCarFilters({ page: 1, limit: 12 });
  const { openModal } = useAlertContext();

  // Debounce text inputs before sending to API
  const [debouncedModel] = useDebounce(filters.model, 500);
  const apiParams = {
    ...filters,
    query: undefined,
    model: debouncedModel || undefined,
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Korean Cars Hero" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
          >
            استورد سيارتك الكورية <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">بثقة وسهولة</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            نبحث في أكبر منصات بيع السيارات في كوريا (Encar, K Car) لنوفر لك أفضل الخيارات مع ضمان الجودة والشفافية.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center"
          >
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
              <input
                type="text"
                placeholder="ابحث عن ماركة، موديل، أو مواصفات..."
                className="w-full bg-transparent border-none text-white placeholder:text-white/50 px-12 py-4 text-lg font-medium focus:outline-none focus:ring-0"
                value={filters.query || ""}
                onChange={(e) => updateFilter("query", e.target.value || undefined)}
                onKeyDown={(e) => { if (e.key === "Enter") handleHeroSearch(); }}
              />
            </div>
            <button
              onClick={handleHeroSearch}
              className="hidden sm:block px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              بحث
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section id="results-section" className="py-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar 
                filters={filters} 
                updateFilter={updateFilter} 
                resetFilters={resetFilters} 
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                نتائج البحث
                {data?.total !== undefined && (
                  <span className="inline-block ms-3 text-sm font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-full font-numbers">
                    {data.total} سيارة
                  </span>
                )}
              </h2>
              <button
                onClick={() => openModal(filters)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Bell className="w-4 h-4" />
                تنبيه بهذا البحث
              </button>
            </div>

            {/* Content State */}
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
                <p className="text-muted-foreground max-w-md mb-8">لم نتمكن من العثور على سيارات تطابق معايير البحث الخاصة بك. جرب إزالة بعض الفلاتر.</p>
                <button 
                  onClick={resetFilters}
                  className="px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {data.cars.map((car) => (
                      <motion.div key={car.id} variants={itemVariants} layout>
                        <CarCard car={car} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button 
                      disabled={data.page <= 1}
                      onClick={() => updateFilter('page', data.page - 1)}
                      className="p-3 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 font-numbers px-4 font-bold text-foreground">
                      <span className="w-8 text-center">{data.page}</span>
                      <span className="text-muted-foreground font-sans font-normal mx-1">من</span>
                      <span className="w-8 text-center">{data.totalPages}</span>
                    </div>

                    <button 
                      disabled={data.page >= data.totalPages}
                      onClick={() => updateFilter('page', data.page + 1)}
                      className="p-3 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </section>
    </Layout>
  );
}

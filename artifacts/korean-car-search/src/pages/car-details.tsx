import { useParams, Link } from "wouter";
import { useGetCarById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import {
  Loader2, Calendar, Settings2, Fuel, MapPin, Gauge,
  ShieldCheck, Check, ExternalLink, AlertTriangle, Zap
} from "lucide-react";
import ImportCalculator from "@/components/ImportCalculator";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { motion } from "framer-motion";
import { COUNTRY_RULES, type CountryCode } from "@/components/country-rules";

function toArabicUrl(url: string): string {
  return `https://translate.yandex.com/translate?url=${encodeURIComponent(url)}&lang=ko-ar`;
}

const FUEL_MAP: Record<string, string> = {
  gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد", electric: "كهرباء",
};

const TRANS_MAP: Record<string, string> = {
  auto: "أوتوماتيك", manual: "عادي",
};

const BODY_MAP: Record<string, string> = {
  sedan: "سيدان", suv: "دفع رباعي", hatchback: "هاتشباك", coupe: "كوبيه",
};

function getSelectedCountry(): CountryCode | "" {
  try {
    const saved = sessionStorage.getItem("car_search_filters");
    if (saved) return (JSON.parse(saved).country as CountryCode) || "";
  } catch {}
  return "";
}

function ChevronLeftIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const { data: car, isLoading, isError } = useGetCarById(id || "", {
    query: { enabled: !!id }
  });

  const selectedCountry = getSelectedCountry();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-bold text-muted-foreground">جاري تحميل بيانات السيارة...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !car) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-black mb-4">السيارة غير موجودة</h2>
          <p className="text-muted-foreground mb-8 max-w-md">السيارة التي تبحث عنها غير متوفرة أو تم إزالتها.</p>
          <Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
            العودة للبحث
          </Link>
        </div>
      </Layout>
    );
  }

  const isCompatible = selectedCountry && car.year
    ? car.year >= COUNTRY_RULES[selectedCountry].minYear
    : null;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted border-b border-border/50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="text-foreground">{car.brand}</span>
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="text-foreground line-clamp-1">{car.model}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-lg uppercase tracking-wider">{car.brand}</span>
                <span className="px-3 py-1 bg-white border border-border shadow-sm font-bold text-sm rounded-lg">المصدر: {car.source}</span>
                {car.inspected && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-200 font-bold text-sm rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> فحص معتمد
                  </span>
                )}
                {isCompatible === true && selectedCountry && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-200 font-bold text-sm rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    {COUNTRY_RULES[selectedCountry].flag} متوافق مع {COUNTRY_RULES[selectedCountry].label}
                  </span>
                )}
                {isCompatible === false && selectedCountry && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-700 border border-red-200 font-bold text-sm rounded-lg flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {COUNTRY_RULES[selectedCountry].flag} قد لا يدخل {COUNTRY_RULES[selectedCountry].label}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground">{car.model}</h1>
            </div>
            <div className="text-start md:text-end">
              <p className="text-sm text-muted-foreground font-bold mb-1">السعر التقريبي</p>
              <div className="text-4xl md:text-5xl font-black font-numbers text-primary">
                {car.priceFormatted || formatPriceKRW(car.price)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card aspect-[16/10] relative group"
            >
              {car.imageUrl ? (
                <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-muted-foreground text-lg font-bold">لا توجد صورة متوفرة</span>
                </div>
              )}
              {car.sunroof && (
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl shadow-lg border border-white/10">
                  فتحة سقف ✓
                </div>
              )}
            </motion.div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar,  label: "سنة الصنع",     value: car.year?.toString() ?? "—" },
                { icon: Gauge,     label: "الممشى",         value: car.mileage != null ? `${formatNumber(car.mileage)} كم` : "—" },
                { icon: Fuel,      label: "الوقود",         value: FUEL_MAP[car.fuelType] ?? car.fuelType ?? "—" },
                { icon: Settings2, label: "ناقل الحركة",    value: TRANS_MAP[car.transmission] ?? car.transmission ?? "—" },
              ].map((spec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <spec.icon className="w-6 h-6 text-primary mb-3" />
                  <p className="text-sm text-muted-foreground font-semibold mb-1">{spec.label}</p>
                  <p className="text-lg font-bold text-foreground font-numbers">{spec.value}</p>
                </motion.div>
              ))}
            </div>

            {/* تنبيه عدم التوافق */}
            {isCompatible === false && selectedCountry && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 mb-1">⚠️ تنبيه كفاءة الطاقة</p>
                  <p className="text-sm text-red-700">
                    موديل {car.year} قد لا يتوافق مع اشتراطات {COUNTRY_RULES[selectedCountry].label} (الحد الأدنى {COUNTRY_RULES[selectedCountry].minYear}).
                    تواصل معنا للتحقق قبل الطلب.
                  </p>
                  <a
                    href="https://www.saso.gov.sa/ar/eservices/Pages/MainEServicesDetails.aspx?serviceid=426"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-red-700 underline hover:text-red-900"
                  >
                    <Zap className="w-4 h-4" />
                    تحقق من التوافق على موقع هيئة المواصفات السعودية
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">ملاحظات إضافية</h3>
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">المواصفات والإضافات</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">

              {/* Action Card */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
                <h3 className="text-xl font-bold mb-6">هل ترغب باستيراد هذه السيارة؟</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">فحص شامل للسيارة</p>
                      <p className="text-xs text-muted-foreground">فحص ظاهري وميكانيكي قبل الشراء</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">تخليص جمركي آمن</p>
                      <p className="text-xs text-muted-foreground">نتولى كافة الإجراءات القانونية</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">التحقق من كفاءة الطاقة</p>
                      <a
                        href="https://www.saso.gov.sa/ar/eservices/Pages/MainEServicesDetails.aspx?serviceid=426"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline hover:text-primary/80 flex items-center gap-1 mt-0.5"
                      >
                        تحقق على موقع هيئة المواصفات
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <QuoteRequestForm carName={car.title} carPrice={car.priceFormatted} carId={car.id} />
                <ImportCalculator carPriceKRW={car.price * 10000} />

                {car.sourceUrl && (
                  <div className="flex flex-col gap-2 mt-4">
                    <a
                      href={toArabicUrl(car.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-secondary text-secondary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
                    >
                      رؤية الإعلان مترجماً
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={car.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 text-center text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      الإعلان الأصلي بالكورية
                    </a>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h4 className="font-bold mb-4">ملخص المواصفات</h4>
                <ul className="space-y-3">
                  {[
                    { label: "نوع الهيكل",   value: BODY_MAP[car.bodyType] ?? car.bodyType },
                    { label: "اللون",         value: car.colorAr ?? car.color },
                    { label: "الموقع",        value: car.location, icon: <MapPin className="w-3 h-3 text-primary inline ml-1" /> },
                    { label: "تاريخ العرض",   value: car.createdAt ? new Date(car.createdAt).toLocaleDateString("ar-SA") : "غير محدد" },
                  ].filter(item => item.value).map((item, i, arr) => (
                    <li key={i} className={`flex justify-between ${i < arr.length - 1 ? "border-b border-border/50 pb-3" : "pb-1"}`}>
                      <span className="text-muted-foreground text-sm">{item.label}</span>
                      <span className="font-bold text-sm">
                        {item.icon}{item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

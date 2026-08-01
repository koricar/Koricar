import { useParams, Link } from "wouter";
import { useGetCarById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Loader2, Calendar, Settings2, Fuel, Gauge, Car, Palette,
  Armchair, MapPin, Hash, DollarSign, CheckCircle2, Shield,
  Fuel as FuelIcon, Cog, Ruler, Users, Paintbrush
} from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { motion, AnimatePresence } from "framer-motion";

const FUEL_MAP: Record<string, string> = {
  gasoline: "بنزين",
  diesel: "ديزل",
  hybrid: "هايبرد",
  electric: "كهرباء",
  hydrogen: "هيدروجين",
  lpg: "غاز LPG",
};

const TRANS_MAP: Record<string, string> = {
  auto: "أوتوماتيك",
  manual: "عادي",
};

const TABS = [
  { id: "specs", label: "المواصفات" },
  { id: "features", label: "المميزات" },
  { id: "inspection", label: "الفحص والمميزات" },
];

export default function CarDetails() {
  const { id } = useParams();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "inspection">("specs");

  const { data: carData, isLoading, isError } = useGetCarById(id || "", {
    query: { enabled: !!id }
  });

  const car = carData as any;

  useEffect(() => {
    setCurrentImgIndex(0);
    setActiveTab("specs");
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
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        </div>
      </Layout>
    );
  }

  if (isError || !car) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-3xl font-black mb-4">السيارة غير موجودة</h2>
          <Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-xl">
            العودة للبحث
          </Link>
        </div>
      </Layout>
    );
  }

  // ─── بيانات المواصفات ───
  const specsList = [
    { label: "الشركة المصنعة", value: car?.brand || "—", icon: <Car className="w-4 h-4" /> },
    { label: "الموديل", value: car?.model || "—", icon: <Hash className="w-4 h-4" /> },
    { label: "سنة الصنع", value: car?.year || "—", icon: <Calendar className="w-4 h-4" /> },
    { label: "الجيل", value: car?.generation || car?.model || "—", icon: <Car className="w-4 h-4" /> },
    { label: "ناقل الحركة", value: TRANS_MAP[car?.transmission?.toLowerCase()] || car?.transmission || "—", icon: <Cog className="w-4 h-4" /> },
    { label: "المسافة المقطوعة", value: car?.mileage ? `${formatNumber(car.mileage)} كم` : "—", icon: <Gauge className="w-4 h-4" /> },
    { label: "الوقود", value: FUEL_MAP[car?.fuelType?.toLowerCase()] || car?.fuelType || "—", icon: <FuelIcon className="w-4 h-4" /> },
    { label: "سعة المحرك", value: car?.displacement ? `${car.displacement} cc` : "—", icon: <Settings2 className="w-4 h-4" /> },
    { label: "اللون", value: car?.colorAr || car?.color || "—", icon: <Palette className="w-4 h-4" /> },
    { label: "لون المقاعد", value: car?.seatColor || "—", icon: <Armchair className="w-4 h-4" /> },
    { label: "نوع الهيكل", value: car?.bodyTypeAr || car?.bodyType || "—", icon: <Ruler className="w-4 h-4" /> },
    { label: "عدد المقاعد", value: car?.seatCount || "—", icon: <Users className="w-4 h-4" /> },
    { label: "الموقع", value: car?.location || "—", icon: <MapPin className="w-4 h-4" /> },
    { label: "رقم الهيكل (VIN)", value: car?.vin || "—", icon: <Hash className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      {/* ─── Header ─── */}
      <div className="bg-muted border-b border-border/50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2">
            {car?.model || "—"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {car?.brand} · {car?.year} · {FUEL_MAP[car?.fuelType?.toLowerCase()] || car?.fuelType}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ─── العمود الأيسر (الصور + التبويبات) ─── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* معرض الصور */}
            <motion.div className="rounded-3xl overflow-hidden shadow-2xl bg-card aspect-[16/10] relative group">
              {carImages.length > 0 ? (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={carImages[currentImgIndex]}
                      src={carImages[currentImgIndex]}
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  </AnimatePresence>
                  {carImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
                        ❮
                      </button>
                      <button onClick={nextImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
                        ❯
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {carImages.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === currentImgIndex ? "bg-white" : "bg-white/40"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  لا توجد صور
                </div>
              )}
            </motion.div>

            {/* الصور المصغرة */}
            {carImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {carImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImgIndex(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                      i === currentImgIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* ─── التبويبات ─── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* رأس التبويبات */}
              <div className="flex border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 text-sm font-bold transition relative ${
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* محتوى التبويبات */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  
                  {/* تبويب المواصفات */}
                  {activeTab === "specs" && (
                    <motion.div
                      key="specs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {specsList.map((spec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {spec.icon}
                            <span className="text-sm">{spec.label}</span>
                          </div>
                          <span className="font-bold text-foreground text-sm">{spec.value}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* تبويب المميزات */}
                  {activeTab === "features" && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* الميزات الرئيسية (features) */}
                      {car?.features?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            المميزات العامة
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {car.features.map((feat: string, i: number) => (
                              <span
                                key={i}
                                className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* الخيارات (options) */}
                      {car?.options?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            المواصفات التقنية
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {car.options.map((opt: any, i: number) => (
                              <span
                                key={i}
                                className="px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium border border-border"
                              >
                                {opt.ar || opt.label || opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* خيارات Choice المدفوعة */}
                      {car?.choiceOptions?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            إضافات اختيارية (مدفوعة)
                          </h3>
                          <div className="space-y-2">
                            {car.choiceOptions.map((opt: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50"
                              >
                                <span className="text-sm">{opt.nameKr || opt.name}</span>
                                {opt.price && (
                                  <span className="text-sm font-bold text-primary">
                                    +{formatNumber(opt.price)} ₩
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!car?.features?.length && !car?.options?.length && !car?.choiceOptions?.length) && (
                        <p className="text-muted-foreground text-center py-8">لا توجد مميزات مسجلة</p>
                      )}
                    </motion.div>
                  )}

                  {/* تبويب الفحص */}
                  {activeTab === "inspection" && (
                    <motion.div
                      key="inspection"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <Shield className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="font-bold text-green-700">فحص معتمد</h3>
                          <p className="text-sm text-green-600">
                            {car?.inspected
                              ? "تم فحص هذه السيارة من قبل جهة معتمدة"
                              : "لم يتم تأكيد حالة الفحص"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-muted-foreground text-sm block mb-1">الموقع</span>
                          <span className="font-bold">{car?.location || "—"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-muted-foreground text-sm block mb-1">المصدر</span>
                          <span className="font-bold">{car?.source || "—"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-muted-foreground text-sm block mb-1">رقم الهيكل</span>
                          <span className="font-bold text-xs">{car?.vin || "—"}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-muted-foreground text-sm block mb-1">رابط المصدر</span>
                          <a
                            href={car?.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-primary text-sm hover:underline"
                          >
                            عرض في Encar ↗
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ─── العمود الأيمن (السعر + نموذج الطلب) ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* بطاقة السعر */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
                <span className="text-muted-foreground text-sm block mb-1">السعر</span>
                <div className="text-3xl font-black text-primary mb-1">
                  {car?.priceFormatted || formatPriceKRW(car?.price || 0)}
                </div>
                {car?.price && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {Math.round(car.price * 27.4).toLocaleString()} ريال سعودي
                  </p>
                )}
              </div>

              {/* نموذج طلب عرض السعر */}
              <QuoteRequestForm
                carName={car?.title || car?.model}
                carPrice={car?.priceFormatted || formatPriceKRW(car?.price || 0)}
                carId={car?.id}
              />

              {/* زر الواتساب السريع */}
              <a
                href={`https://wa.me/?text=استفسار عن ${car?.model} - ${car?.priceFormatted}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                طلب عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useParams, Link } from "wouter";
import { useGetCarById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Loader2, Calendar, Settings2, Fuel, Gauge, Car, Palette,
  Armchair, MapPin, Hash, DollarSign, CheckCircle2, Shield,
  Fuel as FuelIcon, Cog, Ruler, Users, Paintbrush, AlertTriangle,
  History, UserCheck, ShieldCheck
} from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { motion, AnimatePresence } from "framer-motion";

const FUEL_MAP: Record<string, string> = {
  gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد",
  electric: "كهرباء", hydrogen: "هيدروجين", lpg: "غاز LPG",
};

const TRANS_MAP: Record<string, string> = {
  auto: "أوتوماتيك", manual: "عادي",
};

const TABS = [
  { id: "specs", label: "المواصفات" },
  { id: "features", label: "المميزات" },
  { id: "inspection", label: "الفحص والمميزات" },
];

// ─── SVG بسيط للهيكل الخارجي (من الأعلى) ───
function CarTopViewSVG({ damagedParts = [] }: { damagedParts?: string[] }) {
  const isDamaged = (part: string) => damagedParts.includes(part);
  const partClass = (part: string) =>
    isDamaged(part) ? "fill-red-500/40 stroke-red-500" : "fill-gray-200/50 stroke-gray-400";

  return (
    <svg viewBox="0 0 200 320" className="w-full h-full max-h-[280px]">
      {/* الهيكل الأساسي */}
      <rect x="60" y="40" width="80" height="240" rx="20" className="fill-gray-100 stroke-gray-300" strokeWidth="2"/>
      {/* الزجاج الأمامي */}
      <path d="M70 60 L130 60 L125 90 L75 90 Z" className="fill-blue-100/50 stroke-blue-300" strokeWidth="1.5"/>
      {/* الزجاج الخلفي */}
      <path d="M75 230 L125 230 L130 260 L70 260 Z" className="fill-blue-100/50 stroke-blue-300" strokeWidth="1.5"/>
      {/* السقف */}
      <rect x="75" y="95" width="50" height="130" rx="5" className="fill-gray-50 stroke-gray-300" strokeWidth="1.5"/>
      {/* الكبوت */}
      <rect x="65" y="45" width="70" height="40" rx="8" className={partClass("hood")}/>
      {/* الصندوق */}
      <rect x="65" y="235" width="70" height="40" rx="8" className={partClass("trunk")}/>
      {/* الباب الأمامي الأيمن */}
      <rect x="60" y="100" width="15" height="60" rx="3" className={partClass("frontDoorRight")}/>
      {/* الباب الأمامي الأيسر */}
      <rect x="125" y="100" width="15" height="60" rx="3" className={partClass("frontDoorLeft")}/>
      {/* الباب الخلفي الأيمن */}
      <rect x="60" y="165" width="15" height="60" rx="3" className={partClass("rearDoorRight")}/>
      {/* الباب الخلفي الأيسر */}
      <rect x="125" y="165" width="15" height="60" rx="3" className={partClass("rearDoorLeft")}/>
      {/* العجلات */}
      <circle cx="45" cy="80" r="12" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
      <circle cx="155" cy="80" r="12" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
      <circle cx="45" cy="240" r="12" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
      <circle cx="155" cy="240" r="12" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
    </svg>
  );
}

// ─── SVG للهيكل الأساسي (من الأمام) ───
function CarFrontViewSVG({ damagedParts = [] }: { damagedParts?: string[] }) {
  const isDamaged = (part: string) => damagedParts.includes(part);
  const partClass = (part: string) =>
    isDamaged(part) ? "fill-red-500/40 stroke-red-500" : "fill-gray-200/50 stroke-gray-400";

  return (
    <svg viewBox="0 0 200 280" className="w-full h-full max-h-[280px]">
      {/* الهيكل */}
      <path d="M40 80 Q40 40 100 40 Q160 40 160 80 L160 200 Q160 240 100 240 Q40 240 40 200 Z" className="fill-gray-100 stroke-gray-300" strokeWidth="2"/>
      {/* الزجاج الأمامي */}
      <path d="M55 85 Q55 55 100 55 Q145 55 145 85 L140 110 L60 110 Z" className="fill-blue-100/50 stroke-blue-300" strokeWidth="1.5"/>
      {/* الشبكة */}
      <rect x="70" y="120" width="60" height="30" rx="5" className={partClass("grille")}/>
      {/* المصابيح */}
      <circle cx="55" cy="135" r="12" className={partClass("headlightLeft")}/>
      <circle cx="145" cy="135" r="12" className={partClass("headlightRight")}/>
      {/* الصدام */}
      <rect x="45" y="160" width="110" height="25" rx="8" className={partClass("bumperFront")}/>
      {/* العجلات */}
      <circle cx="45" cy="210" r="18" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
      <circle cx="155" cy="210" r="18" className="fill-gray-300 stroke-gray-400" strokeWidth="2"/>
    </svg>
  );
}

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

  // ─── بيانات الفحص ───
  const inspection = car?.inspection;
  const insurance = car?.insurance;
  const hasInspectionData = !!inspection || !!insurance;
  const hasDamage = inspection?.hasDamage || (inspection?.damageCount || 0) > 0;
  const damagedParts = inspection?.parts?.filter((p: any) => p.damaged).map((p: any) => p.name) || [];

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
                  
                  {/* ═══ تبويب المواصفات ═══ */}
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

                  {/* ═══ تبويب المميزات ═══ */}
                  {activeTab === "features" && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
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

                  {/* ═══ تبويب الفحص والمميزات ═══ */}
                  {activeTab === "inspection" && (
                    <motion.div
                      key="inspection"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* ─── تقرير الفحص ─── */}
                      <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                          تقرير الفحص
                        </h3>

                        {hasInspectionData ? (
                          <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
                            hasDamage
                              ? "bg-red-500/5 border-red-500/20"
                              : "bg-green-500/5 border-green-500/20"
                          }`}>
                            <div className={`p-3 rounded-full ${
                              hasDamage ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"
                            }`}>
                              {hasDamage ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                            </div>
                            <div>
                              <p className={`font-bold text-lg ${hasDamage ? "text-red-700" : "text-green-700"}`}>
                                {hasDamage
                                  ? `يوجد ${inspection?.damageCount || damagedParts.length} ضرر مسجل على هيكل السيارة`
                                  : "لا توجد أضرار مُسجّلة على هيكل هذه السيارة"}
                              </p>
                              {!hasDamage && (
                                <p className="text-sm text-green-600 mt-1">
                                  الهيكل الخارجي والأساسي بحالة ممتازة
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 rounded-2xl bg-muted/50 border border-border/50 text-center">
                            <p className="text-muted-foreground">لا توجد بيانات فحص متوفرة لهذه السيارة</p>
                          </div>
                        )}
                      </div>

                      {/* ─── الهيكل الخارجي والأساسي ─── */}
                      {hasInspectionData && (
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <h4 className="font-bold text-lg">الهيكل الخارجي</h4>
                            <h4 className="font-bold text-lg text-muted-foreground">الهيكل الأساسي</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 rounded-2xl p-6 border border-border/50">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground mb-2">الهيكل الخارجي</span>
                              <CarTopViewSVG damagedParts={damagedParts} />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground mb-2">الهيكل الأساسي</span>
                              <CarFrontViewSVG damagedParts={damagedParts} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── سجل التأمين ─── */}
                      {insurance && (
                        <div>
                          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                            <History className="w-6 h-6 text-primary" />
                            سجل التأمين
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-card p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">إجمالي الحوادث</span>
                              <span className={`text-2xl font-black ${insurance.totalAccidents > 0 ? "text-red-500" : "text-green-600"}`}>
                                {insurance.totalAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">حوادث من جانبي</span>
                              <span className={`text-2xl font-black ${insurance.myAccidents > 0 ? "text-red-500" : "text-green-600"}`}>
                                {insurance.myAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">حوادث الطرف الآخر</span>
                              <span className={`text-2xl font-black ${insurance.otherAccidents > 0 ? "text-orange-500" : "text-green-600"}`}>
                                {insurance.otherAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">تغييرات الملكية</span>
                              <span className="text-2xl font-black text-foreground">
                                {insurance.ownerChanges ?? 0}
                              </span>
                            </div>
                          </div>

                          {/* تواريخ تغيير الملكية */}
                          {insurance.ownerChangeDates?.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm text-muted-foreground block mb-2">تاريخ تغيير الملكية</span>
                              <div className="flex flex-wrap gap-2">
                                {insurance.ownerChangeDates.map((date: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm font-medium"
                                  >
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─── سجل الصيانة / إضافي ─── */}
                      <div className="bg-card rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold">سجل الصيانة</h4>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            متاح
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          يمكنك طلب تقرير فحص مفصل من خلال فريق المبيعات. 
                          التقرير يشمل فحص الهيكل، المحرك، ناقل الحركة، والحالة العامة للسيارة.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <Car className="w-4 h-4" />
                          <span>المصدر: Encar Korea</span>
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

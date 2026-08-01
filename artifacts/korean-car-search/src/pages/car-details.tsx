import { useParams, Link } from "wouter";
import { useGetCarById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatNumber, formatPriceKRW } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Loader2, Calendar, Settings2, Fuel, Gauge, Car, Palette,
  Armchair, MapPin, Hash, DollarSign, CheckCircle2, Shield,
  Fuel as FuelIcon, Cog, Ruler, Users, Paintbrush, AlertTriangle,
  History, UserCheck, ShieldCheck, AlertCircle, XCircle
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
  { id: "inspection", label: "الفحص والتأمين" },
];

// ─── SVG محسّن للسيارة من الأعلى ───
function CarTopViewSVG({ damagedParts = [] }: { damagedParts?: string[] }) {
  const isDamaged = (part: string) => damagedParts.includes(part);
  const okFill = "fill-gray-200/60 stroke-gray-400";
  const badFill = "fill-red-500/50 stroke-red-500";

  return (
    <svg viewBox="0 0 200 360" className="w-full h-full max-h-[320px] drop-shadow-lg">
      <path d="M60 30 Q60 15 75 15 L125 15 Q140 15 140 30 L145 55 L150 85 L150 275 L145 305 L140 330 Q140 345 125 345 L75 345 Q60 345 60 330 L55 305 L50 275 L50 85 L55 55 Z" 
        className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="2"/>
      <path d="M65 60 L135 60 L132 80 L68 80 Z" className="fill-blue-100/60 stroke-blue-300 dark:fill-blue-900/30 dark:stroke-blue-700" strokeWidth="1.5"/>
      <path d="M68 280 L132 280 L135 300 L65 300 Z" className="fill-blue-100/60 stroke-blue-300 dark:fill-blue-900/30 dark:stroke-blue-700" strokeWidth="1.5"/>
      <rect x="70" y="90" width="60" height="170" rx="6" className="fill-slate-50 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-500" strokeWidth="1.5"/>
      <path d="M62 35 L138 35 L142 55 L58 55 Z" className={isDamaged("hood") ? badFill : okFill} strokeWidth="1.5"/>
      <path d="M58 305 L142 305 L138 325 L62 325 Z" className={isDamaged("trunk") ? badFill : okFill} strokeWidth="1.5"/>
      <rect x="52" y="95" width="14" height="75" rx="3" className={isDamaged("frontDoorLeft") ? badFill : okFill} strokeWidth="1.5"/>
      <rect x="134" y="95" width="14" height="75" rx="3" className={isDamaged("frontDoorRight") ? badFill : okFill} strokeWidth="1.5"/>
      <rect x="52" y="175" width="14" height="75" rx="3" className={isDamaged("rearDoorLeft") ? badFill : okFill} strokeWidth="1.5"/>
      <rect x="134" y="175" width="14" height="75" rx="3" className={isDamaged("rearDoorRight") ? badFill : okFill} strokeWidth="1.5"/>
      <circle cx="38" cy="75" r="14" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
      <circle cx="162" cy="75" r="14" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
      <circle cx="38" cy="285" r="14" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
      <circle cx="162" cy="285" r="14" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
    </svg>
  );
}

// ─── SVG محسّن للسيارة من الأمام ───
function CarFrontViewSVG({ damagedParts = [] }: { damagedParts?: string[] }) {
  const isDamaged = (part: string) => damagedParts.includes(part);
  const okFill = "fill-gray-200/60 stroke-gray-400";
  const badFill = "fill-red-500/50 stroke-red-500";

  return (
    <svg viewBox="0 0 200 280" className="w-full h-full max-h-[320px] drop-shadow-lg">
      <path d="M40 70 Q40 40 65 40 L135 40 Q160 40 160 70 L165 110 L170 150 L170 210 Q170 240 145 240 L55 240 Q30 240 30 210 L30 150 L35 110 Z" 
        className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="2"/>
      <path d="M50 75 Q50 55 70 55 L130 55 Q150 55 150 75 L145 100 L55 100 Z" 
        className="fill-blue-100/60 stroke-blue-300 dark:fill-blue-900/30 dark:stroke-blue-700" strokeWidth="1.5"/>
      <rect x="80" y="115" width="40" height="25" rx="5" className={isDamaged("grille") ? badFill : okFill} strokeWidth="1.5"/>
      <circle cx="60" cy="125" r="14" className={isDamaged("headlightLeft") ? badFill : okFill} strokeWidth="1.5"/>
      <circle cx="140" cy="125" r="14" className={isDamaged("headlightRight") ? badFill : okFill} strokeWidth="1.5"/>
      <rect x="45" y="155" width="110" height="30" rx="8" className={isDamaged("bumperFront") ? badFill : okFill} strokeWidth="1.5"/>
      <circle cx="45" cy="200" r="20" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
      <circle cx="155" cy="200" r="20" className="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth="2"/>
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

  const inspection = car?.inspection;
  const insurance = car?.insurance;
  const hasInspectionData = !!inspection || !!insurance;
  const hasDamage = inspection?.hasDamage || (inspection?.damageCount || 0) > 0;
  const damagedParts = inspection?.parts?.filter((p: any) => p.damaged).map((p: any) => p.name) || [];
  const allParts = inspection?.parts || [];

  return (
    <Layout>
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
          
          <div className="lg:col-span-2 space-y-6">
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

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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

              <div className="p-6">
                <AnimatePresence mode="wait">
                  
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

                  {activeTab === "inspection" && (
                    <motion.div
                      key="inspection"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                          تقرير الفحص
                        </h3>

                        {hasInspectionData ? (
                          <>
                            <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 mb-6 ${
                              hasDamage
                                ? "bg-red-500/5 border-red-500/20"
                                : "bg-green-500/5 border-green-500/20"
                            }`}>
                              <div className={`p-3 rounded-full ${
                                hasDamage ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"
                              }`}>
                                {hasDamage ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                              </div>
                              <div>
                                <p className={`font-bold text-lg ${hasDamage ? "text-red-700" : "text-green-700"}`}>
                                  {hasDamage
                                    ? `يوجد ${inspection?.damageCount || 0} ضرر مسجل على هيكل السيارة`
                                    : "لا توجد أضرار مُسجّلة على هيكل هذه السيارة"}
                                </p>
                                {!hasDamage && (
                                  <p className="text-sm text-green-600 mt-1">
                                    الهيكل الخارجي والأساسي بحالة ممتازة
                                  </p>
                                )}
                              </div>
                            </div>

                            {allParts.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center justify-center gap-8 mb-4 text-sm font-bold text-muted-foreground">
                                  <span>الهيكل الخارجي</span>
                                  <span>الهيكل الأساسي</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 dark:bg-slate-800/50 rounded-2xl p-6 border border-border/50">
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground mb-2">من الأمام</span>
                                    <CarFrontViewSVG damagedParts={damagedParts} />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground mb-2">من الأعلى</span>
                                    <CarTopViewSVG damagedParts={damagedParts} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {allParts.length > 0 && (
                              <div className="overflow-hidden rounded-xl border border-border">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted/80">
                                    <tr>
                                      <th className="text-right px-4 py-3 font-bold">الجزء</th>
                                      <th className="text-center px-4 py-3 font-bold">الحالة</th>
                                      <th className="text-right px-4 py-3 font-bold">القسم</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border">
                                    {allParts.map((part: any, i: number) => (
                                      <tr key={i} className={part.damaged ? "bg-red-500/5" : ""}>
                                        <td className="px-4 py-3 font-medium">{part.name}</td>
                                        <td className="px-4 py-3 text-center">
                                          {part.damaged ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold">
                                              <AlertCircle className="w-3 h-3" />
                                              متضرر
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">
                                              <CheckCircle2 className="w-3 h-3" />
                                              سليم
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{part.section}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-5 rounded-2xl bg-muted/50 border border-border/50 text-center">
                            <p className="text-muted-foreground">لا توجد بيانات فحص متوفرة لهذه السيارة</p>
                          </div>
                        )}
                      </div>

                      {insurance && (
                        <div>
                          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                            <History className="w-6 h-6 text-primary" />
                            سجل التأمين
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">إجمالي الحوادث</span>
                              <span className={`text-2xl font-black ${insurance.totalAccidents > 0 ? "text-red-500" : "text-green-500"}`}>
                                {insurance.totalAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">حوادث من جانبي</span>
                              <span className={`text-2xl font-black ${insurance.myAccidents > 0 ? "text-red-500" : "text-green-500"}`}>
                                {insurance.myAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">حوادث الطرف الآخر</span>
                              <span className={`text-2xl font-black ${insurance.otherAccidents > 0 ? "text-orange-500" : "text-green-500"}`}>
                                {insurance.otherAccidents ?? 0}
                              </span>
                            </div>
                            <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                              <span className="text-xs text-muted-foreground block mb-1">تغييرات الملكية</span>
                              <span className="text-2xl font-black text-foreground">
                                {insurance.ownerChanges ?? 0}
                              </span>
                            </div>
                          </div>

                          {insurance.ownerChangeDates?.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm text-muted-foreground block mb-2">تاريخ تغيير الملكية</span>
                              <div className="flex flex-wrap gap-2">
                                {insurance.ownerChangeDates.map((date: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg bg-muted dark:bg-slate-700 border border-border text-sm font-medium"
                                  >
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-card dark:bg-slate-800 rounded-xl border border-border p-5">
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

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
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

              <QuoteRequestForm
                carName={car?.title || car?.model}
                carPrice={car?.priceFormatted || formatPriceKRW(car?.price || 0)}
                carId={car?.id}
              />

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

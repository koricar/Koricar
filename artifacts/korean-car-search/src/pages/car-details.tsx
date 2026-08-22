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

// ─── Inspection sub-tabs (matching Encar) ───
const INSPECTION_TABS = [
  { id: "diagnosis", label: "تشخيص كورياكار" },
  { id: "performance", label: "فحص الأداء" },
  { id: "insurance", label: "سجل التأمين" },
];

// ─── Color map for damage status codes ───
const STATUS_COLORS: Record<string, { bg: string; text: string; fill: string; stroke: string; twBg: string }> = {
  X: { bg: "bg-red-500",      text: "text-red-400",      fill: "#ef4444", stroke: "#dc2626", twBg: "bg-red-500" },
  W: { bg: "bg-blue-500",     text: "text-blue-400",     fill: "#3b82f6", stroke: "#2563eb", twBg: "bg-blue-500" },
  C: { bg: "bg-orange-500",   text: "text-orange-400",   fill: "#f97316", stroke: "#ea580c", twBg: "bg-orange-500" },
  A: { bg: "bg-sky-400",      text: "text-sky-400",      fill: "#38bdf8", stroke: "#0ea5e9", twBg: "bg-sky-400" },
  U: { bg: "bg-emerald-500",  text: "text-emerald-400",  fill: "#10b981", stroke: "#059669", twBg: "bg-emerald-500" },
  T: { bg: "bg-gray-500",     text: "text-gray-400",     fill: "#6b7280", stroke: "#4b5563", twBg: "bg-gray-500" },
};

const LEGEND_ITEMS = [
  { code: "X", labelAr: "استبدال", labelEn: "Exchange" },
  { code: "W", labelAr: "سمكرة / لحام", labelEn: "Sheet Metal" },
  { code: "C", labelAr: "تآكل", labelEn: "Corrosion" },
  { code: "A", labelAr: "خدوش", labelEn: "Scratch" },
  { code: "U", labelAr: "تجاعيد", labelEn: "Dent" },
  { code: "T", labelAr: "تلف", labelEn: "Damage" },
];

// ─── Encar inspect images ───
// ⚠️ حمل هذه الصور على سيرفرك: public/images/inspect/
const INSPECT_IMAGES = {
  exterior: "/images/inspect/bg_inspect_front.png",  // الهيكل الخارجي (أبواب مفتوحة)
  interior: "/images/inspect/bg_inspect_back.png",     // الهيكل الداخلي
};

// ─── Types for inspection data ───
interface DamageItem {
  part: string;
  partAr: string;
  status: string;
  statusAr: string;
  statusCode: string;
  rank: string;
}

interface AccidentDetail {
  date: string;
  type: string;
  typeAr: string;
  amount: number;
  description?: string;
}

interface InspectionDetailed {
  hasReport: boolean;
  source?: string;
  message?: string | null;
  diagram?: {
    exterior?: Array<{ x: number; y: number; code: string; label: string }>;
    interior?: Array<{ x: number; y: number; code: string; label: string }>;
  };
  damages?: DamageItem[];
  insuranceSummary?: {
    totalAccidents: number;
    myAccidents: number;
    otherAccidents: number;
    ownerChanges: number;
    ownerChangeDates: string[];
  };
  accidentDetails?: AccidentDetail[];
  totalMyAccidentCost?: number;
  performanceCheck?: {
    checked: boolean;
    date?: string | null;
    result?: string | null;
  } | null;
}

// ─── Car Diagram Component with REAL Encar Images ───
function CarDiagram({
  view,
  dots = [],
}: {
  view: "exterior" | "interior";
  dots?: Array<{ x: number; y: number; code: string; label: string }>;
}) {
  const imageUrl = INSPECT_IMAGES[view];

  return (
    <div className="relative w-full max-w-[540px] mx-auto">
      {/* Real Encar car diagram image */}
      <img
        src={imageUrl}
        alt={view === "exterior" ? "الهيكل الخارجي" : "الهيكل الداخلي"}
        className="w-full h-auto select-none"
        draggable={false}
      />

      {/* Damage dots overlay */}
      {dots.map((dot, i) => {
        const colors = STATUS_COLORS[dot.code] || STATUS_COLORS.T;
        return (
          <div
            key={i}
            className="absolute group cursor-pointer"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Dot */}
            <div
              className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white transition-transform duration-200 group-hover:scale-150 ${colors.twBg}`}
            >
              {dot.code}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                {dot.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "inspection">("specs");
  
  // ─── Inspection sub-state ───
  const [inspectTab, setInspectTab] = useState<"diagnosis" | "performance" | "insurance">("performance");
  const [inspectView, setInspectView] = useState<"exterior" | "interior">("exterior");

  const { data: carData, isLoading, isError } = useGetCarById(id || "", {
    query: { enabled: !!id }
  });

  const car = carData as any;

  useEffect(() => {
    setCurrentImgIndex(0);
    setActiveTab("specs");
    setInspectTab("performance");
    setInspectView("exterior");
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

  // ─── Inspection data handling ──────────────────────────────
  const det: InspectionDetailed | null = car?.inspectionDetailed || null;
  const legacyInspection = car?.inspection;
  const legacyInsurance = car?.insurance;

  const hasDetailedReport = det?.hasReport ?? false;
  const hasLegacyReport = !!legacyInspection || !!legacyInsurance;
  const hasAnyReport = hasDetailedReport || hasLegacyReport;

  // Damage data
  const damages = det?.damages || [];
  const hasDamage = damages.length > 0 || legacyInspection?.hasDamage || (legacyInspection?.damageCount || 0) > 0;
  const damageCount = damages.length || legacyInspection?.damageCount || 0;

  // Display number (제시번호) — from API or fallback
  const displayNum = det?.source || car?.displayNumber || car?.inspectDisplayNo || "—";

  // Diagram dots — use backend coordinates if available
  const exteriorDots = det?.diagram?.exterior || (damages.length > 0
    ? damages.map((d, i) => {
        const partLower = d.part.toLowerCase();
        let pos = { x: 50 + (i % 2 === 0 ? -15 : 15), y: 50 + (i * 10) % 40 };
        if (partLower.includes("후드") || partLower.includes("보닛") || partLower.includes("hood")) {
          pos = { x: 50, y: 22 };
        } else if (partLower.includes("트렁크") || partLower.includes("trunk")) {
          pos = { x: 50, y: 88 };
        } else if (partLower.includes("앞도어") || partLower.includes("front door")) {
          pos = { x: i % 2 === 0 ? 22 : 78, y: 38 };
        } else if (partLower.includes("뒷도어") || partLower.includes("rear door")) {
          pos = { x: i % 2 === 0 ? 22 : 78, y: 55 };
        } else if (partLower.includes("휀더") || partLower.includes("fender")) {
          pos = { x: i % 2 === 0 ? 18 : 82, y: 28 };
        } else if (partLower.includes("쿼터") || partLower.includes("quarter")) {
          pos = { x: i % 2 === 0 ? 18 : 82, y: 68 };
        } else if (partLower.includes("범퍼") || partLower.includes("bumper")) {
          pos = { x: 50, y: partLower.includes("front") || partLower.includes("앞") ? 12 : 94 };
        } else if (partLower.includes("루프") || partLower.includes("roof")) {
          pos = { x: 45 + (i * 8) % 15, y: 45 };
        }
        return { x: pos.x, y: pos.y, code: d.statusCode, label: d.partAr };
      })
    : []);
  const interiorDots = det?.diagram?.interior || [];

  // Insurance data
  const insSummary = det?.insuranceSummary;
  const accidentDetails = det?.accidentDetails || [];
  const totalMyCost = det?.totalMyAccidentCost || 0;

  const totalAccidents = insSummary?.totalAccidents ?? legacyInsurance?.totalAccidents ?? 0;
  const myAccidents = insSummary?.myAccidents ?? legacyInsurance?.myAccidents ?? 0;
  const otherAccidents = insSummary?.otherAccidents ?? legacyInsurance?.otherAccidents ?? 0;
  const ownerChanges = insSummary?.ownerChanges ?? legacyInsurance?.ownerChanges ?? 0;
  const ownerChangeDates = insSummary?.ownerChangeDates ?? legacyInsurance?.ownerChangeDates ?? [];

  // ─── Pagination dots for inspect view ───
  const inspectViews = [
    { key: "exterior" as const, label: "الهيكل الخارجي" },
    { key: "interior" as const, label: "الهيكل الداخلي" },
  ];

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
            {/* ... صور السيارة (نفس الكود) ... */}
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

            {/* ─── TABS ─── */}
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

                  {/* ═══════════════════════════════════════════════
                       TAB: SPECS (نفس الكود)
                      ═══════════════════════════════════════════════ */}
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

                  {/* ═══════════════════════════════════════════════
                       TAB: FEATURES (نفس الكود)
                      ═══════════════════════════════════════════════ */}
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

                  {/* ═══════════════════════════════════════════════════════
                       TAB: INSPECTION & INSURANCE — NEW ENCAR DESIGN
                      ═══════════════════════════════════════════════════════ */}
                  {activeTab === "inspection" && (
                    <motion.div
                      key="inspection"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {hasAnyReport ? (
                        <>
                          {/* ── Sub-tabs (Encar style: diagnosis / performance / insurance) ── */}
                          <div className="flex border-b border-border">
                            {INSPECTION_TABS.map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setInspectTab(tab.id as any)}
                                className={`flex-1 py-3 text-sm font-bold transition relative ${
                                  inspectTab === tab.id
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {tab.label}
                                {inspectTab === tab.id && (
                                  <motion.div
                                    layoutId="inspectSubTab"
                                    className="absolute bottom-0 left-[15%] right-[15%] h-0.5 bg-foreground"
                                  />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* ═══ TAB: DIAGNOSIS (تشخيص كورياكار) ═══ */}
                          {inspectTab === "diagnosis" && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">تشخيص كورياكار</h2>
                                <div className="flex items-center gap-2 text-emerald-400">
                                  <ShieldCheck className="w-5 h-5" />
                                  <span className="text-sm">معتمد</span>
                                </div>
                              </div>

                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
                                  <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-emerald-700">
                                    تم الفحص بواسطة فريق كورياكار المتخصص
                                  </p>
                                  <p className="text-sm text-emerald-600 mt-1">
                                    السيارة خاضعة لمعايير جودة صارمة قبل الشحن
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                  { label: "فحص الهيكل", status: "تم" },
                                  { label: "فحص المحرك", status: "تم" },
                                  { label: "فحص ناقل الحركة", status: "تم" },
                                  { label: "فحص الكهرباء", status: "تم" },
                                  { label: "فحص التعليق", status: "تم" },
                                  { label: "فحص الفرامل", status: "تم" },
                                ].map((item, i) => (
                                  <div key={i} className="bg-card dark:bg-slate-800 rounded-xl p-4 border border-border flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                      {item.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ═══ TAB: PERFORMANCE (فحص الأداء) ═══ */}
                          {inspectTab === "performance" && (
                            <div className="space-y-6">
                              {/* Header + Display Number */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="text-xl font-bold">تقرير الفحص</h2>
                                <span className="text-sm text-muted-foreground font-medium">
                                  رقم العرض: <span className="text-foreground font-bold">{displayNum}</span>
                                </span>
                              </div>

                              {/* Status Banner */}
                              <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
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
                                      ? `يوجد ${damageCount} ضرر مسجل على هيكل السيارة`
                                      : "لا توجد أضرار مُسجّلة على هيكل هذه السيارة"}
                                  </p>
                                  {!hasDamage && (
                                    <p className="text-sm text-green-600 mt-1">
                                      الهيكل الخارجي والأساسي بحالة ممتازة
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Car Diagram with REAL Encar Images */}
                              {(hasDetailedReport || legacyInspection?.parts?.length > 0) && (
                                <div className="bg-card dark:bg-slate-800 rounded-2xl border border-border p-4">
                                  {/* View tabs */}
                                  <div className="flex gap-4 mb-4 border-b border-border pb-3">
                                    <button
                                      onClick={() => setInspectView("exterior")}
                                      className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                        inspectView === "exterior"
                                          ? "border-red-500 text-foreground"
                                          : "border-transparent text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      الهيكل الخارجي {hasDamage ? `— ضرر ${damageCount}` : "— لا يوجد"}
                                    </button>
                                    <button
                                      onClick={() => setInspectView("interior")}
                                      className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                        inspectView === "interior"
                                          ? "border-red-500 text-foreground"
                                          : "border-transparent text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      الهيكل الداخلي
                                    </button>
                                  </div>

                                  {/* Real Encar Diagram */}
                                  <div className="flex justify-center py-4">
                                    <CarDiagram
                                      view={inspectView}
                                      dots={inspectView === "exterior" ? exteriorDots : interiorDots}
                                    />
                                  </div>

                                  {/* Pagination dots */}
                                  <div className="flex justify-center gap-2 mt-2">
                                    {inspectViews.map((v) => (
                                      <button
                                        key={v.key}
                                        onClick={() => setInspectView(v.key)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                                          inspectView === v.key ? "bg-foreground w-6" : "bg-muted-foreground/30"
                                        }`}
                                        title={v.label}
                                      />
                                    ))}
                                  </div>

                                  {/* Legend */}
                                  <div className="flex flex-wrap gap-3 mt-6 justify-center bg-muted/30 rounded-xl p-4">
                                    {LEGEND_ITEMS.map((item) => (
                                      <div key={item.code} className="flex items-center gap-1.5">
                                        <span
                                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                                            STATUS_COLORS[item.code]?.bg || "bg-gray-500"
                                          }`}
                                        >
                                          {item.code}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{item.labelAr}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <p className="text-center text-xs text-muted-foreground mt-3">
                                    * للمركبات غير السيارات يتم العرض وفقاً للسيارات
                                  </p>
                                </div>
                              )}

                              {/* Damages Table */}
                              {damages.length > 0 && (
                                <div className="bg-card dark:bg-slate-800 rounded-2xl border border-border overflow-hidden">
                                  <div className="grid grid-cols-3 text-xs text-muted-foreground px-4 py-3 bg-muted/50">
                                    <span>القطعة</span>
                                    <span className="text-center">الحالة</span>
                                    <span className="text-right">الدرجة</span>
                                  </div>
                                  {damages.map((d, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-3 items-center px-4 py-3 border-t border-border"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                                            STATUS_COLORS[d.statusCode]?.bg || "bg-gray-500"
                                          }`}
                                        >
                                          {d.statusCode}
                                        </span>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium">{d.partAr}</span>
                                          <span className="text-[10px] text-muted-foreground">{d.part}</span>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <span className="text-sm">{d.statusAr}</span>
                                        <span className="text-xs text-muted-foreground mr-1">/ {d.status}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                          {d.rank}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Legacy parts table fallback */}
                              {!hasDetailedReport && legacyInspection?.parts?.length > 0 && (
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
                                      {legacyInspection.parts.map((part: any, i: number) => (
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
                            </div>
                          )}

                          {/* ═══ TAB: INSURANCE (سجل التأمين) ═══ */}
                          {inspectTab === "insurance" && (
                            <div className="space-y-6">
                              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                <History className="w-6 h-6 text-primary" />
                                سجل التأمين
                              </h3>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                                  <span className="text-xs text-muted-foreground block mb-1">تغييرات الملكية</span>
                                  <span className="text-2xl font-black text-foreground">{ownerChanges}</span>
                                </div>
                                <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                                  <span className="text-xs text-muted-foreground block mb-1">حوادث الطرف الآخر</span>
                                  <span className={`text-2xl font-black ${otherAccidents > 0 ? "text-orange-500" : "text-green-500"}`}>
                                    {otherAccidents}
                                  </span>
                                </div>
                                <div className="bg-card dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                                  <span className="text-xs text-muted-foreground block mb-1">حوادث من جانبي</span>
                                  <span className={`text-2xl font-black ${myAccidents > 0 ? "text-red-500" : "text-green-500"}`}>
                                    {myAccidents}
                                  </span>
                                </div>
                                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 text-center">
                                  <span className="text-xs text-red-300 block mb-1">إجمالي الحوادث</span>
                                  <span className="text-2xl font-black text-red-400">{totalAccidents}</span>
                                </div>
                              </div>

                              {accidentDetails.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-sm font-bold text-muted-foreground mb-3">سجل الحوادث</h4>
                                  <div className="space-y-2">
                                    {accidentDetails.map((a, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between bg-card dark:bg-slate-800 rounded-xl px-4 py-3 border border-border"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-red-400 font-bold text-sm">
                                            ₩ {a.amount.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-foreground">{a.typeAr}</p>
                                          <p className="text-xs text-muted-foreground">{a.type}</p>
                                        </div>
                                        <div className="text-left text-sm text-muted-foreground">
                                          {a.date}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {ownerChangeDates.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-bold text-muted-foreground mb-3">
                                    تاريخ تغيير الملكية
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {ownerChangeDates.map((date: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-full text-sm bg-muted dark:bg-slate-700 text-foreground border border-border"
                                      >
                                        {date}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {totalMyCost > 0 && (
                                <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                  <p className="text-sm text-red-300 mb-1">إجمالي تكلفة حوادثي</p>
                                  <p className="text-2xl font-black text-red-400">
                                    ₩ {totalMyCost.toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Performance Check (shown in all inspect tabs) ── */}
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
                        </>
                      ) : (
                        <div className="p-5 rounded-2xl bg-muted/50 border border-border/50 text-center">
                          <p className="text-muted-foreground">لا توجد بيانات فحص متوفرة لهذه السيارة</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ─── Sidebar (نفس الكود) ─── */}
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

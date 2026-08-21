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

// ─── Color map for damage status codes ───
const STATUS_COLORS: Record<string, { bg: string; text: string; fill: string; stroke: string }> = {
  X: { bg: "bg-red-500",      text: "text-red-400",      fill: "#ef4444", stroke: "#dc2626" },
  W: { bg: "bg-blue-500",     text: "text-blue-400",     fill: "#3b82f6", stroke: "#2563eb" },
  C: { bg: "bg-orange-500",   text: "text-orange-400",   fill: "#f97316", stroke: "#ea580c" },
  A: { bg: "bg-sky-400",      text: "text-sky-400",      fill: "#38bdf8", stroke: "#0ea5e9" },
  U: { bg: "bg-emerald-500",  text: "text-emerald-400",  fill: "#10b981", stroke: "#059669" },
  T: { bg: "bg-gray-500",     text: "text-gray-400",     fill: "#6b7280", stroke: "#4b5563" },
};

const LEGEND_ITEMS = [
  { code: "X", labelAr: "تغيير", labelEn: "Exchange" },
  { code: "W", labelAr: "رش", labelEn: "Sheet Metal" },
  { code: "C", labelAr: "صدأ", labelEn: "Corrosion" },
  { code: "A", labelAr: "خدش", labelEn: "Scratch" },
  { code: "U", labelAr: "انبعاج", labelEn: "Dent" },
  { code: "T", labelAr: "تلف", labelEn: "Damage" },
];

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

// ─── Detailed Car Top View SVG ───
function CarTopViewSVG({
  dots = [],
}: {
  dots?: Array<{ x: number; y: number; code: string; label: string }>;
}) {
  return (
    <svg viewBox="0 0 220 400" className="w-full h-auto max-h-[360px]">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="110" cy="385" rx="85" ry="8" fill="#000000" opacity="0.08" />

      {/* Main body */}
      <path
        d="M55 35 Q55 15 75 12 L145 12 Q165 15 165 35 L172 65 L178 100 L180 150 L180 250 L178 300 L172 335 L165 365 Q165 385 145 388 L75 388 Q55 385 55 365 L48 335 L42 300 L40 250 L40 150 L42 100 L48 65 Z"
        fill="url(#bodyGrad)"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* Hood lines */}
      <path d="M60 35 Q110 30 160 35" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
      <path d="M65 50 Q110 45 155 50" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.3" />

      {/* Windshield */}
      <path d="M58 75 Q110 65 162 75 L158 110 Q110 105 62 110 Z" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Windshield wiper area */}
      <path d="M70 105 Q110 100 150 105" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.4" />

      {/* Roof */}
      <rect x="62" y="115" width="96" height="140" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Roof center line */}
      <line x1="110" y1="115" x2="110" y2="255" stroke="#e2e8f0" strokeWidth="1" />
      {/* Sunroof outline */}
      <rect x="85" y="140" width="50" height="70" rx="4" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Rear window */}
      <path d="M62 260 Q110 255 158 260 L162 295 Q110 290 58 295 Z" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Rear wiper */}
      <path d="M100 285 L115 280" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />

      {/* Trunk lines */}
      <path d="M60 300 Q110 295 160 300" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
      <path d="M65 315 Q110 310 155 315" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.3" />

      {/* Front doors */}
      <rect x="44" y="118" width="16" height="65" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="160" y="118" width="16" height="65" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Door handles front */}
      <rect x="46" y="145" width="8" height="3" rx="1" fill="#94a3b8" />
      <rect x="166" y="145" width="8" height="3" rx="1" fill="#94a3b8" />

      {/* Rear doors */}
      <rect x="44" y="188" width="16" height="65" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="160" y="188" width="16" height="65" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Door handles rear */}
      <rect x="46" y="215" width="8" height="3" rx="1" fill="#94a3b8" />
      <rect x="166" y="215" width="8" height="3" rx="1" fill="#94a3b8" />

      {/* B-pillars */}
      <rect x="44" y="180" width="16" height="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="160" y="180" width="16" height="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

      {/* Side mirrors */}
      <path d="M30 105 L20 100 Q15 98 15 105 Q15 112 20 110 L30 115 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M190 105 L200 100 Q205 98 205 105 Q205 112 200 110 L190 115 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Front wheels with rims */}
      <g transform="translate(28, 85)">
        <circle cx="0" cy="0" r="16" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
        {/* Spokes */}
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g transform="translate(192, 85)">
        <circle cx="0" cy="0" r="16" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="1.5" />
      </g>

      {/* Rear wheels with rims */}
      <g transform="translate(28, 275)">
        <circle cx="0" cy="0" r="16" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g transform="translate(192, 275)">
        <circle cx="0" cy="0" r="16" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="1.5" />
      </g>

      {/* Wheel arches */}
      <path d="M28 75 Q12 85 12 105 Q12 125 28 135" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M192 75 Q208 85 208 105 Q208 125 192 135" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M28 265 Q12 275 12 295 Q12 315 28 325" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M192 265 Q208 275 208 295 Q208 315 192 325" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Headlights */}
      <ellipse cx="70" cy="28" rx="12" ry="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="150" cy="28" rx="12" ry="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="70" cy="28" rx="8" ry="4" fill="#f8fafc" />
      <ellipse cx="150" cy="28" rx="8" ry="4" fill="#f8fafc" />

      {/* Taillights */}
      <ellipse cx="68" cy="372" rx="10" ry="6" fill="#fca5a5" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="152" cy="372" rx="10" ry="6" fill="#fca5a5" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />

      {/* Front bumper */}
      <path d="M58 12 Q110 8 162 12" fill="none" stroke="#64748b" strokeWidth="2" />
      {/* Rear bumper */}
      <path d="M58 388 Q110 392 162 388" fill="none" stroke="#64748b" strokeWidth="2" />

      {/* License plate front */}
      <rect x="95" y="18" width="30" height="8" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      {/* License plate rear */}
      <rect x="95" y="374" width="30" height="8" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

      {/* Damage dots */}
      {dots.map((dot, i) => {
        const colors = STATUS_COLORS[dot.code] || STATUS_COLORS.T;
        return (
          <g key={i}>
            <circle cx={dot.x} cy={dot.y} r="8" fill={colors.fill} stroke="white" strokeWidth="2" />
            <text x={dot.x} y={dot.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">
              {dot.code}
            </text>
            {/* Label tooltip */}
            <rect x={dot.x - 25} y={dot.y - 22} width="50" height="14" rx="4" fill="#1e293b" opacity="0.9" />
            <text x={dot.x} y={dot.y - 14} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="7">
              {dot.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Detailed Car Front View SVG ───
function CarFrontViewSVG({
  dots = [],
}: {
  dots?: Array<{ x: number; y: number; code: string; label: string }>;
}) {
  return (
    <svg viewBox="0 0 220 400" className="w-full h-auto max-h-[360px]">
      <defs>
        <linearGradient id="frontBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="frontGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="110" cy="385" rx="90" ry="8" fill="#000000" opacity="0.08" />

      {/* Main body */}
      <path
        d="M35 80 Q35 50 60 45 L160 45 Q185 50 185 80 L195 120 L200 170 L200 240 L195 290 L185 330 Q185 360 160 365 L60 365 Q35 360 35 330 L25 290 L20 240 L20 170 L25 120 Z"
        fill="url(#frontBodyGrad)"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* Hood */}
      <path d="M45 80 Q110 70 175 80 L170 120 Q110 115 50 120 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Hood center line */}
      <line x1="110" y1="80" x2="110" y2="118" stroke="#e2e8f0" strokeWidth="1" />
      {/* Hood side lines */}
      <path d="M55 85 Q70 95 65 115" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M165 85 Q150 95 155 115" fill="none" stroke="#e2e8f0" strokeWidth="1" />

      {/* Windshield */}
      <path d="M42 55 Q110 40 178 55 L172 85 Q110 75 48 85 Z" fill="url(#frontGlassGrad)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Windshield wipers */}
      <path d="M60 75 L75 70" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
      <path d="M160 75 L145 70" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />

      {/* A-pillars */}
      <path d="M42 55 L48 85" fill="none" stroke="#64748b" strokeWidth="3" />
      <path d="M178 55 L172 85" fill="none" stroke="#64748b" strokeWidth="3" />

      {/* Roof */}
      <path d="M48 40 Q110 25 172 40" fill="none" stroke="#64748b" strokeWidth="2" />

      {/* Side mirrors */}
      <path d="M22 65 L8 60 Q3 58 3 65 Q3 72 8 70 L22 75 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M198 65 L212 60 Q217 58 217 65 Q217 72 212 70 L198 75 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Grille */}
      <rect x="75" y="125" width="70" height="35" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      {/* Grille horizontal lines */}
      <line x1="75" y1="135" x2="145" y2="135" stroke="#334155" strokeWidth="1.5" />
      <line x1="75" y1="145" x2="145" y2="145" stroke="#334155" strokeWidth="1.5" />
      <line x1="75" y1="155" x2="145" y2="155" stroke="#334155" strokeWidth="1.5" />
      {/* Grille vertical center */}
      <line x1="110" y1="125" x2="110" y2="160" stroke="#334155" strokeWidth="1.5" />
      {/* Logo area */}
      <circle cx="110" cy="142" r="8" fill="#475569" stroke="#64748b" strokeWidth="1" />

      {/* Headlights */}
      <g>
        <path d="M40 115 Q55 105 70 115 L68 130 Q55 125 42 130 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M45 118 Q55 112 65 118 L64 126 Q55 123 46 126 Z" fill="#f8fafc" />
        {/* LED strip */}
        <path d="M42 122 Q55 118 68 122" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
      </g>
      <g>
        <path d="M180 115 Q165 105 150 115 L152 130 Q165 125 178 130 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M175 118 Q165 112 155 118 L156 126 Q165 123 174 126 Z" fill="#f8fafc" />
        <path d="M178 122 Q165 118 152 122" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Fog lights */}
      <ellipse cx="55" cy="165" rx="8" ry="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="165" cy="165" rx="8" ry="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Bumper */}
      <path d="M35 155 Q110 145 185 155 L188 175 Q110 165 32 175 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Lower bumper */}
      <path d="M32 175 Q110 165 188 175 L185 195 Q110 185 35 195 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Air intake */}
      <rect x="85" y="180" width="50" height="8" rx="4" fill="#334155" />

      {/* License plate */}
      <rect x="85" y="158" width="50" height="14" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="110" y="168" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="7" fontWeight="bold">LICENSE</text>

      {/* Front wheels with rims */}
      <g transform="translate(30, 240)">
        <circle cx="0" cy="0" r="22" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="14" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="#cbd5e1" />
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#64748b" strokeWidth="2" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#64748b" strokeWidth="2" />
        <line x1="-10" y1="-10" x2="10" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="10" x2="10" y2="-10" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g transform="translate(190, 240)">
        <circle cx="0" cy="0" r="22" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="0" r="14" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="#cbd5e1" />
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#64748b" strokeWidth="2" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#64748b" strokeWidth="2" />
        <line x1="-10" y1="-10" x2="10" y2="10" stroke="#64748b" strokeWidth="1.5" />
        <line x1="-10" y1="10" x2="10" y2="-10" stroke="#64748b" strokeWidth="1.5" />
      </g>

      {/* Wheel arches */}
      <path d="M30 215 Q8 230 8 255 Q8 280 30 295" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <path d="M190 215 Q212 230 212 255 Q212 280 190 295" fill="none" stroke="#94a3b8" strokeWidth="2" />

      {/* Side body lines */}
      <path d="M35 200 Q20 250 25 300" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M185 200 Q200 250 195 300" fill="none" stroke="#e2e8f0" strokeWidth="1" />

      {/* Lower body */}
      <path d="M25 300 Q110 310 195 300 L190 340 Q110 350 30 340 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Skid plate */}
      <rect x="85" y="335" width="50" height="6" rx="3" fill="#94a3b8" />

      {/* Damage dots */}
      {dots.map((dot, i) => {
        const colors = STATUS_COLORS[dot.code] || STATUS_COLORS.T;
        return (
          <g key={i}>
            <circle cx={dot.x} cy={dot.y} r="8" fill={colors.fill} stroke="white" strokeWidth="2" />
            <text x={dot.x} y={dot.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">
              {dot.code}
            </text>
            <rect x={dot.x - 25} y={dot.y - 22} width="50" height="14" rx="4" fill="#1e293b" opacity="0.9" />
            <text x={dot.x} y={dot.y - 14} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="7">
              {dot.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "inspection">("specs");
  const [inspectionView, setInspectionView] = useState<"exterior" | "interior">("exterior");

  const { data: carData, isLoading, isError } = useGetCarById(id || "", {
    query: { enabled: !!id }
  });

  const car = carData as any;

  useEffect(() => {
    setCurrentImgIndex(0);
    setActiveTab("specs");
    setInspectionView("exterior");
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

  // Diagram dots — use backend coordinates if available, else place on realistic car positions
  const exteriorDots = det?.diagram?.exterior || (damages.length > 0
    ? damages.map((d, i) => {
        // Map common parts to realistic positions on the top-view SVG (viewBox 220x400)
        const partLower = d.part.toLowerCase();
        let pos = { x: 110 + (i % 2 === 0 ? -30 : 30), y: 200 + (i * 25) % 150 };
        if (partLower.includes("후드") || partLower.includes("보닛") || partLower.includes("hood")) {
          pos = { x: 110, y: 45 };
        } else if (partLower.includes("트렁크") || partLower.includes("trunk")) {
          pos = { x: 110, y: 355 };
        } else if (partLower.includes("앞도어") || partLower.includes("front door")) {
          pos = { x: i % 2 === 0 ? 50 : 170, y: 150 };
        } else if (partLower.includes("뒷도어") || partLower.includes("rear door")) {
          pos = { x: i % 2 === 0 ? 50 : 170, y: 220 };
        } else if (partLower.includes("휀더") || partLower.includes("fender")) {
          pos = { x: i % 2 === 0 ? 35 : 185, y: 85 };
        } else if (partLower.includes("쿼터") || partLower.includes("quarter")) {
          pos = { x: i % 2 === 0 ? 35 : 185, y: 275 };
        } else if (partLower.includes("범퍼") || partLower.includes("bumper")) {
          pos = { x: 110, y: partLower.includes("front") || partLower.includes("앞") ? 25 : 375 };
        } else if (partLower.includes("루프") || partLower.includes("roof")) {
          pos = { x: 90 + (i * 15) % 40, y: 180 };
        }
        return { x: pos.x, y: pos.y, code: d.statusCode, label: d.partAr };
      })
    : []);
  const interiorDots = det?.diagram?.interior || [];

  // Insurance data
  const insSummary = det?.insuranceSummary;
  const accidentDetails = det?.accidentDetails || [];
  const totalMyCost = det?.totalMyAccidentCost || 0;

  // Legacy fallback values
  const totalAccidents = insSummary?.totalAccidents ?? legacyInsurance?.totalAccidents ?? 0;
  const myAccidents = insSummary?.myAccidents ?? legacyInsurance?.myAccidents ?? 0;
  const otherAccidents = insSummary?.otherAccidents ?? legacyInsurance?.otherAccidents ?? 0;
  const ownerChanges = insSummary?.ownerChanges ?? legacyInsurance?.ownerChanges ?? 0;
  const ownerChangeDates = insSummary?.ownerChangeDates ?? legacyInsurance?.ownerChangeDates ?? [];

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

                  {/* ═══════════════════════════════════════════════════════
                       TAB: INSPECTION & INSURANCE — NEW DETAILED DESIGN
                      ═══════════════════════════════════════════════════════ */}
                  {activeTab === "inspection" && (
                    <motion.div
                      key="inspection"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* ── Header ── */}
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">تقرير الفحص</h2>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-sm">فحص معتمد</span>
                        </div>
                      </div>

                      {hasAnyReport ? (
                        <>
                          {/* ── Status Banner ── */}
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

                          {/* ── Car Diagrams ── */}
                          {(hasDetailedReport || legacyInspection?.parts?.length > 0) && (
                            <div className="bg-card dark:bg-slate-800 rounded-2xl border border-border p-4">
                              {/* Tabs */}
                              <div className="flex gap-4 mb-4 border-b border-border pb-3">
                                <button
                                  onClick={() => setInspectionView("exterior")}
                                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                    inspectionView === "exterior"
                                      ? "border-red-500 text-foreground"
                                      : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  الهيكل الخارجي {hasDamage ? `— ضرر ${damageCount}` : "— لا يوجد"}
                                </button>
                                <button
                                  onClick={() => setInspectionView("interior")}
                                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                                    inspectionView === "interior"
                                      ? "border-red-500 text-foreground"
                                      : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  الهيكل الأساسي
                                </button>
                              </div>

                              {/* Diagrams Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-3 flex flex-col items-center">
                                  <span className="text-xs text-muted-foreground mb-2">من الأعلى</span>
                                  <CarTopViewSVG
                                    dots={inspectionView === "exterior" ? exteriorDots : interiorDots}
                                  />
                                </div>
                                <div className="bg-white rounded-xl p-3 flex flex-col items-center">
                                  <span className="text-xs text-muted-foreground mb-2">من الأمام</span>
                                  <CarFrontViewSVG
                                    dots={inspectionView === "exterior" ? exteriorDots : interiorDots}
                                  />
                                </div>
                              </div>

                              {/* Legend */}
                              <div className="flex flex-wrap gap-3 mt-4 justify-center">
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
                            </div>
                          )}

                          {/* ── Damages Table ── */}
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

                          {/* ── Legacy parts table fallback ── */}
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

                          {/* ── Insurance Summary ── */}
                          {(hasDetailedReport || legacyInsurance) && (
                            <div>
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

                              {/* Accident Details Table */}
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
                                            ﷼ {a.amount.toLocaleString()}
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

                              {/* Owner Change Dates */}
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

                              {/* Total Cost */}
                              {totalMyCost > 0 && (
                                <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                  <p className="text-sm text-red-300 mb-1">إجمالي تكلفة حوادثي</p>
                                  <p className="text-2xl font-black text-red-400">
                                    ﷼ {totalMyCost.toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Performance Check ── */}
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

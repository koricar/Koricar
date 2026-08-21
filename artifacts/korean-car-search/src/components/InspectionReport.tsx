"use client";

import React, { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
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

interface Props {
  inspection: InspectionDetailed | null;
}

// ── Color map ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  X: { bg: "bg-red-500",      text: "text-red-400",      border: "border-red-500" },
  W: { bg: "bg-blue-500",     text: "text-blue-400",     border: "border-blue-500" },
  C: { bg: "bg-orange-500",   text: "text-orange-400",   border: "border-orange-500" },
  A: { bg: "bg-sky-400",      text: "text-sky-400",      border: "border-sky-400" },
  U: { bg: "bg-emerald-500",  text: "text-emerald-400",  border: "border-emerald-500" },
  T: { bg: "bg-gray-500",     text: "text-gray-400",     border: "border-gray-500" },
};

const LEGEND_ITEMS = [
  { code: "X", labelAr: "تغيير", labelEn: "Exchange" },
  { code: "W", labelAr: "رش", labelEn: "Sheet Metal" },
  { code: "C", labelAr: "صدأ", labelEn: "Corrosion" },
  { code: "A", labelAr: "خدش", labelEn: "Scratch" },
  { code: "U", labelAr: "انبعاج", labelEn: "Dent" },
  { code: "T", labelAr: "تلف", labelEn: "Damage" },
];

// ── Car SVG (Top View) ────────────────────────────────────────────────────
function CarDiagramTop({
  dots,
}: {
  dots?: Array<{ x: number; y: number; code: string; label: string }>;
}) {
  return (
    <svg viewBox="0 0 200 360" className="w-full h-auto max-h-80">
      {/* Car body outline */}
      <path
        d="M60 20 Q100 5 140 20 L155 50 L160 100 L165 150 L165 210 L160 260 L155 310 L140 340 Q100 355 60 340 L45 310 L40 260 L35 210 L35 150 L40 100 L45 50 Z"
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      {/* Windshield */}
      <path d="M55 80 Q100 70 145 80 L142 110 Q100 105 58 110 Z" fill="#e2e8f0" />
      {/* Rear window */}
      <path d="M58 250 Q100 245 142 250 L140 280 Q100 285 60 280 Z" fill="#e2e8f0" />
      {/* Roof */}
      <rect x="58" y="110" width="84" height="140" rx="4" fill="#f1f5f9" />
      {/* Side windows */}
      <rect x="48" y="115" width="10" height="60" rx="2" fill="#e2e8f0" />
      <rect x="142" y="115" width="10" height="60" rx="2" fill="#e2e8f0" />
      <rect x="48" y="185" width="10" height="60" rx="2" fill="#e2e8f0" />
      <rect x="142" y="185" width="10" height="60" rx="2" fill="#e2e8f0" />
      {/* Wheels */}
      <circle cx="35" cy="90" r="14" fill="#cbd5e1" stroke="#94a3b8" />
      <circle cx="165" cy="90" r="14" fill="#cbd5e1" stroke="#94a3b8" />
      <circle cx="35" cy="270" r="14" fill="#cbd5e1" stroke="#94a3b8" />
      <circle cx="165" cy="270" r="14" fill="#cbd5e1" stroke="#94a3b8" />
      {/* Headlights */}
      <ellipse cx="55" cy="35" rx="8" ry="5" fill="#e2e8f0" />
      <ellipse cx="145" cy="35" rx="8" ry="5" fill="#e2e8f0" />
      {/* Taillights */}
      <ellipse cx="55" cy="325" rx="8" ry="5" fill="#e2e8f0" />
      <ellipse cx="145" cy="325" rx="8" ry="5" fill="#e2e8f0" />

      {/* Damage dots */}
      {dots?.map((dot, i) => {
        const color = STATUS_COLORS[dot.code]?.bg || "bg-gray-400";
        return (
          <g key={i}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r="6"
              className={color}
              stroke="white"
              strokeWidth="1.5"
            />
            <text
              x={dot.x}
              y={dot.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              {dot.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Car SVG (Front View) ──────────────────────────────────────────────────
function CarDiagramFront({
  dots,
}: {
  dots?: Array<{ x: number; y: number; code: string; label: string }>;
}) {
  return (
    <svg viewBox="0 0 200 360" className="w-full h-auto max-h-80">
      {/* Car body outline */}
      <path
        d="M40 40 Q100 20 160 40 L170 80 L175 140 L175 220 L170 280 L160 320 Q100 340 40 320 L30 280 L25 220 L25 140 L30 80 Z"
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      {/* Windshield */}
      <path d="M45 60 Q100 45 155 60 L150 100 Q100 90 50 100 Z" fill="#e2e8f0" />
      {/* Hood */}
      <rect x="45" y="105" width="110" height="50" rx="4" fill="#f1f5f9" />
      {/* Grille */}
      <rect x="60" y="160" width="80" height="25" rx="3" fill="#e2e8f0" />
      {/* Headlights */}
      <ellipse cx="55" cy="170" rx="12" ry="8" fill="#e2e8f0" />
      <ellipse cx="145" cy="170" rx="12" ry="8" fill="#e2e8f0" />
      {/* Bumper */}
      <rect x="40" y="190" width="120" height="30" rx="6" fill="#f1f5f9" />
      {/* License plate area */}
      <rect x="70" y="200" width="60" height="15" rx="2" fill="#e2e8f0" />
      {/* Wheels */}
      <circle cx="35" cy="240" r="18" fill="#cbd5e1" stroke="#94a3b8" />
      <circle cx="165" cy="240" r="18" fill="#cbd5e1" stroke="#94a3b8" />
      {/* Side mirrors */}
      <rect x="15" y="85" width="15" height="8" rx="3" fill="#e2e8f0" />
      <rect x="170" y="85" width="15" height="8" rx="3" fill="#e2e8f0" />

      {/* Damage dots */}
      {dots?.map((dot, i) => {
        const color = STATUS_COLORS[dot.code]?.bg || "bg-gray-400";
        return (
          <g key={i}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r="6"
              className={color}
              stroke="white"
              strokeWidth="1.5"
            />
            <text
              x={dot.x}
              y={dot.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              {dot.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function InspectionReport({ inspection }: Props) {
  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");

  if (!inspection || !inspection.hasReport) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <p>لا يوجد تقرير فحص متاح لهذه السيارة</p>
      </div>
    );
  }

  const damages = inspection.damages || [];
  const summary = inspection.insuranceSummary;
  const accidents = inspection.accidentDetails || [];
  const totalCost = inspection.totalMyAccidentCost || 0;

  // Demo dots for the diagram (if backend doesn't provide coordinates)
  const demoExteriorDots = damages.length > 0
    ? damages.map((d, i) => ({
        x: 80 + (i % 3) * 40,
        y: 60 + Math.floor(i / 3) * 80,
        code: d.statusCode,
        label: d.partAr,
      }))
    : [];

  const demoInteriorDots: typeof demoExteriorDots = [];

  return (
    <div className="space-y-6 text-white">
      {/* ── Title ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">تقرير الفحص</h2>
        <div className="flex items-center gap-2 text-emerald-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">فحص معتمد</span>
        </div>
      </div>

      {/* ── Diagram Section ─────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-slate-700 pb-3">
          <button
            onClick={() => setActiveTab("exterior")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "exterior"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            الهيكل الخارجي — ضرر واحد
          </button>
          <button
            onClick={() => setActiveTab("interior")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "interior"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            الهيكل الأساسي
          </button>
        </div>

        {/* Diagrams */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3">
            <CarDiagramTop
              dots={activeTab === "exterior" ? demoExteriorDots : demoInteriorDots}
            />
          </div>
          <div className="bg-white rounded-xl p-3">
            <CarDiagramFront
              dots={activeTab === "exterior" ? demoExteriorDots : demoInteriorDots}
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
              <span className="text-xs text-slate-300">{item.labelAr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Damages Table ─────────────────────────────────────── */}
      {damages.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="grid grid-cols-3 text-xs text-slate-400 mb-3 px-2">
            <span>القطعة</span>
            <span className="text-center">الحالة</span>
            <span className="text-left">الدرجة</span>
          </div>
          {damages.map((d, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center py-3 border-t border-slate-700 px-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    STATUS_COLORS[d.statusCode]?.bg || "bg-gray-500"
                  }`}
                >
                  {d.statusCode}
                </span>
                <span className="text-sm">{d.partAr}</span>
                <span className="text-xs text-slate-500">/ {d.part}</span>
              </div>
              <div className="text-center text-sm text-slate-300">
                {d.statusAr}
                <span className="text-slate-500 text-xs mr-1">/ {d.status}</span>
              </div>
              <div className="text-left">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                  {d.rank}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Insurance Summary ─────────────────────────────────── */}
      {summary && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <h3 className="text-lg font-bold mb-4 text-right">سجل التأمين</h3>
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">تغييرات الملكية</p>
              <p className="text-2xl font-bold text-white">{summary.ownerChanges}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">حوادث الطرف الآخر</p>
              <p className="text-2xl font-bold text-white">{summary.otherAccidents}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">حوادث من جانبي</p>
              <p className="text-2xl font-bold text-white">{summary.myAccidents}</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
              <p className="text-xs text-red-300 mb-1">إجمالي الحوادث</p>
              <p className="text-2xl font-bold text-red-400">{summary.totalAccidents}</p>
            </div>
          </div>

          {/* Accident Details Table */}
          {accidents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-300 mb-3 text-right">سجل الحوادث</h4>
              <div className="space-y-2">
                {accidents.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-700/30 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-bold text-sm">﷼ {a.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-200">{a.typeAr}</p>
                      <p className="text-xs text-slate-500">{a.type}</p>
                    </div>
                    <div className="text-left text-sm text-slate-400">
                      {a.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Change Dates */}
          {summary.ownerChangeDates.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-3 text-right">
                تاريخ تغيير الملكية
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.ownerChangeDates.map((date, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm bg-slate-700 text-slate-300 border border-slate-600"
                  >
                    {date}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Total Cost */}
          {totalCost > 0 && (
            <div className="mt-4 bg-red-500/10 rounded-xl p-4 text-right border border-red-500/20">
              <p className="text-sm text-red-300 mb-1">إجمالي تكلفة حوادثي</p>
              <p className="text-2xl font-bold text-red-400">﷼ {totalCost.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Performance Check ─────────────────────────────────── */}
      {inspection.performanceCheck?.checked && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <h3 className="text-lg font-bold mb-2">سجل الصيانة</h3>
          <p className="text-sm text-slate-400">
            يمكنك تقرير فحص شامل تشمل فحص الهيكل، المحرك، ناقل الحركة، والحالة العامة للسيارة.
          </p>
          {inspection.performanceCheck.date && (
            <p className="text-xs text-slate-500 mt-2">
              تاريخ الفحص: {inspection.performanceCheck.date}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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
  displayNumber?: string; // ← رقم العرض من الـ API
}

// ── Color map ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; fill: string }> = {
  X: { bg: "bg-red-500",      text: "text-red-400",      border: "border-red-500",      fill: "#ef4444" },
  W: { bg: "bg-blue-500",     text: "text-blue-400",     border: "border-blue-500",     fill: "#3b82f6" },
  C: { bg: "bg-orange-500",   text: "text-orange-400",   border: "border-orange-500",   fill: "#f97316" },
  A: { bg: "bg-sky-400",      text: "text-sky-400",      border: "border-sky-400",      fill: "#38bdf8" },
  U: { bg: "bg-emerald-500",  text: "text-emerald-400",  border: "border-emerald-500",  fill: "#10b981" },
  T: { bg: "bg-gray-500",     text: "text-gray-400",     border: "border-gray-500",     fill: "#6b7280" },
};

const LEGEND_ITEMS = [
  { code: "X", labelAr: "استبدال", labelEn: "Exchange" },
  { code: "W", labelAr: "سمكرة / لحام", labelEn: "Sheet Metal" },
  { code: "C", labelAr: "تآكل", labelEn: "Corrosion" },
  { code: "A", labelAr: "خدوش", labelEn: "Scratch" },
  { code: "U", labelAr: "تجاعيد", labelEn: "Dent" },
  { code: "T", labelAr: "تلف", labelEn: "Damage" },
];

// ── Encar inspect images ──────────────────────────────────────────────────
// ⚠️ حمل هذه الصور على سيرفرك: public/images/inspect/
const INSPECT_IMAGES = {
  exterior: "/images/inspect/bg_inspect_front.png",  // الهيكل الخارجي
  interior: "/images/inspect/bg_inspect_back.png",     // الهيكل الداخلي
};

// ── Car Diagram Component with REAL Encar Images ──────────────────────────
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
        const color = STATUS_COLORS[dot.code]?.fill || "#6b7280";
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
              className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white transition-transform duration-200 group-hover:scale-150"
              style={{ backgroundColor: color }}
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

// ── Main Component ────────────────────────────────────────────────────────
export default function InspectionReport({ inspection, displayNumber }: Props) {
  // ← 3 تبويبات مطابقة للكوري
  const [inspectTab, setInspectTab] = useState<"performance" | "insurance">("performance");
  const [inspectView, setInspectView] = useState<"exterior" | "interior">("exterior");

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

  // Diagram dots — use backend coordinates if available
  const exteriorDots = inspection.diagram?.exterior || (damages.length > 0
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
  const interiorDots = inspection.diagram?.interior || [];

  // Sub-tabs config
  const INSPECTION_TABS = [
    { id: "performance" as const, label: "فحص الأداء" },
    { id: "insurance" as const, label: "سجل التأمين" },
  ];

  const inspectViews = [
    { key: "exterior" as const, label: "الهيكل الخارجي" },
    { key: "interior" as const, label: "الهيكل الداخلي" },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* ── Sub-tabs (Encar style) ────────────────────────────── */}
      <div className="flex border-b border-slate-700">
        {INSPECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setInspectTab(tab.id)}
            className={`flex-1 py-3 text-sm font-bold transition relative ${
              inspectTab === tab.id
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {inspectTab === tab.id && (
              <div className="absolute bottom-0 left-[15%] right-[15%] h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB: PERFORMANCE (فحص الأداء) ═══ */}
      {inspectTab === "performance" && (
        <div className="space-y-6">
          {/* Header + Display Number */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold">تقرير الفحص</h2>
            {displayNumber && (
              <span className="text-sm text-slate-400 font-medium">
                رقم العرض: <span className="text-white font-bold">{displayNumber}</span>
              </span>
            )}
          </div>

          {/* Status Banner */}
          <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
            damages.length > 0
              ? "bg-red-500/5 border-red-500/20"
              : "bg-green-500/5 border-green-500/20"
          }`}>
            <div className={`p-3 rounded-full ${
              damages.length > 0 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
            }`}>
              {damages.length > 0 ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-bold text-lg ${damages.length > 0 ? "text-red-300" : "text-green-300"}`}>
                {damages.length > 0
                  ? `يوجد ${damages.length} ضرر مسجل على هيكل السيارة`
                  : "لا توجد أضرار مُسجّلة على هيكل هذه السيارة"}
              </p>
              {damages.length === 0 && (
                <p className="text-sm text-green-400/70 mt-1">
                  الهيكل الخارجي والأساسي بحالة ممتازة
                </p>
              )}
            </div>
          </div>

          {/* Car Diagram with REAL Encar Images */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
            {/* View tabs */}
            <div className="flex gap-4 mb-4 border-b border-slate-700 pb-3">
              <button
                onClick={() => setInspectView("exterior")}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  inspectView === "exterior"
                    ? "border-red-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                الهيكل الخارجي {damages.length > 0 ? `— ضرر ${damages.length}` : "— لا يوجد"}
              </button>
              <button
                onClick={() => setInspectView("interior")}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  inspectView === "interior"
                    ? "border-red-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
                  className={`h-2.5 rounded-full transition-all ${
                    inspectView === v.key ? "bg-white w-6" : "bg-slate-600 w-2.5"
                  }`}
                  title={v.label}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center bg-slate-700/30 rounded-xl p-4">
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

            <p className="text-center text-xs text-slate-500 mt-3">
              * للمركبات غير السيارات يتم العرض وفقاً للسيارات
            </p>
          </div>

          {/* Damages Table */}
          {damages.length > 0 && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="grid grid-cols-3 text-xs text-slate-400 px-4 py-3 bg-slate-700/30">
                <span>القطعة</span>
                <span className="text-center">الحالة</span>
                <span className="text-left">الدرجة</span>
              </div>
              {damages.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 items-center px-4 py-3 border-t border-slate-700"
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
                      <span className="text-[10px] text-slate-500">{d.part}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm">{d.statusAr}</span>
                    <span className="text-xs text-slate-500 mr-1">/ {d.status}</span>
                  </div>
                  <div className="text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {d.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: INSURANCE (سجل التأمين) ═══ */}
      {inspectTab === "insurance" && summary && (
        <div className="space-y-6">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            سجل التأمين
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block mb-1">تغييرات الملكية</span>
              <span className="text-2xl font-black text-white">{summary.ownerChanges}</span>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block mb-1">حوادث الطرف الآخر</span>
              <span className={`text-2xl font-black ${summary.otherAccidents > 0 ? "text-orange-400" : "text-green-400"}`}>
                {summary.otherAccidents}
              </span>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block mb-1">حوادث من جانبي</span>
              <span className={`text-2xl font-black ${summary.myAccidents > 0 ? "text-red-400" : "text-green-400"}`}>
                {summary.myAccidents}
              </span>
            </div>
            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 text-center">
              <span className="text-xs text-red-300 block mb-1">إجمالي الحوادث</span>
              <span className="text-2xl font-black text-red-400">{summary.totalAccidents}</span>
            </div>
          </div>

          {accidents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-300 mb-3">سجل الحوادث</h4>
              <div className="space-y-2">
                {accidents.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3 border border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">
                        ₩ {a.amount.toLocaleString()}
                      </span>
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

          {summary.ownerChangeDates.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3">
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

          {totalCost > 0 && (
            <div className="bg-red-500/5 rounded-xl p-4 text-right border border-red-500/20">
              <p className="text-sm text-red-300 mb-1">إجمالي تكلفة حوادثي</p>
              <p className="text-2xl font-black text-red-400">
                ₩ {totalCost.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Performance Check ─────────────────────────────────── */}
      {inspection.performanceCheck?.checked && (
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
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

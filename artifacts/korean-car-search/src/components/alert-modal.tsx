import { useState } from "react";
import { X, Bell, BellOff, Plus, Trash2, ToggleLeft, ToggleRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts, type AlertFilter } from "@/hooks/use-alerts";
import { requestNotificationPermission, registerPushSubscription, getSessionId } from "@/lib/notifications";
import type { SearchCarsParams } from "@workspace/api-client-react";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  currentFilters?: SearchCarsParams;
}

const FUEL_LABELS: Record<string, string> = {
  gasoline: "بنزين",
  diesel: "ديزل",
  hybrid: "هايبرد",
  electric: "كهرباء",
};

const COLOR_LABELS: Record<string, string> = {
  white: "أبيض", black: "أسود", gray: "رمادي", silver: "فضي",
  red: "أحمر", lightblue: "أزرق فاتح", brown: "بني", green: "أخضر",
  yellow: "أصفر", orange: "برتقالي", lime: "أخضر فاتح",
};

function filterSummary(f: AlertFilter): string {
  const parts: string[] = [];
  if (f.brand) parts.push(f.brand);
  if (f.model) parts.push(f.model);
  if (f.yearFrom || f.yearTo) {
    parts.push(`${f.yearFrom ?? ""}–${f.yearTo ?? ""}`);
  }
  if (f.priceMax) parts.push(`حتى ${f.priceMax.toLocaleString()}만원`);
  if (f.fuelType) parts.push(FUEL_LABELS[f.fuelType] ?? f.fuelType);
  if (f.color) parts.push(COLOR_LABELS[f.color] ?? f.color);
  if (f.sunroof) parts.push("فتحة سقف");
  return parts.join(" • ") || "كل السيارات";
}

export function AlertModal({ open, onClose, currentFilters = {} }: AlertModalProps) {
  const { alerts, loading, createAlert, deleteAlert, toggleAlert } = useAlerts();
  const [tab, setTab] = useState<"list" | "create">("list");
  const [name, setName] = useState("");
  const [permState, setPermState] = useState<"idle" | "pending" | "granted" | "denied">("idle");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!open) return null;

  const filters: AlertFilter = {
    brand: currentFilters.brand,
    model: currentFilters.model,
    yearFrom: currentFilters.yearFrom,
    yearTo: currentFilters.yearTo,
    priceMin: currentFilters.priceMin,
    priceMax: currentFilters.priceMax,
    mileageMax: currentFilters.mileageMax,
    fuelType: currentFilters.fuelType,
    transmission: currentFilters.transmission,
    bodyType: currentFilters.bodyType,
    color: currentFilters.color,
    sunroof: currentFilters.sunroof,
  };

  const enableNotifications = async () => {
    setPermState("pending");
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      setPermState("granted");
      try {
        await registerPushSubscription(getSessionId());
      } catch (e) {
        console.warn("Push subscribe error:", e);
      }
    } else {
      setPermState("denied");
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (Notification.permission !== "granted") {
        await enableNotifications();
      }
      await createAlert(name.trim(), filters);
      setSuccessMsg("تم إنشاء التنبيه بنجاح!");
      setName("");
      setTimeout(() => {
        setSuccessMsg("");
        setTab("list");
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">تنبيهات السيارات</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("list")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tab === "list" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            تنبيهاتي ({alerts.length})
          </button>
          <button
            onClick={() => setTab("create")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5",
              tab === "create" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Plus className="w-4 h-4" />
            تنبيه جديد
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "list" && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">لا يوجد تنبيهات بعد</p>
                  <p className="text-sm mt-1">أنشئ تنبيهاً لتصلك إشعارات فور نزول سيارة جديدة</p>
                  <button
                    onClick={() => setTab("create")}
                    className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                  >
                    إنشاء تنبيه الآن
                  </button>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    "border rounded-xl p-4 transition-colors",
                    alert.active ? "border-border bg-background" : "border-border/40 bg-muted/30 opacity-60"
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{alert.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {filterSummary(alert as AlertFilter)}
                        </div>
                        {alert.lastCheckedAt && (
                          <div className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            آخر فحص: {new Date(alert.lastCheckedAt).toLocaleString("ar")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title={alert.active ? "إيقاف" : "تفعيل"}
                        >
                          {alert.active
                            ? <ToggleRight className="w-6 h-6 text-primary" />
                            : <ToggleLeft className="w-6 h-6" />
                          }
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "create" && (
            <div className="space-y-5">
              {/* Current filters preview */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-bold text-primary mb-2">سيتم التنبيه عن:</p>
                <p className="text-sm text-foreground">{filterSummary(filters)}</p>
              </div>

              {/* Alert name */}
              <div className="space-y-2">
                <label className="text-sm font-bold">اسم التنبيه</label>
                <input
                  type="text"
                  placeholder="مثال: BMW X5 بأسعار معقولة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              {/* Notification permission note */}
              {Notification.permission === "default" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  سيطلب المتصفح إذناً للإشعارات عند حفظ التنبيه
                </div>
              )}
              {(Notification.permission === "denied" || permState === "denied") && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive">
                  تم رفض الإشعارات في المتصفح. افتح الإعدادات وأعد تفعيلها لتصلك التنبيهات.
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-400 font-bold text-center">
                  ✓ {successMsg}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!name.trim() || saving || loading}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="animate-pulse">جاري الحفظ...</span>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    حفظ التنبيه
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                ستصلك إشعارات فورية عبر المتصفح كل 5 دقائق عند نزول سيارة جديدة
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

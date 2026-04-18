import { useState } from "react";
const KRW_TO_SAR = 0.00274;
const countries = [
  { code:"sa", name:"السعودية", flag:"🇸🇦", customs:0.05, vat:0.15, currency:"ر.س", rate:1 },
  { code:"ae", name:"الإمارات", flag:"🇦🇪", customs:0.05, vat:0.05, currency:"د.إ", rate:1.02 },
  { code:"kw", name:"الكويت", flag:"🇰🇼", customs:0.05, vat:0, currency:"د.ك", rate:0.084 },
  { code:"qa", name:"قطر", flag:"🇶🇦", customs:0.05, vat:0, currency:"ر.ق", rate:1.03 },
  { code:"bh", name:"البحرين", flag:"🇧🇭", customs:0.05, vat:0.10, currency:"د.ب", rate:0.1 },
  { code:"om", name:"عُمان", flag:"🇴🇲", customs:0.05, vat:0.05, currency:"ر.ع", rate:0.097 },
  { code:"jo", name:"الأردن", flag:"🇯🇴", customs:0.16, vat:0.16, currency:"د.أ", rate:0.266 },
  { code:"eg", name:"مصر", flag:"🇪🇬", customs:0.40, vat:0.14, currency:"ج.م", rate:13.5 },
  { code:"iq", name:"العراق", flag:"🇮🇶", customs:0.10, vat:0, currency:"د.ع", rate:490 },
];
export default function ImportCalculator({ carPriceKRW = 0 }: { carPriceKRW?: number }) {
  const [sel, setSel] = useState("sa");
  const [shipping, setShipping] = useState(5000);
  const [open, setOpen] = useState(false);
  const priceSAR = carPriceKRW * KRW_TO_SAR;
  const c = countries.find((x) => x.code === sel)!;
  const cif = priceSAR + shipping;
  const customsAmt = cif * c.customs;
  const vatAmt = (cif + customsAmt) * c.vat;
  const fixed = 4300;
  const total = priceSAR + shipping + customsAmt + vatAmt + fixed;
  const fmt = (n: number) => Math.round(n).toLocaleString("ar");
  return (
    <div className="mt-4 border border-border rounded-2xl overflow-hidden" dir="rtl">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧮</span>
          <span className="font-bold">حاسبة تكلفة الاستيراد</span>
        </div>
        <span className="text-muted-foreground text-sm">{open ? "▲ إخفاء" : "▼ احسب"}</span>
      </button>
      {open && (
        <div className="p-4 space-y-4">
          {priceSAR > 0 && (
            <div className="bg-muted/20 rounded-xl p-3 text-sm">
              <span className="text-muted-foreground">سعر السيارة: </span>
              <span className="font-bold text-primary">{fmt(priceSAR)} ر.س</span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">دولة الوصول</p>
            <div className="grid grid-cols-3 gap-2">
              {countries.map((co) => (
                <button key={co.code} onClick={() => setSel(co.code)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${sel===co.code?"border-primary bg-primary/10 text-primary":"border-border bg-muted/10 hover:border-primary/50"}`}>
                  <span className="text-lg">{co.flag}</span>
                  <span>{co.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground font-semibold">تكلفة الشحن</span>
              <span className="font-bold text-primary">{fmt(shipping)} ر.س</span>
            </div>
            <input type="range" min={3000} max={7000} step={500} value={shipping}
              onChange={(e) => setShipping(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label:"سعر السيارة", val:fmt(priceSAR), cls:"" },
              { label:"الشحن البحري", val:fmt(shipping), cls:"" },
              { label:`جمارك (${(c.customs*100).toFixed(0)}%)`, val:fmt(customsAmt), cls:"text-red-500" },
              ...(c.vat>0?[{ label:`ضريبة (${(c.vat*100).toFixed(0)}%)`, val:fmt(vatAmt), cls:"text-red-500" }]:[]),
              { label:"تخليص + فحص + SASO + عمولة", val:fmt(fixed), cls:"text-yellow-500" },
            ].map((row,i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-bold ${row.cls}`}>{row.val} ر.س</span>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">التكلفة الإجمالية</p>
            <p className="text-2xl font-black text-primary">{fmt(total)} ر.س</p>
            {c.rate!==1 && <p className="text-sm text-muted-foreground mt-1">≈ {fmt(total*c.rate)} {c.currency}</p>}
          </div>
          <p className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">⚠️ هذه الأرقام تقديرية وقد تختلف الرسوم الفعلية.</p>
        </div>
      )}
    </div>
  );
}

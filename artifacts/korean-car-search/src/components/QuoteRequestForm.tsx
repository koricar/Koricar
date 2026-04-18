import { useState } from "react";
import { supabase } from '../lib/supabase';

interface Props { carName?: string; carPrice?: string; carId?: number; }
export default function QuoteRequestForm({ carName="", carPrice="", carId }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", country:"sa", inspection:"yes", contact:"whatsapp", notes:"" });
  const countries: Record<string,string> = { sa:"🇸🇦 السعودية", ae:"🇦🇪 الإمارات", kw:"🇰🇼 الكويت", qa:"🇶🇦 قطر", bh:"🇧🇭 البحرين", om:"🇴🇲 عُمان", jo:"🇯🇴 الأردن", eg:"🇪🇬 مصر", iq:"🇮🇶 العراق" };
  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}));
  const msg = () => encodeURIComponent(`🚗 *طلب تسعيرة استيراد*\n\n*السيارة:* ${carName}\n*السعر:* ${carPrice}\n*الرابط:* https://car-search-korea.replit.app/cars/${carId}\n\n*الاسم:* ${form.name}\n*الجوال:* ${form.phone}\n*الدولة:* ${countries[form.country]}\n*فحص:* ${form.inspection==="yes"?"✅ نعم":"❌ لا"}\n*التواصل:* ${form.contact==="whatsapp"?"واتساب":"اتصال"}\n*ملاحظات:* ${form.notes||"لا يوجد"}`);
  const submit = async () => {
    if (!form.name||!form.phone) return;
    setLoading(true);
    try {
      await supabase.from('orders').insert([{
        car_name: carName, car_price: carPrice, car_id: carId,
        customer_name: form.name, phone: form.phone,
        country: countries[form.country],
        inspection: form.inspection === "yes",
        contact_method: form.contact,
        notes: form.notes || null, status: 'new'
      }]);
      await fetch("https://formsubmit.co/ajax/Salahohyeah@gmail.com",{ method:"POST", headers:{"Content-Type":"application/json",Accept:"application/json"}, body:JSON.stringify({ subject:`طلب تسعيرة - ${carName}`, name:form.name, phone:form.phone, car:carName, price:carPrice, country:countries[form.country], inspection:form.inspection==="yes"?"نعم":"لا", contact:form.contact==="whatsapp"?"واتساب":"اتصال", notes:form.notes||"لا يوجد" }) });
    } catch(e){ console.error(e); }
    setLoading(false); setDone(true);
    setTimeout(()=>{ window.open(`https://wa.me/821068152732?text=${msg()}`,"_blank"); },500);
  };
  if (done) return (
    <div className="mt-4 border border-green-500/30 bg-green-500/10 rounded-2xl p-6 text-center" dir="rtl">
      <div className="text-4xl mb-3">✅</div>
      <p className="font-bold text-lg mb-1">تم إرسال طلبك!</p>
      <p className="text-sm text-muted-foreground mb-2">سيتم التواصل معك قريباً</p>
      <p className="text-xs text-muted-foreground">جاري فتح واتساب لتأكيد الطلب...</p>
    </div>
  );
  return (
    <div className="mt-4" dir="rtl">
      {!open ? (
        <button onClick={()=>setOpen(true)} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">طلب تسعيرة استيراد</button>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2"><span className="text-xl">📋</span><span className="font-bold">طلب تسعيرة استيراد</span></div>
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{step}/2</span><button onClick={()=>setOpen(false)} className="text-muted-foreground text-lg">✕</button></div>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-muted/20 rounded-xl p-3 text-sm"><span className="text-muted-foreground">السيارة: </span><span className="font-bold">{carName}</span>{carPrice&&<span className="text-primary font-bold mr-2">— {carPrice}</span>}</div>
            {step===1 && (<>
              <div className="space-y-3">
                <div><label className="text-sm font-semibold text-muted-foreground block mb-1">الاسم الكامل *</label><input type="text" placeholder="مثال: محمد العلي" value={form.name} onChange={e=>set("name",e.target.value)} className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"/></div>
                <div><label className="text-sm font-semibold text-muted-foreground block mb-1">رقم الجوال *</label><input type="tel" placeholder="+966501234567" value={form.phone} onChange={e=>set("phone",e.target.value)} className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"/></div>
                <div><label className="text-sm font-semibold text-muted-foreground block mb-2">دولة الوصول</label><div className="grid grid-cols-3 gap-2">{Object.entries(countries).map(([code,label])=>(<button key={code} onClick={()=>set("country",code)} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${form.country===code?"border-primary bg-primary/10 text-primary":"border-border bg-muted/10"}`}>{label}</button>))}</div></div>
              </div>
              <button onClick={()=>{if(form.name&&form.phone)setStep(2);}} disabled={!form.name||!form.phone} className="w-full py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50">التالي ←</button>
            </>)}
            {step===2 && (<>
              <div className="space-y-3">
                <div><label className="text-sm font-semibold text-muted-foreground block mb-2">فحص مستقل قبل الشراء؟</label><div className="grid grid-cols-2 gap-2">{[{v:"yes",l:"✅ نعم، أريد فحص"},{v:"no",l:"❌ لا، بدون فحص"}].map(o=>(<button key={o.v} onClick={()=>set("inspection",o.v)} className={`py-3 rounded-xl border text-sm font-bold transition-all ${form.inspection===o.v?"border-primary bg-primary/10 text-primary":"border-border bg-muted/10"}`}>{o.l}</button>))}</div></div>
                <div><label className="text-sm font-semibold text-muted-foreground block mb-2">طريقة التواصل</label><div className="grid grid-cols-2 gap-2">{[{v:"whatsapp",l:"💬 واتساب"},{v:"call",l:"📞 اتصال"}].map(o=>(<button key={o.v} onClick={()=>set("contact",o.v)} className={`py-3 rounded-xl border text-sm font-bold transition-all ${form.contact===o.v?"border-primary bg-primary/10 text-primary":"border-border bg-muted/10"}`}>{o.l}</button>))}</div></div>
                <div><label className="text-sm font-semibold text-muted-foreground block mb-1">ملاحظات إضافية</label><textarea placeholder="أي تفاصيل إضافية..." value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"/></div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setStep(1)} className="py-3 px-4 border border-border rounded-xl text-sm font-bold">→ رجوع</button>
                <button onClick={submit} disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50">{loading?"جاري الإرسال...":"📤 إرسال الطلب"}</button>
              </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
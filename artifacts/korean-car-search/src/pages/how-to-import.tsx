import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Search, ClipboardList, ShieldCheck, Ship, CheckCircle } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "١",
    title: "ابحث عن سيارتك",
    desc: "تصفح أكثر من 200,000 سيارة كورية وفلتر حسب الماركة، الموديل، السعر، السنة، واللون. يمكنك أيضاً تفعيل فلتر 'متوافق فقط' حسب دولتك.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: ClipboardList,
    step: "٢",
    title: "اطلب تسعيرة مجانية",
    desc: "اضغط على 'طلب تسعيرة استيراد' في صفحة السيارة. سيتواصل معك فريقنا خلال 24 ساعة بتفاصيل التكلفة الكاملة شاملة الشحن والجمارك.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    step: "٣",
    title: "تأكيد وفحص السيارة",
    desc: "بعد الموافقة على التسعيرة، ندفع العربون ونرتب فحصاً شاملاً للسيارة (ظاهري وميكانيكي) من خلال منصة Encar المعتمدة.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Ship,
    step: "٤",
    title: "الشحن والتخليص",
    desc: "نتولى كافة إجراءات الشحن البحري والتخليص الجمركي في ميناء بلدك. ستتلقى تحديثات مستمرة حول موقع سيارتك.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: CheckCircle,
    step: "٥",
    title: "استلم سيارتك",
    desc: "بعد وصول السيارة إلى الميناء وإتمام التسجيل، تستلم سيارتك جاهزة! كل هذا في 30-60 يوم من تأكيد الطلب.",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const COSTS = [
  { label: "سعر السيارة", desc: "السعر الفعلي من السوق الكوري" },
  { label: "تكلفة الشحن", desc: "حسب حجم السيارة والمنفذ" },
  { label: "الرسوم الجمركية", desc: "5% في السعودية" },
  { label: "ضريبة القيمة المضافة", desc: "15% في السعودية" },
  { label: "تكاليف التخليص", desc: "الإجراءات الجمركية والتسجيل" },
];

export default function HowToImport() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-muted to-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">دليل الاستيراد</span>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">كيفية الاستيراد</h1>
            <p className="text-muted-foreground text-lg">دليلك الشامل لاستيراد سيارتك الكورية خطوة بخطوة</p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16 max-w-3xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-5 bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-muted-foreground/40 font-numbers">{step.step}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Costs */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-foreground mb-10">ما الذي تدفعه؟</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {COSTS.map((cost, i) => (
              <div key={i} className={`flex justify-between items-center p-5 ${i < COSTS.length - 1 ? "border-b border-border" : ""}`}>
                <div>
                  <p className="font-bold text-foreground">{cost.label}</p>
                  <p className="text-sm text-muted-foreground">{cost.desc}</p>
                </div>
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            استخدم <a href="/" className="text-primary font-bold underline">حاسبة الاستيراد</a> لمعرفة التكلفة الإجمالية بدقة
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-black text-foreground mb-4">جاهز تبدأ؟</h2>
          <p className="text-muted-foreground mb-8">ابحث الآن وسنساعدك في كل خطوة</p>
          <a href="/" className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform text-lg">
            ابحث عن سيارتك 🚗
          </a>
        </motion.div>
      </section>
    </Layout>
  );
}

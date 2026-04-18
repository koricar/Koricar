import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, Star, Users } from "lucide-react";

const STATS = [
  { value: "+200,000", label: "سيارة متاحة" },
  { value: "6",        label: "دول خليجية" },
  { value: "100%",     label: "فحص معتمد" },
  { value: "24/7",     label: "دعم فوري" },
];

const VALUES = [
  { icon: ShieldCheck, title: "الشفافية",  desc: "نعرض الأسعار الحقيقية من السوق الكوري مباشرة بدون تلاعب." },
  { icon: Globe,       title: "الموثوقية", desc: "جميع سياراتنا من منصات معتمدة مثل Encar و K Car." },
  { icon: Star,        title: "الجودة",    desc: "فحص شامل لكل سيارة قبل الشحن لضمان رضاك التام." },
  { icon: Users,       title: "الخدمة",    desc: "فريق متخصص يساعدك من البحث حتى استلام سيارتك." },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative w-full pt-32 pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">من نحن</span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              كوريكار —<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                بوابتك للسيارات الكورية
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              منصة عربية متخصصة في مساعدة العرب على استيراد السيارات الكورية بأفضل الأسعار وأعلى معايير الجودة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-white font-numbers">{stat.value}</p>
                <p className="text-primary-foreground/80 font-semibold mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black text-foreground mb-6">قصتنا</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              بدأت كوريكار من رؤية بسيطة: السوق الكوري يضم مئات الآلاف من السيارات عالية الجودة بأسعار تنافسية، لكن العرب يجدون صعوبة في الوصول إليها بسبب الحاجز اللغوي والتعقيدات اللوجستية.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              قررنا بناء جسر بين السوق الكوري والمستهلك العربي — منصة تجمع أكبر قواعد بيانات السيارات الكورية وتعرضها بالعربية مع خدمات متكاملة للاستيراد.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-foreground mb-12">قيمنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <val.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{val.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-black text-foreground mb-4">جاهز تستورد سيارتك؟</h2>
          <p className="text-muted-foreground mb-8">ابحث من بين أكثر من 200,000 سيارة كورية الآن</p>
          <a href="/" className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform text-lg">
            ابدأ البحث 🚗
          </a>
        </motion.div>
      </section>
    </Layout>
  );
}

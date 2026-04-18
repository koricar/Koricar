import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    title: "واتساب",
    desc: "الأسرع — رد خلال دقائق",
    value: "+82 10-6815-2732",
    href: "https://wa.me/821068152732?text=" + encodeURIComponent("مرحباً، أريد الاستفسار عن استيراد سيارة من كوريا 🚗"),
    color: "bg-green-500",
    label: "تواصل عبر واتساب",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    desc: "للاستفسارات التفصيلية",
    value: "support@koreancar.com",
    href: "mailto:support@koreancar.com",
    color: "bg-primary",
    label: "أرسل بريد إلكتروني",
  },
  {
    icon: Phone,
    title: "الهاتف",
    desc: "للمكالمات المباشرة",
    value: "+966 50 000 0000",
    href: "tel:+966500000000",
    color: "bg-blue-500",
    label: "اتصل بنا",
  },
];

const INFO = [
  { icon: MapPin, label: "الموقع",       value: "المملكة العربية السعودية، الرياض" },
  { icon: Clock,  label: "ساعات العمل",  value: "السبت - الخميس، 9 صباحاً - 9 مساءً" },
];

export default function Contact() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-muted to-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">تواصل معنا</span>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">نحن هنا لمساعدتك</h1>
            <p className="text-muted-foreground text-lg">فريقنا جاهز للإجابة على جميع استفساراتك حول استيراد السيارات</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTACT_METHODS.map((method, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${method.color}`}>
                <method.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">{method.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{method.desc}</p>
              <p className="font-bold text-foreground mb-4 font-numbers">{method.value}</p>
              <a
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 ${method.color}`}
              >
                {method.label}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="pb-16 max-w-2xl mx-auto px-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {INFO.map((item, i) => (
            <div key={i} className={`flex items-center gap-4 ${i < INFO.length - 1 ? "mb-5 pb-5 border-b border-border" : ""}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-lg mx-auto px-4 bg-green-50 border border-green-200 rounded-2xl p-8">
          <p className="text-2xl mb-2">💬</p>
          <h2 className="text-xl font-black text-foreground mb-2">أسرع طريقة للتواصل</h2>
          <p className="text-muted-foreground mb-6 text-sm">تواصل معنا على واتساب وسنرد فوراً</p>
          <a
            href="https://wa.me/821068152732?text=مرحباً، أريد الاستفسار عن استيراد سيارة من كوريا 🚗"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-transform"
          >
            ابدأ المحادثة الآن
          </a>
        </motion.div>
      </section>
    </Layout>
  );
}

import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "كيف أبدأ عملية الاستيراد؟",
    a: "ابحث عن سيارتك على koricar.com، ثم اضغط 'طلب تسعيرة استيراد'. سيتواصل معك فريقنا خلال 24 ساعة بكل التفاصيل والتكاليف."
  },
  {
    q: "كم تستغرق عملية الاستيراد؟",
    a: "عادةً من 30 إلى 60 يوم من تأكيد الطلب حتى وصول السيارة إلى ميناء بلدك، يشمل ذلك الفحص والشحن والتخليص الجمركي."
  },
  {
    q: "هل السيارات خاضعة للفحص قبل الشحن؟",
    a: "نعم، جميع سياراتنا تخضع لفحص ظاهري وميكانيكي شامل من خلال منصة Encar المعتمدة قبل أي عملية شحن."
  },
  {
    q: "ما هي التكاليف الإضافية على سعر السيارة؟",
    a: "التكاليف تشمل: تكلفة الشحن البحري، الرسوم الجمركية (5% في السعودية)، ضريبة القيمة المضافة، وتكاليف التخليص. يمكنك استخدام حاسبة الاستيراد لمعرفة التكلفة الإجمالية."
  },
  {
    q: "هل السيارات الكورية متوافقة مع اشتراطات الخليج؟",
    a: "معظم السيارات من موديل 2021 وأحدث متوافقة مع اشتراطات كفاءة الطاقة الخليجية. يمكنك تفعيل فلتر 'متوافق فقط' في البحث، أو التواصل معنا للتأكد من أي سيارة."
  },
  {
    q: "هل يمكنني استيراد أي ماركة؟",
    a: "نعم، لدينا جميع الماركات الكورية (هيونداي، كيا، جينيسيس) والعالمية المتوفرة في السوق الكوري كـ BMW، مرسيدس، تويوتا، وغيرها."
  },
  {
    q: "كيف أدفع؟",
    a: "نقبل التحويل البنكي والدفع الإلكتروني. يتم الدفع على مراحل: عربون عند التأكيد، والمبلغ المتبقي قبل الشحن."
  },
  {
    q: "ماذا لو كانت السيارة غير مطابقة للوصف؟",
    a: "نوفر ضمان المطابقة الكاملة. في حالة وجود اختلاف جوهري عن الوصف، نتعامل مع الأمر فوراً ونجد الحل المناسب لك."
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-right bg-card hover:bg-muted/50 transition-colors"
      >
        <span className="font-bold text-foreground text-base">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-primary shrink-0 transition-transform mr-3", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5 bg-card">
          <p className="text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-to-b from-muted to-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">الأسئلة الشائعة</span>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">كيف نساعدك؟</h1>
            <p className="text-muted-foreground text-lg">إجابات على أكثر الأسئلة شيوعاً حول استيراد السيارات من كوريا</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 max-w-3xl mx-auto px-4">
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <p className="font-bold text-foreground text-lg mb-2">لم تجد إجابتك؟</p>
          <p className="text-muted-foreground mb-6">تواصل معنا مباشرة وسيرد عليك فريقنا خلال ساعات</p>
          <a
            href="https://wa.me/821068152732"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-transform"
          >
            💬 تواصل عبر واتساب
          </a>
        </div>
      </section>
    </Layout>
  );
}

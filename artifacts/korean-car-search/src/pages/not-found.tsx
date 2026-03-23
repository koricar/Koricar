import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 shadow-inner">
          <ShieldAlert className="w-12 h-12" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">عذراً، الصفحة غير موجودة</h2>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
          يبدو أنك تبحث عن صفحة غير متوفرة أو تم تغيير الرابط الخاص بها.
        </p>
        
        <Link 
          href="/" 
          className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </Layout>
  );
}

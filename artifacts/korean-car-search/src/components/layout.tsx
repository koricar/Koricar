import { Link, useLocation } from "wouter";
import { Search, Car, Menu, X, Heart, User, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertBell } from "@/components/alert-bell";
import { AlertModal } from "@/components/alert-modal";
import { useAlertContext } from "@/contexts/alert-context";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { open: alertOpen, defaultFilters, openModal, closeModal } = useAlertContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans rtl" dir="rtl">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || mobileMenuOpen
            ? "glass-panel bg-white/80 dark:bg-slate-900/80 border-b border-border/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight transition-colors duration-300",
                !isScrolled && location === '/' ? "text-white" : "text-foreground"
              )}>
                كوري<span className="text-primary font-black">كار</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "الرئيسية", path: "/" },
                { name: "تصفح السيارات", path: "/search" },
                { name: "كيف نستورد", path: "/how-it-works" },
                { name: "من نحن", path: "/about" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "text-sm font-semibold transition-all hover:text-primary relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300",
                    !isScrolled && location === '/' ? "text-white/90 hover:text-white" : "text-foreground/80"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <AlertBell
                onClick={() => openModal()}
                className={cn(
                  !isScrolled && location === '/' ? "text-white/80 hover:bg-white/10" : "text-foreground/70"
                )}
              />
              <button className={cn(
                "p-2.5 rounded-full transition-colors",
                !isScrolled && location === '/' ? "text-white/80 hover:bg-white/10" : "text-foreground/70 hover:bg-muted"
              )}>
                <User className="w-5 h-5" />
              </button>
              <Link
                href="/search"
                className="ml-4 px-6 py-2.5 rounded-full font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                إبحث الآن
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className={cn("w-6 h-6", !isScrolled && location === '/' ? "text-white" : "text-foreground")} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 pb-6 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-6 text-xl font-bold mt-8">
              <Link href="/" className="flex items-center justify-between border-b border-border pb-4">
                الرئيسية <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link href="/search" className="flex items-center justify-between border-b border-border pb-4">
                تصفح السيارات <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link href="/how-it-works" className="flex items-center justify-between border-b border-border pb-4">
                كيف نستورد <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link href="/about" className="flex items-center justify-between border-b border-border pb-4">
                من نحن <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <button className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground text-center shadow-lg">
                تسجيل الدخول
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AlertModal open={alertOpen} onClose={closeModal} currentFilters={defaultFilters} />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12 md:py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 group mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  كوري<span className="text-primary font-black">كار</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                منصتك الأولى الموثوقة للبحث واستيراد السيارات الكورية المستعملة والجديدة بأفضل الأسعار وأعلى معايير الجودة.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">روابط سريعة</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
                <li><Link href="/search" className="hover:text-primary transition-colors">تصفح السيارات</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">المساعدة والدعم</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">كيفية الاستيراد</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">تواصل معنا</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">تواصل معنا</h4>
              <ul className="space-y-4 text-sm">
                <li className="font-numbers">support@koreancar.com</li>
                <li className="font-numbers" dir="ltr">+966 50 000 0000</li>
                <li>المملكة العربية السعودية، الرياض</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-numbers">© {new Date().getFullYear()} KoreanCar. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm hover:text-white transition-colors">الشروط والأحكام</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors">سياسة الخصوصية</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

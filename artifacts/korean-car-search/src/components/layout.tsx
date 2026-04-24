import { Link, useLocation } from "wouter";
import { Search, Car, Menu, X, Heart, User, ChevronLeft, Phone, Mail, MapPin, Instagram, Twitter, Youtube, MessageCircle } from "lucide-react";
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans rtl" dir="rtl">
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || mobileMenuOpen
          ? "glass-panel bg-white/80 dark:bg-slate-900/80 border-b border-border/50 py-3"
          : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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

            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "الرئيسية",      path: "/" },
                { name: "تصفح السيارات", path: "/search" },
                { name: "كيف نستورد",    path: "/how-to-import" },
                { name: "من نحن",        path: "/about" },
              ].map((item) => (
                <Link key={item.name} href={item.path}
                  className={cn(
                    "text-sm font-semibold transition-all hover:text-primary relative after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300",
                    !isScrolled && location === '/' ? "text-white/90 hover:text-white" : "text-foreground/80"
                  )}>
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <AlertBell
                onClick={() => openModal()}
                className={cn(!isScrolled && location === '/' ? "text-white/80 hover:bg-white/10" : "text-foreground/70")}
              />
              <button className={cn("p-2.5 rounded-full transition-colors",
                !isScrolled && location === '/' ? "text-white/80 hover:bg-white/10" : "text-foreground/70 hover:bg-muted")}>
                <User className="w-5 h-5" />
              </button>
              <Link href="/search"
                className="ml-4 px-6 py-2.5 rounded-full font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                إبحث الآن
              </Link>
            </div>

            <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className={cn("w-6 h-6", !isScrolled && location === '/' ? "text-white" : "text-foreground")} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 pb-6 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-6 text-xl font-bold mt-8">
              {[
                { name: "الرئيسية",        path: "/" },
                { name: "تصفح السيارات",   path: "/search" },
                { name: "كيف نستورد",      path: "/how-to-import" },
                { name: "من نحن",          path: "/about" },
                { name: "الأسئلة الشائعة", path: "/faq" },
                { name: "تواصل معنا",      path: "/contact" },
              ].map((item) => (
                <Link key={item.path} href={item.path}
                  className="flex items-center justify-between border-b border-border pb-4">
                  {item.name} <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <Link href="/search" className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground text-center shadow-lg">
                ابحث عن سيارتك
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertModal open={alertOpen} onClose={closeModal} currentFilters={defaultFilters} />

      <main className="flex-1 w-full flex flex-col">{children}</main>

      {/* ── Footer ── */}
      <footer className="relative bg-slate-950 text-slate-300 overflow-hidden mt-auto">

        {/* Top gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Stats bar */}
        <div className="border-b border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { num: "+200K", label: "سيارة متاحة", icon: "🚗" },
                { num: "100%", label: "فحص معتمد",   icon: "✅" },
                { num: "15+",  label: "دولة نشحن لها", icon: "🌍" },
                { num: "24/7", label: "دعم مستمر",    icon: "💬" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="text-white font-black text-xl font-numbers">{s.num}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  كوري<span className="text-primary font-black">كار</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                منصتك الأولى الموثوقة للبحث واستيراد السيارات الكورية المستعملة والجديدة بأفضل الأسعار وأعلى معايير الجودة.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { icon: <MessageCircle className="w-4 h-4" />, href: "#", label: "واتساب", color: "hover:bg-green-600" },
                  { icon: <Instagram className="w-4 h-4" />,     href: "#", label: "انستغرام", color: "hover:bg-pink-600" },
                  { icon: <Twitter className="w-4 h-4" />,       href: "#", label: "تويتر", color: "hover:bg-sky-500" },
                  { icon: <Youtube className="w-4 h-4" />,       href: "#", label: "يوتيوب", color: "hover:bg-red-600" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={cn(
                      "w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200",
                      s.color
                    )}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-bold mb-5 text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                روابط سريعة
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "الرئيسية",        path: "/" },
                  { name: "تصفح السيارات",   path: "/search" },
                  { name: "كيف نستورد",      path: "/how-to-import" },
                  { name: "من نحن",          path: "/about" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}
                      className="text-slate-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-5 text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                المساعدة والدعم
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "الأسئلة الشائعة", path: "/faq" },
                  { name: "كيفية الاستيراد", path: "/how-to-import" },
                  { name: "تواصل معنا",      path: "/contact" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}
                      className="text-slate-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-5 text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                تواصل معنا
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:support@koreancar.com"
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-numbers">support@koreancar.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+966538090436"
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-numbers" dir="ltr">+966 53 809 0436</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>المملكة العربية السعودية، الدمام</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-sm font-numbers">
              © {new Date().getFullYear()} KoreanCar. All rights reserved.
            </p>
            <div className="flex gap-5">
              <Link href="/faq"     className="text-slate-500 hover:text-slate-300 text-sm transition-colors">الشروط والأحكام</Link>
              <Link href="/contact" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">سياسة الخصوصية</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

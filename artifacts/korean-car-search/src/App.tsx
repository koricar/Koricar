import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertProvider } from "@/contexts/alert-context";

import Home from "@/pages/home";
import CarDetails from "@/pages/car-details";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import HowToImport from "@/pages/how-to-import";
import Contact from "@/pages/contact";
import Equipment from "@/pages/equipment";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function WhatsAppButton() {
  const phoneNumber = "821068152732";
  const message = encodeURIComponent("مرحباً، أريد الاستفسار عن استيراد سيارة من كوريا 🚗");
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .wa-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #25D366;
          animation: pulse-ring 1.5s ease-out infinite;
          z-index: -1;
        }
      `}</style>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pulse"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          backgroundColor: "#25D366",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          cursor: "pointer",
          textDecoration: "none",
        }}
        title="تواصل معنا على واتساب"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="white">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.472 2.027 7.776L0 32l8.437-2.01A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.771-1.854l-.485-.287-5.01 1.194 1.237-4.883-.317-.502A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.719-1.294-.366-.133-.632-.199-.898.199-.266.398-1.03 1.294-1.263 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.62-3.202-1.977-1.184-1.057-1.983-2.362-2.215-2.76-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.698.2-.232.266-.398.399-.664.133-.266.066-.498-.033-.697-.1-.2-.898-2.164-1.23-2.963-.324-.778-.654-.673-.898-.685l-.765-.013c-.266 0-.697.1-1.063.498-.366.398-1.396 1.363-1.396 3.327s1.43 3.859 1.629 4.125c.2.266 2.815 4.298 6.821 6.027.954.411 1.698.657 2.279.841.957.305 1.829.262 2.517.159.767-.114 2.354-.963 2.687-1.893.333-.93.333-1.727.233-1.893-.1-.166-.366-.266-.764-.465z" />
        </svg>
      </a>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Home} />
      <Route path="/cars/:id" component={CarDetails} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={FAQ} />
      <Route path="/how-to-import" component={HowToImport} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
      <Route path="/equipment" component={Equipment} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AlertProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <WhatsAppButton />
        </AlertProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

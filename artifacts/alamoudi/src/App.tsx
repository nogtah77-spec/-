import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { ComponentType, Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "next-themes";
import NotFound from "@/pages/not-found";
import { DataProvider, useData } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserPrefsProvider } from "@/context/UserPrefsContext";
import { AIChatProvider } from "@/context/AIChatContext";
import { AI_ASSISTANT_ENABLED } from "@/config/features";
import { api } from "@/lib/api";
import { getVisitorId } from "@/lib/visitorTracking";
import { LiveVisitorsBubble } from "@/components/ui/LiveVisitorsBubble";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { InstallPwaPrompt } from "@/components/ui/InstallPwaPrompt";

import Home from "@/pages/Home";
import About from "@/pages/About";
import AddProperty from "@/pages/AddProperty";
import Consultation from "@/pages/Consultation";
import FinishingServices from "@/pages/FinishingServices";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PropertyDetails from "@/pages/PropertyDetails";
import Favorites from "@/pages/Favorites";
import Compare from "@/pages/Compare";
import Login from "@/pages/Login";
import RegionPage from "@/pages/RegionPage";

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Properties = lazy(() => import("@/pages/admin/Properties"));
const PropertyForm = lazy(() => import("@/pages/admin/PropertyForm"));
const Regions = lazy(() => import("@/pages/admin/Regions"));
const PropertyTypes = lazy(() => import("@/pages/admin/PropertyTypes"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Roles = lazy(() => import("@/pages/admin/Roles"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const ActivityLogs = lazy(() => import("@/pages/admin/ActivityLogs"));
const ImportExport = lazy(() => import("@/pages/admin/ImportExport"));
const Inquiries = lazy(() => import("@/pages/admin/Inquiries"));
const CustomerRequests = lazy(() => import("@/pages/admin/CustomerRequests"));
const Contracts = lazy(() => import("@/pages/admin/Contracts"));
const PropertyRequests = lazy(() => import("@/pages/admin/PropertyRequests"));
const FinishingRequests = lazy(() => import("@/pages/admin/FinishingRequests"));
const AiLeads = lazy(() => import("@/pages/admin/AiLeads"));
const Backup = lazy(() => import("@/pages/admin/Backup"));
const AdsAdmin        = lazy(() => import("@/pages/admin/Ads"));
const AdAnalytics     = lazy(() => import("@/pages/admin/AdAnalytics"));
const SmartBanners    = lazy(() => import("@/pages/admin/SmartBanners"));
const Sources              = lazy(() => import("@/pages/admin/Sources"));
const AiAgents             = lazy(() => import("@/pages/admin/AiAgents"));
const WhatsAppBot          = lazy(() => import("@/pages/admin/WhatsAppBot"));
const MortgageCalculatorPage = lazy(() => import("@/pages/admin/MortgageCalculatorPage"));
const FinishingGallery     = lazy(() => import("@/pages/admin/FinishingGallery"));
const AIChatWidget = lazy(() => import("@/components/ai/AIChatWidget").then((module) => ({ default: module.AIChatWidget })));

const queryClient = new QueryClient();

function Protected({ component: Component, adminOnly = false }: { component: ComponentType; adminOnly?: boolean }) {
  const { currentUser, isStaff, authReady } = useAuth();
  if (!authReady) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">جارٍ التحميل…</div>;
  if (!isStaff) return <Redirect to="/login" />;
  if (adminOnly && currentUser?.role !== "admin") return <Redirect to="/admin" />;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">جارٍ التحميل…</div>}>
      <Component />
    </Suspense>
  );
}

function VisitorTracker() {
  const { authReady, isStaff } = useAuth();
  useEffect(() => {
    // Only count real visitors: skip until auth is resolved, and never track
    // logged-in staff (admins/agents) so they're excluded from all analytics.
    if (!authReady || isStaff) return;
    const send = () => {
      if (document.visibilityState !== "visible") return;
      void api.post("/track/heartbeat", { visitorId: getVisitorId() }).catch(() => {
        /* best-effort presence tracking; never surface errors to visitors */
      });
    };
    send();
    const interval = setInterval(send, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") send();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authReady, isStaff]);
  return null;
}

function StaffLiveBubble() {
  const { authReady, isStaff } = useAuth();
  const [location] = useLocation();
  if (!authReady || !isStaff) return null;
  if (location.startsWith("/admin") || location === "/login") return null;
  return <LiveVisitorsBubble />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

// Global swipe handler — mounted once in App, never re-mounts on navigation.
// Dispatches a custom event that Navbar listens for, so the drawer opens
// from any page without depending on Navbar's own mount cycle.
function SwipeMenuHandler() {
  useEffect(() => {
    // Zone: 16–140 px from the right edge.
    // < 16 px = browser's back-gesture territory (leave it alone).
    // > 140 px = too far inside; likely a normal scroll.
    const NEAR = 16;
    const FAR = 140;
    const THRESHOLD = 48; // minimum leftward drag (px) to open
    const MAX_DY = 55;    // max vertical drift before we cancel

    let startX = 0, startY = 0, tracking = false;

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    // Abort if the touch started inside a horizontally-scrollable container
    // (prevents fighting with carousels / property image sliders).
    const insideHScroll = (el: EventTarget | null): boolean => {
      let node = el as Element | null;
      while (node && node !== document.body) {
        const st = window.getComputedStyle(node);
        if (
          (st.overflowX === "auto" || st.overflowX === "scroll") &&
          node.scrollWidth > node.clientWidth + 2
        ) return true;
        node = node.parentElement;
      }
      return false;
    };

    const onStart = (e: TouchEvent) => {
      if (!isMobile() || e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0];
      const dist = window.innerWidth - t.clientX;
      if (dist < NEAR || dist > FAR) { tracking = false; return; }
      if (insideHScroll(e.target)) { tracking = false; return; }
      startX = t.clientX; startY = t.clientY; tracking = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = startX - t.clientX; // positive = moving left (toward menu)
      const dy = Math.abs(t.clientY - startY);
      if (dy > MAX_DY) { tracking = false; return; }
      if (dx > THRESHOLD) {
        tracking = false;
        window.dispatchEvent(new CustomEvent("open-side-menu"));
      }
    };

    const onEnd = () => { tracking = false; };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/add-property" component={AddProperty} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/finishing-services" component={FinishingServices} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/compare" component={Compare} />
      <Route path="/login" component={Login} />
      <Route path="/region/:regionId" component={RegionPage} />

      <Route path="/admin">{() => <Protected component={Dashboard} />}</Route>
      <Route path="/admin/properties">{() => <Protected component={Properties} />}</Route>
      <Route path="/admin/mortgage-calculator">{() => <Protected component={MortgageCalculatorPage} />}</Route>
      <Route path="/admin/properties/new">{() => <Protected component={PropertyForm} />}</Route>
      <Route path="/admin/properties/:id/edit">{() => <Protected component={PropertyForm} />}</Route>
      <Route path="/admin/regions">{() => <Protected component={Regions} />}</Route>
      <Route path="/admin/property-types">{() => <Protected component={PropertyTypes} />}</Route>
      <Route path="/admin/users">{() => <Protected component={Users} />}</Route>
      <Route path="/admin/roles">{() => <Protected component={Roles} />}</Route>
      <Route path="/admin/settings">{() => <Protected component={Settings} />}</Route>
      <Route path="/admin/analytics">{() => <Protected component={Analytics} />}</Route>
      <Route path="/admin/activity-logs">{() => <Protected component={ActivityLogs} />}</Route>
       <Route path="/admin/import-export">{() => <Protected component={ImportExport} adminOnly />}</Route>
      <Route path="/admin/inquiries">{() => <Protected component={Inquiries} />}</Route>
      <Route path="/admin/requests">{() => <Protected component={CustomerRequests} />}</Route>
      <Route path="/admin/contracts">{() => <Protected component={Contracts} />}</Route>
      <Route path="/admin/property-requests">{() => <Protected component={PropertyRequests} />}</Route>
      <Route path="/admin/finishing-requests">{() => <Protected component={FinishingRequests} />}</Route>
      <Route path="/admin/ai-leads">{() => <Protected component={AiLeads} />}</Route>
       <Route path="/admin/backup">{() => <Protected component={Backup} adminOnly />}</Route>
      <Route path="/admin/ads">{() => <Protected component={AdsAdmin} />}</Route>
      <Route path="/admin/ads/:id/analytics">{() => <Protected component={AdAnalytics} />}</Route>
      <Route path="/admin/smart-banners">{() => <Protected component={SmartBanners} />}</Route>
      <Route path="/admin/sources">{() => <Protected component={Sources} />}</Route>
      <Route path="/admin/agents">{() => <Protected component={AiAgents} adminOnly />}</Route>
      <Route path="/admin/whatsapp">{() => <Protected component={WhatsAppBot} adminOnly />}</Route>
      <Route path="/admin/finishing-gallery">{() => <Protected component={FinishingGallery} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppReadyGate({ children }: { children: React.ReactNode }) {
  const { ready } = useData();
  const [location] = useLocation();
  const isLoginRoute = location.endsWith("/login");
  if (!ready && !isLoginRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-accent" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z" fillOpacity="0.3"/>
              <path d="M50 20 L72 33 L72 67 L50 80 L28 67 L28 33 Z"/>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium" dir="rtl">العمودي للتسويق العقاري</p>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ── ThemeEnforcer: يطبّق وضع الإضاءة المحدد من لوحة التحكم ──────────────────
function ThemeEnforcer() {
  const { settings } = useData();
  const { setTheme } = useTheme();
  useEffect(() => {
    const mode = settings.themeMode ?? "user";
    if (mode === "light" || mode === "dark") setTheme(mode);
  }, [settings.themeMode, setTheme]);
  return null;
}

// بينج الـ API كل 4 دقايق علشان الـ server ميدخلش في نوم
function KeepAlive() {
  useEffect(() => {
    const ping = () => { void fetch("/api/healthz", { method: "GET" }).catch(() => {}); };
    ping(); // أول بينج فوري لما الـ app يفتح
    const id = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return null;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <DataProvider>
        <AuthProvider>
          <UserPrefsProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <AIChatProvider>
                  <ThemeEnforcer />
                  <KeepAlive />
                  <VisitorTracker />
                  {/* SwipeMenuHandler disabled — keep component, skip render */}
                  {/* <SwipeMenuHandler /> */}
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <AppReadyGate>
                      <ErrorBoundary>
                        <ScrollToTop />
                        <Router />
                      </ErrorBoundary>
                    </AppReadyGate>
                    <ScrollToTopButton />
                    <StaffLiveBubble />
                    <InstallPwaPrompt />
                    {AI_ASSISTANT_ENABLED && (
                      <Suspense fallback={null}>
                        <AIChatWidget />
                      </Suspense>
                    )}
                  </WouterRouter>
                  <Toaster />
                </AIChatProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </UserPrefsProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

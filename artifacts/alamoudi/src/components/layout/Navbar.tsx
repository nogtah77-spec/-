import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Button } from "../ui/button";
import { Menu, MapPin, Sparkles } from "lucide-react";
import { WhatsAppIcon, TikTokIcon } from "../icons/BrandIcons";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useAIChat } from "@/context/AIChatContext";
import { AI_ASSISTANT_ENABLED } from "@/config/features";
import { getTiktokUrl } from "@/lib/socials";

export function Navbar() {
  const [location] = useLocation();
  const { settings } = useData();
  const { isStaff } = useAuth();
  const { openChat } = useAIChat();
  const tiktokHref = getTiktokUrl(settings);

  const [menuOpen, setMenuOpen] = useState(false);
  const closeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Trigger zone: from NEAR to FAR pixels from right edge.
    // NEAR=28 leaves the browser's back-gesture claim (~20px) untouched.
    // FAR=80 gives a comfortable 52px-wide band for intentional swipes.
    const NEAR = 28;
    const FAR = 80;
    const THRESHOLD = 60; // min horizontal drag (px) to open
    const MAX_DY = 40;    // max vertical drift allowed (keeps horizontal-scroll safe)
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    // Walk up the DOM to detect if element is inside a horizontally-scrollable container.
    // This prevents triggering the drawer while the user swipes a carousel.
    const insideHScroll = (el: EventTarget | null): boolean => {
      let node = el as Element | null;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if (
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
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
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = startX - t.clientX;   // positive = swiping left (toward menu)
      const dy = Math.abs(t.clientY - startY);
      if (dy > MAX_DY) { tracking = false; return; } // too much vertical → not our swipe
      if (dx > THRESHOLD) {
        tracking = false;
        setMenuOpen(true);
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

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/finishing-services", label: "خدمات التشطيبات" },
    { href: "/about", label: "من نحن" },
    { href: "/favorites", label: "المفضلة" },
    { href: "/compare", label: "المقارنة" },
  ];

  const whatsappHref = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/[\s+]/g, "")}`
    : null;
  const mapsHref = settings.mapsUrl || null;

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      {/* Desktop — 3 columns */}
      <div className="container h-16 hidden md:grid grid-cols-3 items-center px-6">
        {/* Brand — far right (RTL start) */}
        <div className="flex justify-start items-center">
          <Link href="/" data-testid="link-brand">
            <span className="text-2xl font-bold text-accent tracking-tight leading-none">
              العمودي
            </span>
            <span className="text-sm font-light text-muted-foreground mr-2 tracking-wide">
              شريكك نحو الاستثمار الأفضل
            </span>
          </Link>
        </div>

        {/* Nav — center */}
        <nav className="flex justify-center items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent whitespace-nowrap",
                location === link.href ? "text-accent" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {AI_ASSISTANT_ENABLED && (
            <button
              onClick={openChat}
              className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-80 transition-opacity whitespace-nowrap"
              data-testid="button-ai-consultant"
            >
              <Sparkles className="h-4 w-4" />
              المستشار الذكي AI
            </button>
          )}
        </nav>

        {/* Actions — far left (RTL end) */}
        <div className="flex justify-end items-center gap-2">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              title="واتساب"
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
              data-testid="link-whatsapp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          )}
          <a
            href={tiktokHref}
            target="_blank"
            rel="noopener noreferrer"
            title="تيك توك"
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="link-tiktok"
          >
            <TikTokIcon className="h-4 w-4" />
          </a>
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              title="موقعنا"
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              data-testid="link-maps"
            >
              <MapPin className="h-4 w-4" />
            </a>
          )}
          <div className="w-px h-4 bg-border mx-1" />
          <ThemeToggle />
          {isStaff ? (
            <Button
              asChild
              size="sm"
              className="bg-accent text-white hover:bg-accent/90 rounded-md px-4 text-sm font-medium"
              data-testid="button-nav-dashboard"
            >
              <Link href="/admin">لوحة التحكم</Link>
            </Button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors px-1"
              data-testid="link-login"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="container h-14 flex md:hidden items-center justify-between px-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-background"
            onTouchStart={(e) => {
              closeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchMove={(e) => {
              if (!closeStart.current) return;
              const dx = e.touches[0].clientX - closeStart.current.x;
              const dy = Math.abs(e.touches[0].clientY - closeStart.current.y);
              if (dx > 60 && dy < 45) {
                closeStart.current = null;
                setMenuOpen(false);
              }
            }}
            onTouchEnd={() => {
              closeStart.current = null;
            }}
          >
            <div className="mb-6 pt-2">
              <span className="text-2xl font-bold text-accent">العمودي</span>
              <span className="text-sm font-light text-muted-foreground mr-2">شريكك نحو الاستثمار الأفضل</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-2.5 px-3 rounded-md text-base font-medium transition-colors",
                    location === link.href
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:text-accent hover:bg-accent/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {AI_ASSISTANT_ENABLED && (
                <SheetClose asChild>
                  <button
                    onClick={openChat}
                    className="py-2.5 px-3 rounded-md text-base font-semibold text-accent hover:bg-accent/10 transition-colors flex items-center gap-2 text-right"
                    data-testid="button-ai-consultant-mobile"
                  >
                    <Sparkles className="h-4 w-4" />
                    المستشار الذكي AI
                  </button>
                </SheetClose>
              )}
              <div className="my-2 border-t border-border" />
              <Link href="/add-property" className="py-2.5 px-3 rounded-md text-base font-medium text-accent hover:bg-accent/10 transition-colors">
                أضف عقارك
              </Link>
              {isStaff ? (
                <Link href="/admin" className="py-2.5 px-3 rounded-md text-base font-bold text-foreground hover:text-accent hover:bg-accent/5 transition-colors">
                  لوحة التحكم
                </Link>
              ) : (
                <Link href="/login" className="py-2.5 px-3 rounded-md text-base font-medium text-foreground hover:text-accent hover:bg-accent/5 transition-colors">
                  تسجيل الدخول
                </Link>
              )}
              {(whatsappHref || mapsHref) && <div className="my-2 border-t border-border" />}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-md text-base font-medium text-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors flex items-center gap-2">
                  <WhatsAppIcon className="h-4 w-4" />
                  واتساب
                </a>
              )}
              <a href={tiktokHref} target="_blank" rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-md text-base font-medium text-foreground hover:text-accent hover:bg-accent/5 transition-colors flex items-center gap-2">
                <TikTokIcon className="h-4 w-4" />
                تيك توك
              </a>
              {mapsHref && (
                <a href={mapsHref} target="_blank" rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-md text-base font-medium text-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  موقعنا
                </a>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="text-lg font-bold text-accent">العمودي</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}

import { Link, useLocation } from "wouter";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/favorites", label: "المفضلة" },
    { href: "/compare", label: "المقارنة" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      {/* Desktop layout — 3 equal columns */}
      <div className="container h-16 hidden md:grid grid-cols-3 items-center px-6">
        {/* Col 1 — Brand (far right in RTL) */}
        <div className="flex justify-start">
          <Link href="/" data-testid="link-brand">
            <span className="text-lg font-bold text-primary dark:text-foreground tracking-tight leading-none">
              العمودي
            </span>
            <span className="text-xs font-light text-muted-foreground mr-1.5 tracking-wide">
              للتسويق العقاري
            </span>
          </Link>
        </div>

        {/* Col 2 — Navigation (center) */}
        <nav className="flex justify-center items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                location === link.href ? "text-accent" : "text-muted-foreground"
              )}
              data-testid={`nav-link-${link.href.replace("/", "") || "home"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Col 3 — Actions (far left in RTL) */}
        <div className="flex justify-end items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
            data-testid="link-login"
          >
            تسجيل الدخول
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-accent text-white hover:bg-accent/90 rounded-md px-4 text-sm font-medium"
            data-testid="button-nav-dashboard"
          >
            <Link href="/admin">لوحة التحكم</Link>
          </Button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="container h-14 flex md:hidden items-center justify-between px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-background">
            <div className="mb-8 pt-2">
              <span className="text-xl font-bold text-primary dark:text-foreground">العمودي</span>
              <span className="text-sm font-light text-muted-foreground mr-1.5">للتسويق العقاري</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-3 px-3 rounded-md text-base font-medium transition-colors",
                    location === link.href
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:text-accent hover:bg-accent/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-border" />
              <Link href="/login" className="py-3 px-3 rounded-md text-base font-medium text-foreground hover:text-accent hover:bg-accent/5 transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/admin" className="py-3 px-3 rounded-md text-base font-bold text-accent hover:bg-accent/10 transition-colors">
                لوحة التحكم
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="text-base font-bold text-primary dark:text-foreground">العمودي</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}

import { Link } from "wouter";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export function Navbar() {
  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/favorites", label: "المفضلة" },
    { href: "/compare", label: "المقارنة" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="العمودي للتسويق العقاري" className="h-14 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-accent">
              تسجيل الدخول
            </Link>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-nav-cta">
              <Link href="/admin">لوحة التحكم</Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" className="text-lg font-medium text-foreground hover:text-accent">
                  تسجيل الدخول
                </Link>
                <Link href="/admin" className="text-lg font-medium text-accent">
                  لوحة التحكم
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

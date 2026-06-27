import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12 md:py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/">
              <div className="mb-3">
                <span className="text-2xl font-bold text-primary dark:text-foreground tracking-tight">
                  العمودي
                </span>
                <span className="text-base font-light text-muted-foreground mr-2">
                  للتسويق العقاري
                </span>
              </div>
            </Link>
            <div className="w-12 h-0.5 bg-accent mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-widest">
              روابط سريعة
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-accent transition-colors">المفضلة</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-accent transition-colors">المقارنة</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-widest">
              تواصل معنا
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>القاهرة، مصر</li>
              <li>
                <a href="mailto:info@alamoudi.com" className="hover:text-accent transition-colors">
                  info@alamoudi.com
                </a>
              </li>
              <li dir="ltr" className="text-right">
                <a href="tel:+201000000000" className="hover:text-accent transition-colors">
                  +20 10 0000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} العمودي للتسويق العقاري. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-accent transition-colors">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

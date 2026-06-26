export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-bold text-2xl text-primary dark:text-foreground mb-4">العمودي للتسويق العقاري</h3>
            <p className="text-muted-foreground max-w-sm">
              شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في المملكة العربية السعودية والخليج.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-accent transition-colors">الرئيسية</a></li>
              <li><a href="/favorites" className="hover:text-accent transition-colors">المفضلة</a></li>
              <li><a href="/compare" className="hover:text-accent transition-colors">المقارنة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>الرياض، المملكة العربية السعودية</li>
              <li>info@alamoudi.com</li>
              <li>+966 50 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} العمودي للتسويق العقاري. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

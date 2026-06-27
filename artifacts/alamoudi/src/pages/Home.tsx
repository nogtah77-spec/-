import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home as HomeIcon, Wallet, ShieldCheck, Gem, UserCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Section 1 — Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          {/* Abstract geometric background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3F4E4F] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#A27B5B] rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-[#2C3639] rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          </div>
          
          <div className="absolute inset-0 bg-[#2C3639]/40 z-10" />
          
          <div className="container relative z-20 text-center px-4 pt-20 pb-10">
            <h1 className="text-4xl md:text-7xl font-bold text-[#DCD7C9] mb-6 max-w-5xl mx-auto leading-tight drop-shadow-lg">
              اكتشف الفخامة في كل تفاصيل <br />
              <span style={{ color: "#C49A72" }}>منزلك القادم</span>
            </h1>
            <p className="text-lg md:text-2xl text-[#DCD7C9]/90 mb-16 max-w-3xl mx-auto font-light">
              نقدم أفضل الفرص العقارية والاستثمارية في القاهرة الجديدة.
            </p>
            
            {/* Search Bar - Integrated in Hero */}
            <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-3 max-w-5xl mx-auto shadow-2xl flex flex-col md:flex-row gap-3 border border-[#C49A72]/20">
              <div className="flex-1 relative flex items-center">
                <HomeIcon className="absolute right-4 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-4 pr-12 bg-transparent h-14 text-base focus:ring-0">
                    <SelectValue placeholder="نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">شقة</SelectItem>
                    <SelectItem value="duplex">دوبلكس</SelectItem>
                    <SelectItem value="villa">فيلا</SelectItem>
                    <SelectItem value="twinhouse">توين هاوس</SelectItem>
                    <SelectItem value="townhouse">تاون هاوس</SelectItem>
                    <SelectItem value="shop">محل</SelectItem>
                    <SelectItem value="clinic">عيادة</SelectItem>
                    <SelectItem value="office">مكتب إداري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50 self-center" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute right-4 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-4 pr-12 bg-transparent h-14 text-base focus:ring-0">
                    <SelectValue placeholder="المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tagamoa">التجمع الخامس</SelectItem>
                    <SelectItem value="beit_elwatan">بيت الوطن</SelectItem>
                    <SelectItem value="shorouk">الشروق</SelectItem>
                    <SelectItem value="madinaty">مدينتي</SelectItem>
                    <SelectItem value="new_capital">العاصمة الإدارية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50 self-center" />
              <div className="flex-1 relative flex items-center">
                <Wallet className="absolute right-4 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-4 pr-12 bg-transparent h-14 text-base focus:ring-0">
                    <SelectValue placeholder="نطاق السعر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1M - 5M ج.م</SelectItem>
                    <SelectItem value="5-10">5M - 10M ج.م</SelectItem>
                    <SelectItem value="10-20">10M - 20M ج.م</SelectItem>
                    <SelectItem value="20+">+20M ج.م</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-lg" style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)", color: "#fff" }}>
                <Search className="ml-2 h-5 w-5" />
                بحث
              </Button>
            </div>
          </div>
        </section>

        {/* Section 2 — Advanced Search / Categories */}
        <section className="py-12 bg-background border-b">
          <div className="container px-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {['البيع', 'الإيجار', 'شقق مفروشة', 'إداري', 'طبي', 'تجاري'].map((cat, i) => (
                <Button key={i} variant={i === 0 ? "default" : "outline"} className={`rounded-full px-8 py-6 text-md font-medium ${i === 0 ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-primary/5 hover:text-primary'}`}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 — Featured Properties */}
        <section className="py-24 bg-[#F5F2EC] dark:bg-background">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 inline-block relative">
                عقارات مميزة
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-accent rounded-full"></div>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCard key={i} isLoading={true} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 4 — Latest Properties */}
        <section className="py-24 bg-background">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">أحدث العقارات</h2>
                <p className="text-muted-foreground text-lg">تصفح أحدث ما أضيف لمجموعتنا العقارية</p>
              </div>
              <Button variant="outline" className="hidden md:flex text-primary border-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8">
                عرض الكل
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <PropertyCard key={i} isLoading={true} />
              ))}
            </div>
            
            <div className="mt-10 text-center md:hidden">
              <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground rounded-full">
                عرض الكل
              </Button>
            </div>
          </div>
        </section>

        {/* Section 5 — Why Choose Us */}
        <section className="py-24 bg-[#F5F2EC] dark:bg-muted/10">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">لماذا نحن؟</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                نلتزم بتقديم تجربة استثنائية ترتكز على الجودة والاحترافية.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="card-luxury bg-background border-none text-center p-6">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                    <Gem className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">عقارات حصرية</h3>
                  <p className="text-muted-foreground">نوفر وصولاً لأرقى العقارات والفرص الاستثمارية غير المتاحة في السوق العام.</p>
                </CardContent>
              </Card>
              
              <Card className="card-luxury bg-background border-none text-center p-6">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">خبرة موثوقة</h3>
                  <p className="text-muted-foreground">فريق من المستشارين ذوي المعرفة العميقة بالسوق العقاري المصري.</p>
                </CardContent>
              </Card>
              
              <Card className="card-luxury bg-background border-none text-center p-6">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">خدمة متكاملة</h3>
                  <p className="text-muted-foreground">نرافقك من البحث والمقارنة حتى إنهاء كافة الإجراءات القانونية ونقل الملكية.</p>
                </CardContent>
              </Card>
              
              <Card className="card-luxury bg-background border-none text-center p-6">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">شفافية تامة</h3>
                  <p className="text-muted-foreground">وضوح كامل في التسعير والمواصفات لضمان قرار استثماري سليم وآمن.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 6 — Contact CTA */}
        <section className="py-24 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#C49A72 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          <div className="container relative z-10 px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#DCD7C9] mb-6">تواصل معنا</h2>
            <p className="text-xl text-[#DCD7C9]/80 mb-10 max-w-2xl mx-auto font-light">
              مستشارونا العقاريون جاهزون لتقديم الاستشارة المجانية ومساعدتك في اختيار ما يناسبك.
            </p>
            <Button size="lg" className="text-lg h-16 px-12 rounded-full font-bold shadow-xl hover:scale-105 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)", color: "#fff" }}>
              تواصل معنا الآن
            </Button>
          </div>
        </section>
      </main>

      {/* Section 7 — Footer */}
      <Footer />
    </div>
  );
}

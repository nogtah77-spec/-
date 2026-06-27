import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home as HomeIcon, Wallet, ShieldCheck, Gem, UserCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/context/DataContext";

export default function Home() {
  const { properties, regions, propertyTypes } = useData();
  const [searchCategory, setSearchCategory] = useState<"sale" | "rent" | "furnished">("sale");
  const [searchSector, setSearchSector] = useState<"residential" | "administrative" | "medical" | "commercial">("residential");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const featured = properties.slice(0, 6);
  const latest = [...properties].reverse().slice(0, 3);

  const resolvePropertyProps = (p: any) => ({
    ...p,
    typeName: propertyTypes.find(t => t.id === p.typeId)?.name,
    regionName: regions.find(r => r.id === p.regionId)?.name,
  });

  return (
    <div className="min-h-screen flex flex-col dir-rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Section 1 — Hero */}
        <section className="relative min-h-[520px] flex flex-col items-center justify-center overflow-hidden pb-10" style={{ background: "var(--gradient-hero)" }}>
          {/* Abstract geometric background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3F4E4F] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#A27B5B] rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-[#2C3639] rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          </div>
          
          <div className="absolute inset-0 bg-[#2C3639]/40 z-10" />
          
          <div className="container relative z-20 text-center px-4 pt-16">
            <h1 className="text-3xl md:text-5xl font-bold text-[#DCD7C9] mb-6 max-w-5xl mx-auto leading-tight drop-shadow-lg">
              اكتشف الفخامة في كل تفاصيل <br />
              <span style={{ color: "#C49A72" }}>منزلك القادم</span>
            </h1>
            <p className="text-lg md:text-2xl text-[#DCD7C9]/90 max-w-3xl mx-auto font-light">
              نقدم أفضل الفرص العقارية والاستثمارية في القاهرة الجديدة
            </p>
          </div>
        </section>

        {/* New Search Widget */}
        <div className="container px-4">
          <div className="-mt-10 relative z-20 bg-card rounded-xl shadow-luxury p-6 max-w-4xl mx-auto border border-border">
            <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
              {[
                { value: "sale", label: "للبيع" },
                { value: "rent", label: "للإيجار" },
                { value: "furnished", label: "شقق مفروشة" },
              ].map(btn => (
                <button
                  key={btn.value}
                  onClick={() => setSearchCategory(btn.value as typeof searchCategory)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    searchCategory === btn.value
                      ? "bg-accent text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >{btn.label}</button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
              {[
                { value: "residential", label: "سكني" },
                { value: "administrative", label: "إداري" },
                { value: "medical", label: "طبي" },
                { value: "commercial", label: "تجاري" },
              ].map(btn => (
                <button
                  key={btn.value}
                  onClick={() => setSearchSector(btn.value as typeof searchSector)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                    searchSector === btn.value
                      ? "border-accent text-accent bg-accent/10"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >{btn.label}</button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-[180px] h-10 text-sm">
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  {regions.filter(r => r.active).map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[180px] h-10 text-sm">
                  <SelectValue placeholder="نوع العقار" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.filter(t => t.active).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button className="w-full md:w-auto h-10 px-6 bg-accent text-white hover:bg-accent/90 text-sm" data-testid="button-search">
                <Search className="ml-2 h-4 w-4" />
                بحث
              </Button>
            </div>
          </div>
        </div>

        {/* Section 3 — Featured Properties */}
        <section className="py-24 bg-[#F5F2EC] dark:bg-background mt-12">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 inline-block relative">
                عقارات مميزة
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-accent rounded-full"></div>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.length === 0 
                ? [1, 2, 3, 4, 5, 6].map((i) => <PropertyCard key={i} isLoading={true} />)
                : featured.map((p) => <PropertyCard key={p.id} property={resolvePropertyProps(p)} />)}
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
              {latest.length === 0 
                ? [1, 2, 3].map((i) => <PropertyCard key={i} isLoading={true} />)
                : latest.map((p) => <PropertyCard key={p.id} property={resolvePropertyProps(p)} />)}
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

      <Footer />
    </div>
  );
}

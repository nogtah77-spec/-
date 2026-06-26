import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home as HomeIcon, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center bg-secondary">
          <div className="absolute inset-0 bg-primary/80 z-10" />
          <div className="container relative z-20 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-background mb-6 max-w-4xl mx-auto leading-tight">
              اكتشف الفخامة في كل تفاصيل <span className="text-accent">منزلك القادم</span>
            </h1>
            <p className="text-lg md:text-xl text-background/80 mb-10 max-w-2xl mx-auto">
              مجموعتنا الحصرية من العقارات الفاخرة مصممة لتلبي تطلعاتك وترتقي بأسلوب حياتك.
            </p>
            
            {/* Search Bar */}
            <div className="bg-background rounded-lg p-2 max-w-4xl mx-auto shadow-xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative flex items-center">
                <HomeIcon className="absolute right-3 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-3 pr-10 bg-transparent h-12 focus:ring-0">
                    <SelectValue placeholder="نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa">فيلا</SelectItem>
                    <SelectItem value="apartment">شقة</SelectItem>
                    <SelectItem value="palace">قصر</SelectItem>
                    <SelectItem value="land">أرض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block w-px h-8 bg-border self-center" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute right-3 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-3 pr-10 bg-transparent h-12 focus:ring-0">
                    <SelectValue placeholder="المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">الرياض</SelectItem>
                    <SelectItem value="jeddah">جدة</SelectItem>
                    <SelectItem value="dammam">الدمام</SelectItem>
                    <SelectItem value="khobar">الخبر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block w-px h-8 bg-border self-center" />
              <div className="flex-1 relative flex items-center">
                <Wallet className="absolute right-3 h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-full border-none shadow-none pl-3 pr-10 bg-transparent h-12 focus:ring-0">
                    <SelectValue placeholder="نطاق السعر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1M - 3M ر.س</SelectItem>
                    <SelectItem value="3-5">3M - 5M ر.س</SelectItem>
                    <SelectItem value="5-10">5M - 10M ر.س</SelectItem>
                    <SelectItem value="10+">+10M ر.س</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8" data-testid="button-search-hero">
                <Search className="ml-2 h-5 w-5" />
                بحث
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">عقارات مميزة</h2>
                <p className="text-muted-foreground">تصفح أحدث العقارات الفاخرة المضافة لمجموعتنا</p>
              </div>
              <Button variant="outline" className="hidden md:flex text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                عرض الكل
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCard key={i} isLoading={true} />
              ))}
            </div>
            
            <div className="mt-10 text-center md:hidden">
              <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                عرض الكل
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-y border-primary-foreground/20 py-12">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">+1000</div>
                <div className="text-primary-foreground/80">عقار مباع</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">+500</div>
                <div className="text-primary-foreground/80">عميل سعيد</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">15</div>
                <div className="text-primary-foreground/80">سنوات خبرة</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">12</div>
                <div className="text-primary-foreground/80">جائزة تميز</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-card text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#A27B5B 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          <div className="container relative z-10 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">هل تبحث عن عقارك المثالي؟</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              فريقنا من الخبراء مستعد لمساعدتك في العثور على العقار الذي يطابق تطلعاتك ويلبي جميع احتياجاتك.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-10">
              تواصل معنا الآن
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

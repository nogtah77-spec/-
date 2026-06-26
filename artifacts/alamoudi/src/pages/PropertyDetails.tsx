import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Bed, Bath, Square, MapPin, Share2, Heart, Scale, User } from "lucide-react";
import { useParams } from "wouter";

export default function PropertyDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col dir-rtl bg-background">
      <Navbar />
      
      <main className="flex-1 pb-20">
        {/* Header Section */}
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex gap-2 mb-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">فيلا</span>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">للبيع</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">فيلا فاخرة بتصميم عصري وإطلالة بانورامية</h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 ml-1" />
                <span>الرياض، حي حطين</span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold text-accent mb-4">3,500,000 <span className="text-lg font-normal text-muted-foreground">ر.س</span></div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="hover:text-accent">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="hover:text-accent">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="hover:text-accent">
                  <Scale className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Gallery Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[500px]">
            <div className="md:col-span-2 bg-muted rounded-xl border border-dashed flex items-center justify-center h-full">
              <span className="text-muted-foreground">صورة العقار الرئيسية</span>
            </div>
            <div className="flex flex-col gap-4 h-full">
              <div className="flex-1 bg-muted rounded-xl border border-dashed flex items-center justify-center">
                <span className="text-muted-foreground">صورة إضافية</span>
              </div>
              <div className="flex-1 bg-muted rounded-xl border border-dashed flex items-center justify-center relative">
                <span className="text-muted-foreground">صورة إضافية</span>
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl cursor-pointer hover:bg-background/40 transition-colors">
                  <span className="font-bold text-foreground">+5 صور إضافية</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Features Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center">
                      <Bed className="h-6 w-6 text-accent mb-2" />
                      <span className="text-xl font-bold">5</span>
                      <span className="text-sm text-muted-foreground">غرف نوم</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath className="h-6 w-6 text-accent mb-2" />
                      <span className="text-xl font-bold">6</span>
                      <span className="text-sm text-muted-foreground">حمامات</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Square className="h-6 w-6 text-accent mb-2" />
                      <span className="text-xl font-bold">450</span>
                      <span className="text-sm text-muted-foreground">متر مربع</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MapPin className="h-6 w-6 text-accent mb-2" />
                      <span className="text-xl font-bold">حطين</span>
                      <span className="text-sm text-muted-foreground">المنطقة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">وصف العقار</h2>
                <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
                  <p>
                    فيلا فاخرة بتصميم عصري حديث في أرقى أحياء الرياض. تتميز الفيلا بمساحات واسعة وتوزيع ذكي للغرف يوفر أقصى درجات الخصوصية والراحة للعائلة.
                  </p>
                  <p>
                    تحتوي الفيلا على مسبح خاص وحديقة منسقة، بالإضافة إلى موقف يتسع لثلاث سيارات. التشطيبات من أعلى مستويات الجودة مع استخدام الرخام الطبيعي والأخشاب الفاخرة.
                  </p>
                </div>
              </div>

              {/* Map */}
              <div>
                <h2 className="text-2xl font-bold mb-4">الموقع على الخريطة</h2>
                <div className="bg-muted rounded-xl h-[300px] border border-dashed flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <span>خريطة الموقع</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Contact Form */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>تواصل مع الوكيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-bold">أحمد محمد</div>
                      <div className="text-sm text-muted-foreground">مستشار عقاري</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input placeholder="الاسم الكامل" />
                    <Input placeholder="رقم الهاتف" dir="ltr" className="text-right" />
                    <Input placeholder="البريد الإلكتروني" type="email" dir="ltr" className="text-right" />
                    <Textarea placeholder="رسالتك..." className="min-h-[100px]" defaultValue={`أنا مهتم بالعقار رقم ${id}. أرجو التواصل معي.`} />
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      إرسال الطلب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-6">عقارات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <PropertyCard key={i} isLoading={true} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

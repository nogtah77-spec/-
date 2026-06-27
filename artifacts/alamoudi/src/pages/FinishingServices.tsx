import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, Gem, Shield, Clock } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";

const finishingTypes = ["سوبر لوكس", "لوكس", "كلاسيك", "مودرن", "بسيط", "متكامل مع الأثاث"];

const services = [
  { icon: <Gem className="h-5 w-5" />, title: "تشطيب سوبر لوكس", desc: "أعلى مستوى من التشطيبات باستخدام أفضل المواد والخامات العالمية." },
  { icon: <Shield className="h-5 w-5" />, title: "تشطيب لوكس", desc: "تشطيبات عالية الجودة بأسعار معقولة مع ضمان على جميع أعمال التشطيب." },
  { icon: <Wrench className="h-5 w-5" />, title: "تشطيب نصف", desc: "تشطيب جزئي مع ترك مساحة للتخصيص وفق ذوق العميل." },
  { icon: <Clock className="h-5 w-5" />, title: "تسليم سريع", desc: "تنفيذ في أقل من 3 أشهر مع ضمان الجودة والمتابعة المستمرة." },
];

export default function FinishingServices() {
  const { addFinishingRequest, settings } = useData();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "", area: "", finishingType: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.finishingType) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" }); return;
    }
    addFinishingRequest(form);
    setSubmitted(true);
    toast({ title: "تم إرسال طلبك", description: "سنتواصل معك قريباً لمناقشة تفاصيل التشطيب." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F2EC] dark:bg-background">
        {/* Hero */}
        <div className="bg-card border-b border-border py-12 md:py-16">
          <div className="container px-6 text-center">
            <p className="text-accent text-xs font-medium tracking-widest mb-3 uppercase">خدماتنا</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">خدمات التشطيبات</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              نقدم خدمات تشطيب متكاملة لجميع أنواع الوحدات السكنية والإدارية بأعلى مستوى من الجودة وأفضل الأسعار.
            </p>
          </div>
        </div>

        {/* Services grid */}
        <section className="py-12">
          <div className="container px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {services.map((s, i) => (
                <Card key={i} className="card-luxury border-none bg-card text-center">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">{s.icon}</div>
                    <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After placeholder */}
        <section className="py-8 bg-background">
          <div className="container px-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">أعمالنا السابقة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-muted rounded-xl border border-dashed border-border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Wrench className="h-6 w-6 mx-auto mb-1 opacity-30" />
                    <p className="text-xs opacity-50">صورة {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request form */}
        <section className="py-12">
          <div className="container px-6 max-w-2xl mx-auto">
            {submitted ? (
              <Card className="card-luxury border-none text-center py-16">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح</h2>
                  <p className="text-sm text-muted-foreground">سيتواصل معك فريقنا خلال 24 ساعة.</p>
                  <Button className="mt-6 bg-accent text-white hover:bg-accent/90 rounded-full px-8"
                    onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", location: "", area: "", finishingType: "", description: "" }); }}>
                    إرسال طلب آخر
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-luxury border-none bg-card">
                <CardHeader><CardTitle>اطلب خدمة تشطيب</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الاسم *</Label>
                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" />
                      </div>
                      <div className="space-y-2">
                        <Label>الهاتف *</Label>
                        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+20 10 0000 0000" dir="ltr" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الموقع</Label>
                        <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="المنطقة / الكمباوند" />
                      </div>
                      <div className="space-y-2">
                        <Label>المساحة (م²)</Label>
                        <Input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="مثال: 120" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>نوع التشطيب *</Label>
                      <Select value={form.finishingType} onValueChange={v => setForm({ ...form, finishingType: v })}>
                        <SelectTrigger><SelectValue placeholder="اختر نوع التشطيب" /></SelectTrigger>
                        <SelectContent>{finishingTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>وصف إضافي</Label>
                      <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="أي تفاصيل إضافية أو متطلبات خاصة..." className="min-h-[100px]" />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-accent text-white hover:bg-accent/90 font-bold rounded-lg">
                      إرسال الطلب
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

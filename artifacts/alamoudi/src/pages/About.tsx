import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Gem, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  const values = [
    { icon: <Gem className="h-6 w-6" />, title: "الجودة والحصرية", desc: "نوفر وصولاً لأرقى العقارات والفرص الاستثمارية غير المتاحة في السوق العام." },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "الثقة والموثوقية", desc: "فريق من المستشارين ذوي المعرفة العميقة بالسوق العقاري المصري والسعودي." },
    { icon: <UserCheck className="h-6 w-6" />, title: "الخدمة المتكاملة", desc: "نرافق العميل من البحث والمقارنة حتى إتمام كافة الإجراءات القانونية ونقل الملكية." },
    { icon: <CheckCircle2 className="h-6 w-6" />, title: "الشفافية الكاملة", desc: "وضوح كامل في التسعير والمواصفات لضمان قرار استثماري سليم وآمن." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#DCD7C9 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="container px-6 relative z-10 text-center">
            <p className="text-accent text-sm font-medium tracking-widest mb-4 uppercase">تعرّف علينا</p>
            <h1 className="text-3xl md:text-5xl font-bold text-[#DCD7C9] mb-6 leading-tight">من نحن</h1>
            <p className="text-sm md:text-base text-[#DCD7C9]/80 max-w-2xl mx-auto font-light leading-relaxed">
              العمودي للتسويق العقاري — شريكك الموثوق في عالم العقارات الفاخرة
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">قصتنا</h2>
                <div className="w-12 h-0.5 bg-accent mx-auto" />
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed text-center space-y-5">
                <p className="text-base md:text-lg leading-8">
                  العمودي للتسويق العقاري شركة متخصصة في التسويق والاستثمار العقاري، تأسست عام 2018، وتمتلك خبرة واسعة في سوق العقارات المصري والسعودي.
                </p>
                <p className="text-base md:text-lg leading-8">
                  نسعى لتقديم أفضل الفرص العقارية والاستثمارية لعملائنا من خلال خدمات احترافية وحلول مبتكرة تلبي مختلف الاحتياجات السكنية والاستثمارية.
                </p>
                <p className="text-base md:text-lg leading-8">
                  يقودنا فريق من أمهر المستشارين العقاريين الذين يتمتعون بخبرات عميقة في السوق وشبكة علاقات واسعة تُمكّننا من تقديم فرص حصرية لعملائنا.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">قيمنا</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                نلتزم بمجموعة من القيم الراسخة التي توجه كل خطوة نخطوها.
              </p>
              <div className="w-12 h-0.5 bg-accent mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4 p-6 bg-card rounded-2xl border border-border/50 card-luxury">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#C49A72 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="container px-6 relative z-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#DCD7C9] mb-4">هل أنت مهتم بالاستثمار العقاري؟</h2>
            <p className="text-sm text-[#DCD7C9]/75 mb-8 max-w-lg mx-auto">
              تواصل معنا اليوم واطرح استفسارك وسيرد عليك أحد خبرائنا العقاريين.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-8 rounded-full font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #A27B5B, #C49A72)" }}>
                <Link href="/add-property">أضف عقارك</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full font-bold text-sm border-[#DCD7C9]/40 text-[#DCD7C9] hover:bg-white/10">
                <Link href="/">تصفح العقارات</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

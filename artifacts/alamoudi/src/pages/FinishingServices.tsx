import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, CheckCircle2, Play, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getVideoThumbnailUrl, hasVideo } from "@/lib/videoThumbnail";
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal";
import { Link } from "wouter";

const finishingTypes = ["سوبر لوكس", "لوكس", "كلاسيك", "مودرن", "بسيط", "متكامل مع الأثاث"];

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

interface GalleryImage { id: string; url: string; title: string }
interface GalleryVideo { id: string; url: string; title: string }
interface GalleryConfig { interval: number; images: GalleryImage[]; videos: GalleryVideo[] }

// ─── Image Slideshow ──────────────────────────────────────────────────────────

function ImageSlideshow({ images, interval }: { images: GalleryImage[]; interval: number }) {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPages = Math.max(1, Math.ceil(images.length / 4));

  useEffect(() => {
    if (images.length <= 4) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPage(p => (p + 1) % totalPages);
        setVisible(true);
      }, 550);
    }, interval * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, interval, totalPages]);

  const startIdx = page * 4;
  const slots: (GalleryImage | null)[] = images.length > 0
    ? Array.from({ length: 4 }, (_, i) =>
        images.length > 0 ? images[(startIdx + i) % images.length] : null
      )
    : [null, null, null, null];

  const [lightbox, setLightbox] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-square bg-muted rounded-xl border border-dashed border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Wrench className="h-6 w-6 mx-auto mb-1 opacity-30" />
              <p className="text-xs opacity-50">قريباً</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1)" }}
      >
        {slots.map((img, i) =>
          img ? (
            <div
              key={`${img.id}-${i}`}
              onClick={() => setLightbox(img.url)}
              className="group aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-zoom-in"
            >
              <img
                src={img.url}
                alt={img.title || "صورة تشطيب"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div key={i} className="aspect-square rounded-xl border border-dashed border-border bg-muted/40" />
          )
        )}
      </div>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setPage(i); setVisible(true); }, 300); }}
              className={`rounded-full transition-all duration-300 ${
                i === page
                  ? "w-5 h-2 bg-accent"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="صورة"
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Video Grid ───────────────────────────────────────────────────────────────

function VideoGrid({ videos }: { videos: GalleryVideo[] }) {
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<GalleryVideo | null>(null);

  if (videos.length === 0) return null;

  const displayVideos = videos.slice(0, 8); // show max 8

  return (
    <>
      <section className="py-8 bg-muted/30">
        <div className="container px-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">فيديوهات أعمالنا</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayVideos.map(vid => {
              const thumb = !thumbErrors[vid.id] ? getVideoThumbnailUrl(vid.url) : null;
              return (
                <div
                  key={vid.id}
                  onClick={() => setActive(vid)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={vid.title || "فيديو"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => setThumbErrors(p => ({ ...p, [vid.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white/85 group-hover:bg-white group-hover:scale-110 flex items-center justify-center shadow-lg transition-all duration-200">
                      <Play className="h-5 w-5 text-accent fill-accent translate-x-px" />
                    </span>
                  </div>
                  {vid.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-2.5 pt-6 pb-2 translate-y-full group-hover:translate-y-0 transition-transform duration-250">
                      <p className="text-white text-xs font-medium line-clamp-2">{vid.title}</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
                      <Play className="h-2.5 w-2.5 fill-white" />فيديو
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {active && (
        <VideoPlayerModal
          open={!!active}
          videoUrl={active.url}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinishingServices() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "", area: "", finishingType: "", description: "" });

  const [gallery, setGallery] = useState<GalleryConfig>({ interval: 4, images: [], videos: [] });
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    api.get<GalleryConfig>("/finishing-gallery")
      .then(data => setGallery(data))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: "يجب الموافقة على سياسة الخصوصية وشروط الاستخدام", variant: "destructive" });
      return;
    }
    if (!form.name || !form.phone || !form.finishingType) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/finishing-requests", {
        ...form, id: genId(), status: "new", createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      toast({ title: "تم إرسال طلبك", description: "سنتواصل معك قريباً لمناقشة تفاصيل التشطيب." });
    } catch {
      toast({ title: "خطأ في الإرسال", description: "فشل إرسال الطلب، يرجى المحاولة مرة أخرى", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F3EE] dark:bg-background">

        {/* Hero */}
        <div className="bg-card border-b border-border py-12 md:py-16">
          <div className="container px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">خدمات التشطيبات</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              نقدم خدمات تشطيب متكاملة لجميع أنواع الوحدات السكنية والإدارية بأعلى مستوى من الجودة وأفضل الأسعار.
            </p>
          </div>
        </div>

        {/* Photo Gallery */}
        <section className="py-8 bg-background">
          <div className="container px-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">أعمالنا السابقة</h2>
            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <ImageSlideshow images={gallery.images} interval={gallery.interval} />
            )}
          </div>
        </section>

        {/* Video Gallery */}
        {!galleryLoading && gallery.videos.length > 0 && (
          <VideoGrid videos={gallery.videos} />
        )}

        {/* Request Form */}
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
                  <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8"
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
                    {/* Terms agreement */}
                    <div className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${agreed ? "border-accent/30 bg-accent/5" : "border-border bg-card/50"}`}>
                      <Checkbox
                        id="finishing-terms-agree"
                        checked={agreed}
                        onCheckedChange={v => setAgreed(!!v)}
                        className="mt-0.5 shrink-0"
                      />
                      <label htmlFor="finishing-terms-agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer select-none">
                        أقر بأنني قرأت ووافقت على{" "}
                        <Link href="/privacy" className="text-accent font-medium underline underline-offset-2 hover:text-accent/80" onClick={e => e.stopPropagation()}>
                          سياسة الخصوصية
                        </Link>
                        {" "}و{" "}
                        <Link href="/privacy" className="text-accent font-medium underline underline-offset-2 hover:text-accent/80" onClick={e => e.stopPropagation()}>
                          شروط الاستخدام
                        </Link>
                        {" "}الخاصة بمنصة العمودي للتسويق العقاري.
                      </label>
                    </div>

                    <Button type="submit" disabled={loading || !agreed} className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-lg disabled:opacity-50">
                      {loading ? "جاري الإرسال..." : "إرسال الطلب"}
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

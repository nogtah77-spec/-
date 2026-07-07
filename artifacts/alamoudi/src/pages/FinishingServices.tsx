import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, Play, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getVideoThumbnailUrl, hasVideo } from "@/lib/videoThumbnail";
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal";

const finishingTypes = ["سوبر لوكس", "لوكس", "كلاسيك", "مودرن", "بسيط", "متكامل مع الأثاث"];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  displayOrder: number;
  active: boolean;
}

export default function FinishingServices() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "", area: "", finishingType: "", description: "" });

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});
  const [videoModal, setVideoModal] = useState<{ url: string; title?: string } | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title?: string } | null>(null);

  useEffect(() => {
    api.get<GalleryItem[]>("/finishing-gallery")
      .then(data => setGallery(data))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.finishingType) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/finishing-requests", {
        ...form,
        id: genId(),
        status: "new",
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      toast({ title: "تم إرسال طلبك", description: "سنتواصل معك قريباً لمناقشة تفاصيل التشطيب." });
    } catch {
      toast({
        title: "خطأ في الإرسال",
        description: "فشل إرسال الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: GalleryItem) => {
    if (item.videoUrl && hasVideo(item.videoUrl)) {
      setVideoModal({ url: item.videoUrl, title: item.title || undefined });
    } else if (item.imageUrl) {
      setLightboxImg({ src: item.imageUrl, title: item.title || undefined });
    }
  };

  const renderGallery = () => {
    if (galleryLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      );
    }

    if (gallery.length === 0) {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map(item => {
          const isVideo = item.videoUrl && hasVideo(item.videoUrl);
          const thumb = isVideo && !thumbErrors[item.id]
            ? getVideoThumbnailUrl(item.videoUrl)
            : null;
          const coverSrc = item.imageUrl || thumb;
          const clickable = !!(item.videoUrl || item.imageUrl);

          return (
            <div
              key={item.id}
              onClick={() => clickable && handleItemClick(item)}
              className={`group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted ${clickable ? "cursor-pointer" : ""}`}
            >
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt={item.title || "عمل تشطيب"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setThumbErrors(p => ({ ...p, [item.id]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-11 h-11 rounded-full bg-black/50 group-hover:bg-black/70 flex items-center justify-center transition-colors shadow-lg">
                    <Play className="h-5 w-5 text-white fill-white translate-x-px" />
                  </span>
                </div>
              )}

              {item.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-6 pb-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                  {item.description && <p className="text-white/70 text-[10px] mt-0.5 line-clamp-1">{item.description}</p>}
                </div>
              )}

              {isVideo && (
                <div className="absolute top-2 right-2">
                  <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
                    <Play className="h-2.5 w-2.5 fill-white" />فيديو
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F2EC] dark:bg-background">
        <div className="bg-card border-b border-border py-12 md:py-16">
          <div className="container px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">خدمات التشطيبات</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              نقدم خدمات تشطيب متكاملة لجميع أنواع الوحدات السكنية والإدارية بأعلى مستوى من الجودة وأفضل الأسعار.
            </p>
          </div>
        </div>

        <section className="py-8 bg-background">
          <div className="container px-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">أعمالنا السابقة</h2>
            {renderGallery()}
          </div>
        </section>

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
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-accent text-white hover:bg-accent/90 font-bold rounded-lg">
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

      {videoModal && (
        <VideoPlayerModal
          open={!!videoModal}
          videoUrl={videoModal.url}
          onClose={() => setVideoModal(null)}
        />
      )}

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImg.src}
            alt={lightboxImg.title || "صورة"}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightboxImg.title && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {lightboxImg.title}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyGallery } from "@/components/ui/PropertyGallery";
import {
  Bed, Bath, Square, MapPin, Share2, Heart, Scale, Phone, Play,
  Copy, Video, ExternalLink, ChevronRight, ChevronLeft, X, Building2, Layers, Pencil,
  Mail, Link as LinkIcon, FileText
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { normalizePhoneForWa } from "@/lib/phone";
import { getVideoThumbnailUrl, hasVideo } from "@/lib/videoThumbnail";
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { formatNumber } from "@/lib/utils";
import { useUserPrefs } from "@/context/UserPrefsContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { downloadImage, downloadImagesAsZip } from "@/lib/imageDownloads";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import { PropertyBrochureModal } from "@/components/property/PropertyBrochureModal";
import { PropertyShareModal } from "@/components/property/PropertyShareModal";
import { updatePageMeta } from "@/lib/meta";


const categoryLabels: Record<string, string> = {
  residential: "سكني",
  administrative: "إداري",
  medical: "طبي",
  commercial: "تجاري",
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
};

const listingTypeLabels: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
};

const finishingLabels: Record<string, string> = {
  "super-lux": "سوبر لوكس", "lux": "لوكس", "semi-finished": "نص تشطيب",
  "ultra": "ألترا سوبر لوكس", "finished": "متشطب", "red-brick": "طوب أحمر",
  "under-construction": "تحت الإنشاء", "core-shell": "تحت الإنشاء",
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { properties, propertyTypes, regions, settings, trackPropertyView, fetching, users } = useData();
  const { isStaff, currentUser } = useAuth();
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare } = useUserPrefs();
  const { toast } = useToast();

  const property = properties.find(p => p.id === id);
  const images = property?.images?.length ? property.images : [];

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [detailThumbFailed, setDetailThumbFailed] = useState(false);
  const [downloadAllPending, setDownloadAllPending] = useState(false);
  const lbTouch = useRef<{ x: number; y: number } | null>(null);

  const lbPrev = useCallback(() => setLightboxIdx(i => i === null ? null : (i - 1 + images.length) % images.length), [images.length]);
  const lbNext = useCallback(() => setLightboxIdx(i => i === null ? null : (i + 1) % images.length), [images.length]);

  const lbTouchStart = (e: React.TouchEvent) => {
    lbTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const lbTouchEnd = (e: React.TouchEvent) => {
    if (!lbTouch.current) return;
    const dx = e.changedTouches[0].clientX - lbTouch.current.x;
    const dy = e.changedTouches[0].clientY - lbTouch.current.y;
    lbTouch.current = null;
    if (Math.abs(dx) > Math.abs(dy) + 10 && Math.abs(dx) >= 48) {
      if (dx > 0) lbPrev(); else lbNext();
    }
  };

  useEffect(() => { setDetailThumbFailed(false); }, [id]);

  useEffect(() => {
    if (id) trackPropertyView(id);
    if (property) {
      updatePageMeta({
        title: `${property.title} (${property.code})`,
        description: property.description || `${property.title} - السعر: ${formatNumber(property.price)} ج.م`,
        image: property.images?.[0],
      });
    }
  }, [id, property, trackPropertyView]);

  if (!property) {
    if (fetching) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center bg-background">
            <div className="w-9 h-9 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </main>
          <Footer />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">العقار غير موجود</h1>
            <p className="text-muted-foreground mb-6">لم يتم العثور على هذا العقار.</p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeName = propertyTypes.find(t => t.id === property.typeId)?.name;
  const regionName = regions.find(r => r.id === property.regionId)?.name;
  const similar = properties.filter(p => p.id !== property.id && (p.regionId === property.regionId || p.typeId === property.typeId)).slice(0, 6);

  const waNum = normalizePhoneForWa(settings.whatsapp || settings.phone1 || "");
  const waMsg = encodeURIComponent(`السلام عليكم، أرغب بالاستفسار عن العقار رقم (${property.code}).`);
  const waHref = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: property.title, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ رابط العقار" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(property.code);
    toast({ title: "تم نسخ الكود", description: property.code });
  };

  const canDownloadImages = currentUser?.role === "admin"
    || (isStaff
      ? settings.allowStaffImageDownloads
      : settings.allowCustomerImageDownloads);

  const handleDownloadImage = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;
    await downloadImage(imageUrl, `${property.code}-image-${index + 1}`);
    toast({ title: "تم بدء تحميل الصورة" });
  };

  const handleDownloadAllImages = async () => {
    if (downloadAllPending || images.length < 2) return;
    setDownloadAllPending(true);
    try {
      const result = await downloadImagesAsZip(images, `${property.code}-images`);
      if (result.downloaded === 0) {
        toast({
          title: "تعذر تحميل الصور",
          description: "لم يسمح مصدر الصور بالتحميل من المتصفح.",
          variant: "destructive",
        });
      } else if (result.failed > 0) {
        toast({
          title: "تم تحميل بعض الصور",
          description: `تمت إضافة ${result.downloaded} صورة، وتعذر الوصول إلى ${result.failed} صورة خارجية.`,
        });
      } else {
        toast({ title: "تم تجهيز ملف صور العقار" });
      }
    } finally {
      setDownloadAllPending(false);
    }
  };

  const propHasVideo = hasVideo(property.videoUrl);
  const detailVideoThumb = images.length === 0 ? getVideoThumbnailUrl(property.videoUrl) : null;
  const showDetailVideoCover = images.length === 0 && !!detailVideoThumb && !detailThumbFailed;
  const showDetailVideoPoster = images.length === 0 && propHasVideo && (!detailVideoThumb || detailThumbFailed);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Lightbox */}
      {lightboxIdx !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center select-none touch-none"
          onTouchStart={lbTouchStart}
          onTouchEnd={lbTouchEnd}
        >
          {/* X على اليسار — بعيد عن الهامبرجر اليميني */}
          <button
            className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
            onClick={() => setLightboxIdx(null)}
            aria-label="إغلاق"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* العداد */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums pointer-events-none">
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* الصورة — pointer-events-none يمنع click-through */}
          <img
            src={images[lightboxIdx]}
            alt=""
            draggable={false}
            className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl pointer-events-none"
          />

          {/* أسهم بـ onClick بسيط — تشتغل لأنه مفيش setPointerCapture */}
          {images.length > 1 && (
            <div className="absolute bottom-5 flex items-center gap-4">
              <button
                onClick={lbPrev}
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="السابق"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
              <div className="flex gap-1.5 pointer-events-none">
                {images.length <= 10 && images.map((_, i) => (
                  <span key={i} className={cn("block rounded-full transition-all", i === lightboxIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40")} />
                ))}
              </div>
              <button
                onClick={lbNext}
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="التالي"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      <main className="flex-1 pb-16">
        {/* Breadcrumb */}
        <div className="container px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
            <ChevronLeft className="h-3 w-3" />
            <span className="text-foreground font-medium line-clamp-1">{property.code}</span>
          </div>
        </div>

        <div className="container px-3 sm:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {typeName && <Badge className="bg-primary/10 text-primary">{typeName}</Badge>}
                <Badge className="bg-accent/10 text-accent">{categoryLabels[property.category]}</Badge>
                {property.featured && <Badge className="bg-yellow-100 text-yellow-700">مميز</Badge>}
                {property.status === "reserved" && <Badge className="bg-amber-100 text-amber-700">محجوز</Badge>}
              </div>
              <div className="mb-2">
                <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-widest text-accent">{property.code}</h1>
              </div>
              {regionName && (
                <div className="flex items-center text-muted-foreground text-sm gap-1">
                  <MapPin className="h-4 w-4" />{regionName}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="text-3xl font-bold text-accent">{formatNumber(property.price)} <span className="text-base font-normal text-foreground/70">EGP</span></div>
              <div className="flex flex-wrap items-center gap-2">
                {isStaff && (
                  <Button
                    onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5 rounded-xl font-bold"
                    title="تعديل هذا العقار">
                    <Pencil className="h-4 w-4" />تعديل العقار
                  </Button>
                )}
                <PropertyBrochureModal
                  property={property}
                  region={regions.find(r => r.id === property.regionId)}
                  propertyType={propertyTypes.find(t => t.id === property.typeId)}
                  categoryLabel={categoryLabels[property.category] || property.category}
                  finishingLabel={finishingLabels[property.finishing] || property.finishing}
                  companyName={settings.companyName}
                  phone={settings.phone1}
                  whatsapp={settings.whatsapp}
                  email={settings.email}
                />
                <PropertyShareModal
                  property={property}
                  regionName={regionName}
                  typeName={typeName}
                />
                <Button variant="outline" size="icon"
                  className={cn("rounded-xl border-border/80", isFavorite(property.id) ? "text-red-500 border-red-200" : "")}
                  onClick={() => { toggleFavorite(property.id); toast({ title: isFavorite(property.id) ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة" }); }}
                  title="المفضلة">
                  <Heart className={cn("h-4 w-4", isFavorite(property.id) ? "fill-red-500" : "")} />
                </Button>
                <Button variant="outline" size="icon"
                  className={cn("rounded-xl border-border/80", isInCompare(property.id) ? "text-accent border-accent/30" : "")}
                  onClick={() => { toggleCompare(property.id); toast({ title: isInCompare(property.id) ? "تمت الإزالة من المقارنة" : "تمت الإضافة للمقارنة" }); }}
                  title="مقارنة">
                  <Scale className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Specs chips — mobile only, shown above gallery */}
          <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
            {property.beds > 0 && (
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm">
                <Bed className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="font-semibold">{property.beds}</span>
                <span className="text-muted-foreground text-xs">غرف</span>
              </div>
            )}
            {property.baths > 0 && (
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm">
                <Bath className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="font-semibold">{property.baths}</span>
                <span className="text-muted-foreground text-xs">حمام</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm">
              <Square className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="font-semibold">{property.area}</span>
              <span className="text-muted-foreground text-xs">م²</span>
            </div>
            {property.floor !== undefined && property.floor !== null && property.floor !== "" && (
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm">
                <Layers className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="font-semibold">{property.floor === 0 || property.floor === "0" ? "أرضي" : property.floor}</span>
                {typeof property.floor === "number" && property.floor > 0 && <span className="text-muted-foreground text-xs">دور</span>}
              </div>
            )}
            {property.finishing && (
              <div className="flex items-center gap-1.5 bg-accent/8 border border-accent/20 rounded-xl px-3 py-2 text-sm">
                <span className="text-accent text-xs font-medium">{finishingLabels[property.finishing] || property.finishing}</span>
              </div>
            )}
            {property.videoUrl && (
              <button
                onClick={() => setVideoModalOpen(true)}
                className="flex items-center gap-1.5 bg-accent text-accent-foreground rounded-xl px-3 py-2 text-sm hover:bg-accent/90 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-white flex-shrink-0" />
                <span className="text-xs font-medium">فيديو العقار</span>
              </button>
            )}
          </div>

          {/* Gallery */}
          {images.length > 0 ? (
            <PropertyGallery
              images={images}
              title={property.title}
              onClickImage={(i) => setLightboxIdx(i)}
              allowDownload={canDownloadImages}
              downloadAllPending={downloadAllPending}
              onDownloadImage={handleDownloadImage}
              onDownloadAll={handleDownloadAllImages}
              className="mb-10"
            />
          ) : showDetailVideoCover || showDetailVideoPoster ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setVideoModalOpen(true)}
              onKeyDown={e => e.key === "Enter" && setVideoModalOpen(true)}
              className="group relative block h-[300px] sm:h-[380px] rounded-lg overflow-hidden mb-10 bg-muted cursor-pointer"
              data-testid="link-video-cover"
            >
              {showDetailVideoCover ? (
                <>
                  <img src={detailVideoThumb!} aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50" />
                  <img
                    src={detailVideoThumb!}
                    alt={property.title}
                    onError={() => setDetailThumbFailed(true)}
                    className="relative w-full h-full object-contain"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/25 via-muted to-muted/40 flex items-center justify-center">
                  <Video className="h-16 w-16 text-accent/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3">
                <span className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="h-9 w-9 text-accent fill-accent translate-x-0.5" />
                </span>
                <span className="text-white font-semibold text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md">مشاهدة فيديو العقار</span>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-10 border border-dashed border-border">
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد صور لهذا العقار</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
            <div className="lg:col-span-2 space-y-5">

              {/* Compact specs row — desktop only (mobile version is above gallery) */}
              <div className="hidden lg:flex flex-wrap gap-2">
                {property.beds > 0 && (
                  <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 py-2 text-sm">
                    <Bed className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="font-semibold">{property.beds}</span>
                    <span className="text-muted-foreground text-xs">غرف</span>
                  </div>
                )}
                {property.baths > 0 && (
                  <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 py-2 text-sm">
                    <Bath className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="font-semibold">{property.baths}</span>
                    <span className="text-muted-foreground text-xs">حمام</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 py-2 text-sm">
                  <Square className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="font-semibold">{property.area}</span>
                  <span className="text-muted-foreground text-xs">م²</span>
                </div>
                {property.floor !== undefined && property.floor !== null && property.floor !== "" && (
                  <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 py-2 text-sm">
                    <Layers className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="font-semibold">{property.floor === 0 || property.floor === "0" ? "أرضي" : property.floor}</span>
                    {typeof property.floor === "number" && property.floor > 0 && <span className="text-muted-foreground text-xs">دور</span>}
                  </div>
                )}
                {property.finishing && (
                  <div className="flex items-center gap-1.5 bg-accent/8 border border-accent/20 rounded-md px-3 py-2 text-sm">
                    <span className="text-accent text-xs font-medium">{finishingLabels[property.finishing] || property.finishing}</span>
                  </div>
                )}
                {property.videoUrl && (
                  <button
                    onClick={() => setVideoModalOpen(true)}
                    data-testid="link-watch-video"
                    className="flex items-center gap-1.5 bg-accent text-accent-foreground rounded-md px-3 py-2 text-sm hover:bg-accent/90 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-white flex-shrink-0" />
                    <span className="text-xs font-medium">فيديو العقار</span>
                  </button>
                )}
              </div>

              {/* Description — before full details */}
              {property.description && (
                <Card className="card-luxury">
                  <CardHeader className="pb-3"><CardTitle className="text-base">وصف العقار</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line break-words [overflow-wrap:anywhere]">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Full specs table */}
              <Card className="card-luxury">
                <CardHeader className="pb-3"><CardTitle className="text-base">تفاصيل العقار</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    {[
                      { label: "كود العقار", value: property.code, copy: true },
                      { label: "نوع العقار", value: typeName || property.unitType || null },
                      { label: "فئة العقار", value: categoryLabels[property.category] || property.category },
                      { label: "نوع العرض", value: listingTypeLabels[property.listingType || ""] || categoryLabels[property.category] || "للبيع" },
                      { label: "المنطقة", value: regionName || null },
                      { label: "المنطقة الفرعية", value: property.subArea || null },
                      { label: "المساحة", value: property.area ? `${property.area} م²` : null },
                      { label: "غرف النوم", value: property.beds || null },
                      { label: "الحمامات", value: property.baths || null },
                      {
                        label: "الدور",
                        value: property.floor !== null && property.floor !== undefined && property.floor !== ""
                          ? (typeof property.floor === "number"
                              ? (property.floor > 0 ? `الدور ${property.floor}` : "أرضي")
                              : (property.floor === "0" ? "أرضي" : property.floor))
                          : null
                      },
                      { label: "عدد طوابق العقار", value: property.floors || null },
                      { label: "الواجهة", value: property.unitType || null },
                      { label: "الفيو", value: property.view || null },
                      { label: "ماستر", value: property.master || null },
                      { label: "الدريسنج", value: property.floorText || null },
                      { label: "أسانسير", value: property.elevator || null },
                      { label: "موقف سيارة", value: property.parking || null },
                      { label: "المميزات الإضافية", value: property.additionalFeatures || null },
                      { label: "التشطيب", value: property.finishing ? (finishingLabels[property.finishing] || property.finishing) : null },
                      { label: "الموقع", value: property.location || null },
                    ].filter(r => r.value != null && r.value !== "").map((row, i) => (
                      <div key={i} className="flex justify-between items-start gap-3 py-2.5 border-b border-border last:border-0">
                        <span className="text-sm text-muted-foreground flex-shrink-0">{row.label}</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          {row.copy
                            ? <span className="text-sm font-mono font-semibold text-accent tracking-wide">{String(row.value)}</span>
                            : <span className="text-sm font-medium text-start break-words [overflow-wrap:anywhere]">{String(row.value)}</span>
                          }
                          {row.copy && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-accent/60 hover:text-accent" onClick={handleCopy}><Copy className="h-3 w-3" /></Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Source info — admin only */}
              {isStaff && (
                Boolean(
                  property.sourcePhones?.some(ph => ph.trim()) ||
                  property.sourceEmail?.trim() ||
                  property.sourceLocation?.trim() ||
                  property.sourceNotes?.trim() ||
                  property.source?.trim()
                ) && (
                  <Card className="card-luxury border-amber-300/40 bg-amber-50/30 dark:bg-amber-950/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-300">
                        <FileText className="h-4 w-4" />
                        بيانات المصدر
                        <span className="text-[10px] font-normal bg-amber-200/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">للمدير فقط</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground w-24 flex-shrink-0">نوع المصدر</span>
                        <span className="font-semibold text-accent">{property.agentType === "broker" ? "بروكر / وسيط" : "مباشر"}</span>
                      </div>
                      {property.assignedStaffId && property.assignedStaffId !== "none" && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24 flex-shrink-0">الموظف المسؤول</span>
                          <span className="font-medium">
                            {users.find(u => u.id === property.assignedStaffId)?.name || property.assignedStaffId}
                          </span>
                        </div>
                      )}
                      {property.source?.trim() && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24 flex-shrink-0">اسم المالك</span>
                          <span className="font-medium">{property.source}</span>
                        </div>
                      )}
                      {(property.sourcePhones ?? []).filter(ph => ph.trim()).map((ph, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-20 flex-shrink-0">{i === 0 ? "رقم التواصل" : " "}</span>
                          <a href={`tel:${ph.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors" dir="ltr">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />{ph}
                          </a>
                        </div>
                      ))}
                      {property.sourceEmail?.trim() && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-20 flex-shrink-0">البريد</span>
                          <a href={`mailto:${property.sourceEmail}`} className="flex items-center gap-1.5 text-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors" dir="ltr">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0 text-violet-600 dark:text-violet-400" />{property.sourceEmail}
                          </a>
                        </div>
                      )}
                      {property.sourceLocation?.trim() && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-20 flex-shrink-0">الموقع</span>
                          <a href={property.sourceLocation} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-accent hover:underline">
                            <LinkIcon className="h-3.5 w-3.5 flex-shrink-0" />افتح الرابط
                          </a>
                        </div>
                      )}
                      {property.sourceNotes?.trim() && (
                        <div className="flex gap-2 text-sm">
                          <span className="text-muted-foreground w-20 flex-shrink-0">ملاحظات</span>
                          <p className="text-sm leading-relaxed whitespace-pre-line">{property.sourceNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              )}

              {/* Mortgage & Installment Calculator */}
              {property.price > 0 && (
                <div className="pt-2">
                  <MortgageCalculator
                    price={property.price}
                    propertyTitle={property.title}
                    propertyCode={property.code}
                    whatsappNumber={settings.whatsapp || settings.phone1}
                  />
                </div>
              )}

              {/* Map */}
              {property.mapsUrl && (
                <div>
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><MapPin className="h-5 w-5 text-accent" />الموقع على الخريطة</h2>
                  <button
                    onClick={() => window.open(property.mapsUrl!, "_blank", "noopener,noreferrer")}
                    className="w-full flex items-center gap-2 p-4 bg-muted rounded-xl hover:bg-muted/70 transition-colors text-sm text-right"
                  >
                    <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-muted-foreground flex-1">افتح الموقع على خرائط جوجل</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="card-luxury sticky top-24">
                <CardHeader className="pb-3"><CardTitle className="text-base">تواصل بشأن العقار</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">كود العقار</p>
                    <p className="font-bold text-accent text-lg tracking-wider">{property.code}</p>
                  </div>

                  {waHref && (
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 rounded-lg">
                        <WhatsAppIcon className="h-4 w-4" />
                        تواصل عبر واتساب
                      </Button>
                    </a>
                  )}
                  {settings.phone1 && (
                    <a href={`tel:${settings.phone1.replace(/\s/g, "")}`}>
                      <Button variant="outline" className="w-full gap-2 rounded-lg mt-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                        <Phone className="h-4 w-4" />
                        {settings.phone1}
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" className="w-full gap-2 rounded-lg" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    نسخ كود العقار
                  </Button>
                  <Button variant="outline" className="w-full gap-2 rounded-lg" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    مشاركة العقار
                  </Button>

                  {property.externalUrl && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-lg text-accent border-accent/30 hover:bg-accent/10 mt-2"
                      onClick={() => window.open(property.externalUrl!, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      رابط العقار الخارجي
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">عقارات مشابهة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {similar.map(p => (
                  <PropertyCard key={p.id} size="compact" property={{ ...p, typeName: propertyTypes.find(t => t.id === p.typeId)?.name, regionName: regions.find(r => r.id === p.regionId)?.name }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {property.videoUrl && (
        <VideoPlayerModal
          open={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={property.videoUrl}
        />
      )}
    </div>
  );
}

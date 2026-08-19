import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Printer, MapPin, Bed, Bath, Square, Building2, Phone, Mail, Share2, Layers, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Property, Region, PropertyType } from "@/context/DataContext";
import { formatNumber } from "@/lib/utils";

interface PropertyBrochureModalProps {
  property: Property;
  region?: Region;
  propertyType?: PropertyType;
  categoryLabel: string;
  finishingLabel: string;
  companyName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export function PropertyBrochureModal({
  property,
  region,
  propertyType,
  categoryLabel,
  finishingLabel,
  companyName = "العمودي للتسويق العقاري",
  phone = "+20 10 0000 0000",
  whatsapp = "+20 10 0000 0000",
  email = "info@alamoudi.com",
}: PropertyBrochureModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const images = property.images && property.images.length > 0 ? property.images.slice(0, 4) : [];
  const propertyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-accent/40 bg-accent/5 text-accent hover:bg-accent/15 hover:text-accent font-semibold"
        >
          <FileDown className="h-4 w-4" />
          <span>بروشور العقار PDF</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 text-right">
          <div>
            <DialogTitle className="text-lg font-bold text-foreground">
              معاينة بروشور العقار
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              يمكنك حفظ البروشور كملف PDF عالي الجودة أو طباعته مباشرة
            </p>
          </div>
          <Button
            onClick={handlePrint}
            className="gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-md"
          >
            <Printer className="h-4 w-4" />
            طباعة / حفظ كـ PDF
          </Button>
        </DialogHeader>

        {/* Printable Brochure Container */}
        <div
          ref={printRef}
          id="printable-brochure"
          className="luxury-brochure-sheet mt-4 rounded-2xl border border-border/80 bg-background p-6 sm:p-8 shadow-sm text-foreground space-y-6"
        >
          {/* 1. Luxury Header */}
          <div className="flex items-center justify-between border-b-2 border-accent/40 pb-5">
            <div>
              <h2 className="text-2xl font-black tracking-wide text-foreground">
                {companyName}
              </h2>
              <p className="text-xs font-medium text-accent tracking-wider mt-1">
                LUXURY REAL ESTATE & INVESTMENT
              </p>
            </div>
            <div className="text-left" dir="ltr">
              <div className="inline-block rounded-xl border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                REF: {property.code}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          {/* 2. Main Title & Price Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent font-bold">
                  {categoryLabel}
                </Badge>
                {propertyType && (
                  <Badge variant="secondary" className="font-semibold">
                    {propertyType.name}
                  </Badge>
                )}
                {region && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {region.name}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
                {property.title}
              </h1>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3.5 text-left" dir="ltr">
              <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-bold">السعر المطلوب</span>
              <span className="text-2xl font-black text-accent">
                {formatNumber(property.price)} <span className="text-xs font-bold text-muted-foreground">EGP</span>
              </span>
            </div>
          </div>

          {/* 3. Photo Showcase Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 overflow-hidden rounded-xl border border-border/60 aspect-[16/10] bg-muted">
                <img
                  src={images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="grid grid-rows-2 gap-3">
                {images.slice(1, 3).map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border/60 aspect-[16/10] bg-muted">
                    <img
                      src={img}
                      alt={`${property.title} - ${i + 2}`}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Specifications Matrix */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              المواصفات والبيانات الأساسية
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-card/60 border border-border/40">
                <Square className="h-4 w-4 text-accent" />
                <div>
                  <span className="block text-[10px] text-muted-foreground">المساحة</span>
                  <span className="font-bold">{property.area} م²</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-card/60 border border-border/40">
                <Bed className="h-4 w-4 text-accent" />
                <div>
                  <span className="block text-[10px] text-muted-foreground">الغرف</span>
                  <span className="font-bold">{property.beds} غرف</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-card/60 border border-border/40">
                <Bath className="h-4 w-4 text-accent" />
                <div>
                  <span className="block text-[10px] text-muted-foreground">الحمامات</span>
                  <span className="font-bold">{property.baths} حمامات</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-card/60 border border-border/40">
                <Building2 className="h-4 w-4 text-accent" />
                <div>
                  <span className="block text-[10px] text-muted-foreground">التشطيب</span>
                  <span className="font-bold">{finishingLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Property Description */}
          {property.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                تفاصيل العقار
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/10 p-3.5 rounded-xl border border-border/30">
                {property.description}
              </p>
            </div>
          )}

          {/* 6. Footer Contact & QR Stamp */}
          <div className="flex items-center justify-between border-t-2 border-accent/40 pt-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-foreground block">للحجز والاستفسار المباشر:</span>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-accent" /> {phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <WhatsAppIcon className="h-3.5 w-3.5 fill-accent" /> {whatsapp}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-accent" /> {email}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-lg border border-accent/40 p-1 bg-white flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <rect x="0" y="0" width="30" height="30" fill="#10202D" />
                  <rect x="5" y="5" width="20" height="20" fill="#fff" />
                  <rect x="10" y="10" width="10" height="10" fill="#B99A68" />
                  
                  <rect x="70" y="0" width="30" height="30" fill="#10202D" />
                  <rect x="75" y="5" width="20" height="20" fill="#fff" />
                  <rect x="80" y="10" width="10" height="10" fill="#B99A68" />

                  <rect x="0" y="70" width="30" height="30" fill="#10202D" />
                  <rect x="5" y="75" width="20" height="20" fill="#fff" />
                  <rect x="10" y="80" width="10" height="10" fill="#B99A68" />

                  <rect x="40" y="20" width="10" height="20" fill="#10202D" />
                  <rect x="60" y="40" width="20" height="10" fill="#10202D" />
                  <rect x="35" y="60" width="30" height="10" fill="#B99A68" />
                </svg>
              </div>
              <span className="text-[9px] text-muted-foreground mt-0.5">امسح للرابط</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

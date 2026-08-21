import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown, Printer, Download, MapPin, Bed, Bath, Square, Building2,
  Phone, Mail, Layers, Compass, Car, Sparkles, CheckCircle2, ShieldCheck, Loader2
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Property, Region, PropertyType } from "@/context/DataContext";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

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
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = printRef.current;
      
      // Capture element using modern browser SVG foreignObject (supports OKLCH & Tailwind v4 natively)
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });

      // Dynamically resolve jsPDF constructor
      const PDFClass = (jsPDF as any).jsPDF || jsPDF;
      const pdf = new PDFClass({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10; // 10mm margins
      const targetWidth = pdfWidth - margin * 2;

      // Calculate aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const targetHeight = (img.height * targetWidth) / img.width;

      // Position vertically centered if it fits within A4
      let yOffset = margin;
      if (targetHeight < pdfHeight - margin * 2) {
        yOffset = (pdfHeight - targetHeight) / 2;
      }

      pdf.addImage(
        dataUrl,
        "JPEG",
        margin,
        yOffset,
        targetWidth,
        Math.min(targetHeight, pdfHeight - margin * 2)
      );

      const sanitizedCode = (property.code || property.title || "property").replace(/[\/\\:*?"<>|]/g, "_");
      pdf.save(`بروشور_عقار_${sanitizedCode}.pdf`);

      toast({
        title: "تم تحميل ملف الـ PDF بنجاح 📄✨",
        description: `تم حفظ البروشور باسم: بروشور_عقار_${sanitizedCode}.pdf`,
      });
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast({
        title: "تعذر توليد ملف الـ PDF",
        description: err?.message || "يرجى استخدام زر الطباعة المباشرة كبديل فوري.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const images = property.images && property.images.length > 0 ? property.images.slice(0, 4) : [];

  const getListingTypeArabic = (type?: string) => {
    if (type === "rent") return "للإيجار";
    if (type === "furnished") return "مفروش";
    return "للبيع";
  };

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

      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 text-right">
          <div>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileDown className="h-5 w-5 text-accent" />
              معاينة وتحميل بروشور العقار
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              احصل على ملف PDF عالي الجودة بتنسيق عربي سليم 100% أو اطبعه مباشرة
            </p>
          </div>

          {/* Action Buttons: Download PDF & Print */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex-1 sm:flex-initial gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-md"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ إنشاء الـ PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>تحميل ملف PDF</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={downloading}
              className="gap-2 rounded-xl border-border/80 text-foreground hover:bg-muted font-semibold"
            >
              <Printer className="h-4 w-4 text-accent" />
              <span>طباعة</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Printable & Exportable Luxury Brochure Sheet */}
        <div className="flex justify-center my-2">
          <div
            ref={printRef}
            id="printable-brochure"
            className="w-full max-w-[760px] bg-white text-[#10202D] p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5 print:p-0 print:border-none print:shadow-none font-sans"
            style={{ direction: "rtl" }}
          >
            {/* 1. Header with Golden Brand Banner */}
            <div className="flex items-center justify-between border-b-2 border-[#B99A68]/40 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#10202D] flex items-center justify-center text-[#B99A68] font-black text-sm">
                    ع
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#10202D]">
                    {companyName}
                  </h2>
                </div>
                <p className="text-[11px] font-bold text-[#B99A68] tracking-wider uppercase pr-10">
                  ALAMOUDI REAL ESTATE & INVESTMENT
                </p>
              </div>

              <div className="text-left" dir="ltr">
                <div className="inline-block rounded-xl border border-[#B99A68]/40 bg-[#B99A68]/10 px-3 py-1 text-xs font-black text-[#10202D]">
                  REF: {property.code || "ALM"}
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-1">
                  تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>

            {/* 2. Main Title & Golden Price Card */}
            <div className="flex flex-wrap items-start justify-between gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              <div className="space-y-2 max-w-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-md bg-[#10202D] px-2.5 py-0.5 text-xs font-bold text-white">
                    {categoryLabel}
                  </span>
                  <span className="inline-block rounded-md bg-[#B99A68] px-2.5 py-0.5 text-xs font-bold text-white">
                    {getListingTypeArabic(property.listingType)}
                  </span>
                  {propertyType && (
                    <span className="inline-block rounded-md bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-800">
                      {propertyType.name}
                    </span>
                  )}
                  {region && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-[#B99A68]" />
                      {region.name} {property.subArea ? `- ${property.subArea}` : ""}
                    </span>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold text-[#10202D] leading-snug">
                  {property.title}
                </h1>
              </div>

              <div className="rounded-xl border border-[#B99A68]/40 bg-white p-3 text-left shadow-sm min-w-[150px]" dir="ltr">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold text-right">
                  السعر المطلوب
                </span>
                <div className="text-right mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#10202D]">
                    {formatNumber(property.price)}
                  </span>
                  <span className="text-xs font-bold text-[#B99A68] mr-1">ج.م</span>
                </div>
              </div>
            </div>

            {/* 3. Photo Showcase Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2 overflow-hidden rounded-xl border border-gray-200 aspect-[16/10] bg-gray-100">
                  <img
                    src={images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="grid grid-rows-2 gap-2.5">
                  {images.slice(1, 3).map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-gray-200 aspect-[16/10] bg-gray-100">
                      <img
                        src={img}
                        alt={`${property.title} - ${i + 2}`}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ))}
                  {images.length === 2 && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-2 text-center text-gray-400">
                      <Building2 className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Specifications Matrix (Centered Grid) */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 text-right">
                المواصفات والبيانات الأساسية
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm text-right">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Square className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">المساحة</span>
                    <span className="font-bold text-[#10202D]">{property.area} م²</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Bed className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">الغرف</span>
                    <span className="font-bold text-[#10202D]">{property.beds} غرف</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Bath className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">الحمامات</span>
                    <span className="font-bold text-[#10202D]">{property.baths} حمام</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Layers className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">الدور</span>
                    <span className="font-bold text-[#10202D]">
                      {property.floor === 0 || property.floor === "0"
                        ? "أرضي"
                        : (property.floorText && property.floorText.trim())
                          ? property.floorText
                          : (property.floor !== undefined && property.floor !== null && property.floor !== "")
                            ? `الدور ${property.floor}`
                            : "غير محدد"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Building2 className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">التشطيب</span>
                    <span className="font-bold text-[#10202D]">{finishingLabel || property.finishing || "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Compass className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">الإطلالة / الواجهة</span>
                    <span className="font-bold text-[#10202D]">{property.view || property.unitType || "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Sparkles className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">المصعد (الأسانسير)</span>
                    <span className="font-bold text-[#10202D]">{property.elevator && property.elevator.trim() ? property.elevator : "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200">
                  <Car className="h-4 w-4 text-[#B99A68] flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500">مكان الجراج</span>
                    <span className="font-bold text-[#10202D]">{property.parking && property.parking.trim() ? property.parking : "غير محدد"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Property Description & Additional Details */}
            {property.description && (
              <div className="space-y-1.5 text-right">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  تفاصيل ومميزات العقار
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  {property.description}
                </p>
              </div>
            )}

            {/* 6. Footer Contact & QR Stamp */}
            <div className="flex items-center justify-between border-t-2 border-[#B99A68]/40 pt-4 text-xs">
              <div className="space-y-1 text-right">
                <span className="font-bold text-[#10202D] block">للحجز والاستفسار المباشر:</span>
                <div className="flex flex-wrap gap-4 text-gray-600 font-semibold">
                  <span className="flex items-center gap-1.5" dir="ltr">
                    <Phone className="h-3.5 w-3.5 text-[#B99A68]" /> {phone}
                  </span>
                  <span className="flex items-center gap-1.5" dir="ltr">
                    <WhatsAppIcon className="h-3.5 w-3.5 fill-[#B99A68]" /> {whatsapp}
                  </span>
                  <span className="flex items-center gap-1.5" dir="ltr">
                    <Mail className="h-3.5 w-3.5 text-[#B99A68]" /> {email}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center text-center">
                <div className="h-13 w-13 rounded-lg border border-[#B99A68]/40 p-1 bg-white flex items-center justify-center shadow-xs">
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
                <span className="text-[9px] text-gray-500 font-bold mt-0.5">امسح للرابط</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

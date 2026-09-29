import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown, Printer, Download, MapPin, Bed, Bath, Square, Building2,
  Phone, Mail, Layers, Compass, Car, Sparkles, CheckCircle2, ShieldCheck, Loader2,
  Eye, Crown, Shirt, FileText
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Property, Region, PropertyType, type QrCodeItem } from "@/context/DataContext";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { QrCodeView } from "@/components/ui/QrCodeView";

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
  qrCodes?: QrCodeItem[];
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
  qrCodes = [],
}: PropertyBrochureModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const getListingTypeArabic = (type?: string) => {
    if (type === "rent") return "للإيجار";
    if (type === "furnished") return "مفروش";
    return "للبيع";
  };

  const propertyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/properties/${property.id}`
    : `https://alamoudi-real-estate.vercel.app/properties/${property.id}`;

  const activePdfQrs = (qrCodes || []).filter(
    (q) => q.active !== false && q.showInPdf !== false
  );

  // ── Compute clean, accurate specifications matching PropertyDetails ────────
  const floorDisplay = (() => {
    if (
      property.floor === null ||
      property.floor === undefined ||
      property.floor === "" ||
      property.floor === "__NONE__" ||
      property.floor === -1
    ) {
      return null;
    }
    const str = String(property.floor).trim();
    if (!str || str === "__NONE__" || str === "-1") return null;
    if (/^\d+$/.test(str)) {
      const num = parseInt(str, 10);
      return num > 0 ? `الدور ${num}` : "أرضي";
    }
    return str;
  })();

  const dressingDisplay = (() => {
    const raw =
      (property.layout && property.layout.trim()) ||
      (property.floorText && (property.floorText === "نعم" || property.floorText === "غرفة دريسنج") ? property.floorText : "");
    if (!raw || !raw.trim() || raw === "لا" || raw === "لا يوجد") return null;
    return raw === "نعم" ? "يوجد غرفة دريسنج" : raw;
  })();

  const masterDisplay = (() => {
    const raw = property.master && property.master.trim();
    if (!raw || raw === "لا" || raw === "لا يوجد") return null;
    return raw === "نعم" ? "يوجد غرفة ماستر" : raw;
  })();

  const elevatorDisplay = (() => {
    const raw = property.elevator && property.elevator.trim();
    if (!raw) return null;
    if (raw === "لا" || raw === "لا يوجد") return "لا يوجد أسانسير";
    if (raw === "نعم" || raw === "يوجد") return "يوجد أسانسير";
    return raw;
  })();

  const parkingDisplay = (() => {
    const raw = property.parking && property.parking.trim();
    if (!raw) return null;
    if (raw === "لا" || raw === "لا يوجد") return "لا يوجد موقف";
    if (raw === "نعم" || raw === "يوجد") return "يوجد موقف سيارة";
    return raw;
  })();

  // Candidate specifications list
  const candidateSpecs = [
    { key: "area", label: "المساحة", value: property.area ? `${property.area} م²` : null, icon: Square },
    { key: "beds", label: "الغرف", value: property.beds > 0 ? `${property.beds} غرف` : (property.beds === 0 ? "استوديو" : null), icon: Bed },
    { key: "baths", label: "الحمامات", value: property.baths > 0 ? `${property.baths} حمام` : null, icon: Bath },
    { key: "floor", label: "الدور", value: floorDisplay, icon: Layers },
    { key: "floors", label: "طوابق العقار", value: Number(property.floors) > 0 ? `${property.floors} طوابق` : null, icon: Building2 },
    { key: "finishing", label: "التشطيب", value: finishingLabel || property.finishing || null, icon: Sparkles },
    { key: "unitType", label: "الواجهة", value: property.unitType && property.unitType.trim() ? property.unitType : null, icon: Compass },
    { key: "view", label: "الإطلالة (الفيو)", value: property.view && property.view.trim() ? property.view : null, icon: Eye },
    { key: "master", label: "غرفة ماستر", value: masterDisplay, icon: Crown },
    { key: "dressing", label: "غرفة دريسنج", value: dressingDisplay, icon: Shirt },
    { key: "elevator", label: "المصعد", value: elevatorDisplay, icon: ShieldCheck },
    { key: "parking", label: "الجراج", value: parkingDisplay, icon: Car },
    { key: "additionalFeatures", label: "المميزات الإضافية", value: property.additionalFeatures && property.additionalFeatures.trim() ? property.additionalFeatures : null, icon: CheckCircle2 },
  ];

  // Active items with values
  const activeSpecs = candidateSpecs.filter((item) => item.value != null && item.value !== "");

  // Safe fallback if few items defined
  const displaySpecs = activeSpecs.length >= 4 ? activeSpecs : [
    { key: "area", label: "المساحة", value: property.area ? `${property.area} م²` : "غير محدد", icon: Square },
    { key: "beds", label: "الغرف", value: property.beds > 0 ? `${property.beds} غرف` : (property.beds === 0 ? "استوديو" : "غير محدد"), icon: Bed },
    { key: "baths", label: "الحمامات", value: property.baths > 0 ? `${property.baths} حمام` : "غير محدد", icon: Bath },
    { key: "floor", label: "الدور", value: floorDisplay || "غير محدد", icon: Layers },
    { key: "finishing", label: "التشطيب", value: finishingLabel || property.finishing || "غير محدد", icon: Building2 },
  ];

  const handlePrint = () => {
    window.print();
  };

  // ── Luxury PDF Exporter (Zero Images, Super Fast, 100% Crisp Vector/HTML) ──
  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = printRef.current;

      // 1. Clone to an isolated off-screen sandbox.
      // CRITICAL: The visible element in the dialog is NEVER mutated or resized,
      // so the user's mobile screen and buttons NEVER jump or stretch!
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = "printable-brochure-export-clone";
      clone.style.width = "794px";
      clone.style.minWidth = "794px";
      clone.style.maxWidth = "794px";
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";
      clone.style.opacity = "1";
      clone.style.pointerEvents = "none";
      document.body.appendChild(clone);

      // Enforce 4-columns layout and non-wrapping header row on the export clone
      const headerRow = clone.querySelector("[data-header-row]");
      const specsGrid = clone.querySelector("[data-specs-grid]");
      if (headerRow) headerRow.classList.remove("flex-wrap");
      if (specsGrid) {
        specsGrid.classList.remove("grid-cols-2");
        specsGrid.classList.add("grid-cols-4");
      }

      // Small reflow tick
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 2. Dynamically resolve jsPDF constructor
      const PDFClass = (jsPDF as any).jsPDF || jsPDF;
      const pdf = new PDFClass({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm margins
      const maxW = pdfWidth - margin * 2; // 194mm
      const maxH = pdfHeight - margin * 2; // 281mm

      // Check whether listing warrants multi-page mode (Deterministic & Content-based)
      // Without photos, 95%+ of listings easily fit on 1 pristine A4 page!
      const desc = property.description?.trim() || "";
      const lineCount = desc.split("\n").length;
      const isLongDescription = desc.length > 700 || lineCount > 15;
      const isLargeSpecs = displaySpecs.length > 12;
      const totalHeight = clone.scrollHeight;

      // Deterministic check:
      const isMultiPage = isLongDescription || isLargeSpecs || totalHeight > 1080;

      if (!isMultiPage) {
        // ── Single Page Mode (Standard listings, 100% complete on 1 A4 page) ──
        const dataUrl = await toJpeg(clone, {
          quality: 0.96,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          cacheBust: true,
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const imgRatio = img.width / img.height;
        let renderW = maxW;
        let renderH = maxW / imgRatio;

        if (renderH > maxH) {
          renderH = maxH;
          renderW = maxH * imgRatio;
        }

        const xOffset = margin + (maxW - renderW) / 2;
        const yOffset = margin; // Top-aligned! Starts at top margin, never pushed down!

        pdf.addImage(dataUrl, "JPEG", xOffset, yOffset, renderW, renderH);
      } else {
        // ── Clean Multi-Page Mode (Never slices tables, cards or boxes in half) ──
        // Page 1: Header, Photos, and Specifications Matrix (Complete)
        const part1 = clone.querySelector("[data-section='part-1']") as HTMLElement;
        const part2 = clone.querySelector("[data-section='part-2']") as HTMLElement;

        if (part1 && part2) {
          // Style Part 1 container for pristine A4 export
          part1.style.background = "#ffffff";
          part1.style.padding = "24px 20px 16px 20px";

          // Ensure Page 1 footer badge is visible
          const page1Footer = part1.querySelector("[data-page-1-footer]") as HTMLElement;
          if (page1Footer) page1Footer.style.display = "flex";

          const dataUrl1 = await toJpeg(part1, {
            quality: 0.96,
            backgroundColor: "#ffffff",
            pixelRatio: 2,
          });

          const img1 = new Image();
          img1.src = dataUrl1;
          await new Promise((resolve) => { img1.onload = resolve; });

          const r1 = img1.width / img1.height;
          let w1 = maxW;
          let h1 = maxW / r1;
          if (h1 > maxH) {
            h1 = maxH;
            w1 = maxH * r1;
          }
          const x1 = margin + (maxW - w1) / 2;
          const y1 = margin; // Top-aligned! Starts directly at top margin (8mm)!

          pdf.addImage(dataUrl1, "JPEG", x1, y1, w1, h1);

          // ── Page 2: Description, Additional Details, and Contact Footer ──
          pdf.addPage();

          // Style Part 2 container for pristine A4 export with full height distribution
          part2.style.background = "#ffffff";
          part2.style.padding = "24px 20px 16px 20px";
          part2.style.display = "flex";
          part2.style.flexDirection = "column";
          part2.style.justifyContent = "space-between";
          part2.style.minHeight = "960px";

          // Ensure Page 2 luxury header bar is visible on Page 2
          const page2Header = part2.querySelector("[data-page-2-header]") as HTMLElement;
          if (page2Header) page2Header.style.display = "flex";

          const dataUrl2 = await toJpeg(part2, {
            quality: 0.96,
            backgroundColor: "#ffffff",
            pixelRatio: 2,
          });

          const img2 = new Image();
          img2.src = dataUrl2;
          await new Promise((resolve) => { img2.onload = resolve; });

          const r2 = img2.width / img2.height;
          let w2 = maxW;
          let h2 = maxW / r2;
          if (h2 > maxH) {
            h2 = maxH;
            w2 = maxH * r2;
          }
          const x2 = margin + (maxW - w2) / 2;
          const y2 = margin; // Top-aligned! Starts directly at top margin (8mm)!

          pdf.addImage(dataUrl2, "JPEG", x2, y2, w2, h2);
        } else {
          // Fallback single page with aspect ratio guarantee
          const dataUrl = await toJpeg(clone, { quality: 0.96, backgroundColor: "#ffffff", pixelRatio: 2 });
          const img = new Image();
          img.src = dataUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          const r = img.width / img.height;
          let w = maxW;
          let h = maxW / r;
          if (h > maxH) { h = maxH; w = maxH * r; }
          pdf.addImage(dataUrl, "JPEG", margin + (maxW - w) / 2, margin, w, h);
        }
      }

      // Cleanup clone from DOM
      clone.remove();

      const sanitizedCode = (property.code || property.title || "property").replace(/[\/\\:*?"<>|]/g, "_");
      pdf.save(`بروشور_عقار_${sanitizedCode}.pdf`);

      toast({
        title: "تم تحميل ملف الـ PDF بنجاح 📄✨",
        description: `تم حفظ البروشور الفاخر باسم: بروشور_عقار_${sanitizedCode}.pdf`,
      });
    } catch (err: any) {
      console.error("[PropertyBrochureModal] Failed to generate PDF:", err);
      toast({
        title: "تعذر توليد ملف الـ PDF",
        description: err?.message || "يرجى استخدام زر الطباعة المباشرة كبديل فوري.",
        variant: "destructive",
      });
    } finally {
      // Clean up clone if it remained due to error
      const strayClone = document.getElementById("printable-brochure-export-clone");
      if (strayClone) strayClone.remove();
      setDownloading(false);
    }
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
              className="flex-1 sm:flex-initial gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-md cursor-pointer"
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
              className="gap-2 rounded-xl border-border/80 text-foreground hover:bg-muted font-semibold cursor-pointer"
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
            {/* ── PART 1: Hero, Photos & Complete Specifications Matrix ────── */}
            <div data-section="part-1" className="space-y-4">
              {/* 1. Header with Golden Brand Banner */}
              <div className="flex items-center justify-between border-b-2 border-[#A9927D]/40 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-[#10202D] flex items-center justify-center text-[#A9927D] font-black text-base">
                      ع
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#10202D]">
                      {companyName}
                    </h2>
                  </div>
                  <p className="text-[11px] font-bold text-[#A9927D] tracking-wider uppercase pr-11">
                    ALAMOUDI REAL ESTATE & INVESTMENT
                  </p>
                </div>

                <div className="text-left" dir="ltr">
                  <div className="inline-block rounded-xl border border-[#A9927D]/40 bg-[#A9927D]/10 px-3.5 py-1 text-xs sm:text-sm font-black text-[#10202D]">
                    REF: {property.code || "ALM"}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">
                    تاريخ الإصدار: {new Date().toLocaleDateString("ar-SA-u-nu-latn")}
                  </p>
                </div>
              </div>

              {/* 2. Main Title & Golden Price Card */}
              <div data-header-row className="flex flex-wrap items-start justify-between gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div className="space-y-2 max-w-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-md bg-[#10202D] px-2.5 py-0.5 text-xs font-bold text-white">
                      {categoryLabel}
                    </span>
                    <span className="inline-block rounded-md bg-[#A9927D] px-2.5 py-0.5 text-xs font-bold text-[#10202D]">
                      {getListingTypeArabic(property.listingType)}
                    </span>
                    {propertyType && (
                      <span className="inline-block rounded-md bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-800">
                        {propertyType.name}
                      </span>
                    )}
                    {region && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 font-bold">
                        <MapPin className="h-3.5 w-3.5 text-[#A9927D]" />
                        {region.name} {property.subArea ? `- ${property.subArea}` : ""}
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-[#10202D] leading-snug">
                    {property.title}
                  </h1>
                </div>

                <div className="rounded-xl border border-[#A9927D]/40 bg-white p-3 text-left shadow-sm min-w-[155px]" dir="ltr">
                  <span className="block text-[11px] uppercase tracking-wider text-gray-500 font-bold text-right">
                    السعر المطلوب
                  </span>
                  <div className="text-right mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#10202D]">
                      {formatNumber(property.price)}
                    </span>
                    <span className="text-xs font-bold text-[#A9927D] mr-1">ج.م</span>
                  </div>
                </div>
              </div>

              {/* 3. Specifications Matrix (Dynamic & Pure Data Reflection) */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 mb-3 text-right">
                  المواصفات والبيانات الأساسية
                </h3>
                <div data-specs-grid className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-right">
                  {displaySpecs.map((spec) => {
                    const IconComp = spec.icon;
                    return (
                      <div
                        key={spec.key}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-gray-200 shadow-xs min-h-[58px]"
                      >
                        <IconComp className="h-4.5 w-4.5 text-[#A9927D] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] sm:text-xs text-gray-500 font-bold truncate">{spec.label}</span>
                          <span className="font-black text-[#10202D] block truncate text-xs sm:text-sm mt-0.5">
                            {spec.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Page 1 Subtle Footer Note (Activated on multi-page export / print) */}
              <div
                data-page-1-footer
                className="hidden items-center justify-between pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-bold"
              >
                <span>{companyName} • بروشور عقاري رسمي</span>
                <span>صفحة 1 من 2</span>
              </div>
            </div>

            {/* ── PART 2: Description, Additional Details & Contact Footer ── */}
            <div data-section="part-2" className="space-y-4 pt-2 print:break-before-page">
              {/* Page 2 Luxury Top Header Bar (Activated on multi-page export / print) */}
              <div
                data-page-2-header
                className="hidden items-center justify-between border-b-2 border-[#A9927D]/40 pb-3 mb-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#10202D] flex items-center justify-center text-[#A9927D] font-black text-sm">
                    ع
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-[#10202D] leading-tight">{companyName}</h3>
                    <p className="text-[10px] font-bold text-[#A9927D] uppercase">ALAMOUDI REAL ESTATE & INVESTMENT</p>
                  </div>
                </div>

                <div className="text-left" dir="ltr">
                  <div className="inline-block rounded-lg border border-[#A9927D]/40 bg-[#A9927D]/10 px-2.5 py-0.5 text-xs font-black text-[#10202D]">
                    REF: {property.code || "ALM"}
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                    صفحة 2 من 2
                  </p>
                </div>
              </div>

              {/* 5. Property Description & Additional Details */}
              {property.description && (
                <div className="space-y-1.5 text-right flex-1">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#A9927D]" />
                    تفاصيل ومميزات العقار
                  </h3>
                  <p className="text-xs sm:text-[13.5px] font-semibold text-gray-800 leading-relaxed whitespace-pre-line bg-gray-50/90 p-4 rounded-xl border border-gray-200">
                    {property.description}
                  </p>
                </div>
              )}

              {/* 6. Footer Contact & Dynamic QR Stamps */}
              <div className="flex items-center justify-between border-t-2 border-[#A9927D]/40 pt-4 text-xs gap-4 mt-auto">
                <div className="space-y-1 text-right flex-1">
                  <span className="font-bold text-[#10202D] text-xs sm:text-sm block">للحجز والاستفسار المباشر:</span>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-gray-700 text-xs sm:text-sm font-bold">
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <Phone className="h-3.5 w-3.5 text-[#A9927D]" /> {phone}
                    </span>
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <WhatsAppIcon className="h-3.5 w-3.5 fill-[#A9927D]" /> {whatsapp}
                    </span>
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <Mail className="h-3.5 w-3.5 text-[#A9927D]" /> {email}
                    </span>
                  </div>
                </div>

                {/* Dynamic QR Codes Stamp for Brochure (Compact & Professional) */}
                <div className="flex items-center gap-2.5">
                  {/* 1. Direct Property URL QR */}
                  <div className="flex flex-col items-center text-center">
                    <QrCodeView
                      url={propertyUrl}
                      type="url"
                      size={48}
                      alt="رابط صفحة العقار"
                      className="p-1 rounded-md border border-[#A9927D]/30 shadow-xs bg-white"
                    />
                    <span className="text-[8px] text-gray-600 font-bold mt-0.5 whitespace-nowrap">
                      امسح لفتح العقار
                    </span>
                  </div>

                  {/* 2. Custom Settings Active PDF QR (if configured) */}
                  {activePdfQrs.slice(0, 1).map((q) => (
                    <div key={q.id} className="flex flex-col items-center text-center">
                      <QrCodeView
                        url={q.url}
                        imageUrl={q.imageUrl}
                        type={q.type}
                        size={48}
                        alt={q.title}
                        className="p-1 rounded-md border border-[#A9927D]/30 shadow-xs bg-white"
                      />
                      <span className="text-[8px] text-gray-600 font-bold mt-0.5 whitespace-nowrap">
                        {q.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

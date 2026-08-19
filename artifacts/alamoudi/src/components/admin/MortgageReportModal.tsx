import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Printer,
  Download,
  Share2,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MapPin,
  X,
} from "lucide-react";
import { Property } from "@/context/DataContext";

interface AnnualRow {
  year: number;
  yearlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

interface MortgageReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanAmount: number;
  loanYears: number;
  totalMonths: number;
  interestRate: number;
  programName: string;
  monthlyInstallment: number;
  totalInterest: number;
  totalPayment: number;
  annualSchedule: AnnualRow[];
  selectedProperty?: Property | null;
}

export function MortgageReportModal({
  open,
  onOpenChange,
  propertyPrice,
  downPaymentPercent,
  downPaymentAmount,
  loanAmount,
  loanYears,
  totalMonths,
  interestRate,
  programName,
  monthlyInstallment,
  totalInterest,
  totalPayment,
  annualSchedule,
  selectedProperty,
}: MortgageReportModalProps) {
  const [clientName, setClientName] = useState<string>("");
  const [advisorName, setAdvisorName] = useState<string>("إدارة الاستشارات والتمويل العقاري");
  const [customNotes, setCustomNotes] = useState<string>(
    "هذا التقرير بمثابة عرض مالي استرشادي، وتخضع الشروط النهائية لموافقة الجهة الممولة والتقييم الائتماني."
  );

  const reportId = React.useMemo(() => {
    return `ALM-MORT-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  const issueDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate printable standalone HTML document for high-res PDF export & printing
  const generatePrintableHTML = () => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير دراسة التمويل والأقساط - ${reportId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13px;
      direction: rtl;
    }
    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px 28px;
    }
    @media print {
      body {
        background: #ffffff;
      }
      .report-container {
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #b99a68;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #10202d;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #b99a68;
      margin-top: 2px;
    }
    .meta-box {
      text-align: left;
      font-size: 11px;
      color: #475569;
    }
    .meta-badge {
      display: inline-block;
      background: #10202d;
      color: #ffffff;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
      font-family: monospace;
    }
    /* Info Cards */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .info-card-title {
      font-size: 11px;
      font-weight: 700;
      color: #b99a68;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 700;
      color: #0f172a;
    }
    /* Golden Summary Hero Box */
    .hero-summary {
      background: linear-gradient(135deg, #10202d 0%, #1a3348 100%);
      color: #ffffff;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 20px;
      border: 1px solid #b99a68;
    }
    .summary-title {
      font-size: 12px;
      font-weight: 700;
      color: #d8be92;
      margin-bottom: 12px;
      text-align: center;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      text-align: center;
    }
    .metric-item {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(185, 154, 104, 0.3);
      border-radius: 8px;
      padding: 10px 8px;
    }
    .metric-label {
      font-size: 11px;
      color: #cbd5e1;
      margin-bottom: 4px;
    }
    .metric-val {
      font-size: 16px;
      font-weight: 900;
      color: #ffffff;
    }
    .metric-val.gold {
      color: #f1dfbc;
      font-size: 18px;
    }
    .metric-sub {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }
    /* Table */
    .table-container {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #10202d;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      padding: 8px 10px;
      text-align: right;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .num {
      font-family: inherit;
      font-weight: 700;
    }
    .green {
      color: #059669;
    }
    .amber {
      color: #d97706;
    }
    /* Notes & Signatures */
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 11px;
      color: #92400e;
      margin-bottom: 20px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      padding-top: 10px;
    }
    .sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      min-height: 75px;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 30px;
    }
    .sig-line {
      border-top: 1px solid #94a3b8;
      width: 60%;
      margin: 0 auto;
    }
    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    .contact-items {
      display: flex;
      gap: 14px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">العمودي للتسويق العقاري</div>
        <div class="brand-subtitle">خطة التمويل وجدول سداد الأقساط المعتمدة</div>
      </div>
      <div class="meta-box">
        <div class="meta-badge">${reportId}</div>
        <div><strong>تاريخ الإصدار:</strong> ${issueDate}</div>
        <div><strong>المستشار المالي:</strong> ${advisorName}</div>
      </div>
    </div>

    <!-- Client & Property Details -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-title">بيانات العميل وخطة السداد</div>
        <div class="info-row">
          <span class="info-label">اسم العميل:</span>
          <span class="info-value">${clientName.trim() || "العميل الكريم"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">برنامج التمويل:</span>
          <span class="info-value">${programName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">مدة السداد:</span>
          <span class="info-value">${loanYears} سنوات (${totalMonths} قسطاً شهرياً)</span>
        </div>
        <div class="info-row">
          <span class="info-label">معدل الفائدة:</span>
          <span class="info-value">${interestRate === 0 ? "0% (بدون أي فوائد)" : `${interestRate}% سنوياً`}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-title">تفاصيل العقار محل الدراسة</div>
        <div class="info-row">
          <span class="info-label">كود العقار:</span>
          <span class="info-value">${selectedProperty?.code || "عقار مختار"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">وصف العقار:</span>
          <span class="info-value">${selectedProperty?.title || "وحدة عقارية فاخرة"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">الموقع / المنطقة:</span>
          <span class="info-value">${selectedProperty?.location || "القاهرة الجديدة / مدينتي"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">سعر العقار الإجمالي:</span>
          <span class="info-value" style="color:#b99a68;">${propertyPrice.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>
    </div>

    <!-- Golden KPI Summary Box -->
    <div class="hero-summary">
      <div class="summary-title">ملخص الخطة المالية والاستثمارية للأقساط</div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">القسط الشهري</div>
          <div class="metric-val gold">${monthlyInstallment.toLocaleString("ar-EG")} <small style="font-size:10px;">ج.م</small></div>
          <div class="metric-sub">ثابت على ${totalMonths} شهر</div>
        </div>

        <div class="metric-item">
          <div class="metric-label">الدفعة الأولى (المقدم)</div>
          <div class="metric-val">${downPaymentAmount.toLocaleString("ar-EG")} <small style="font-size:10px;">ج.م</small></div>
          <div class="metric-sub">بنسبة ${downPaymentPercent}%</div>
        </div>

        <div class="metric-item">
          <div class="metric-label">المبلغ الممول</div>
          <div class="metric-val">${loanAmount.toLocaleString("ar-EG")} <small style="font-size:10px;">ج.م</small></div>
          <div class="metric-sub">أصل التمويل العقاري</div>
        </div>

        <div class="metric-item">
          <div class="metric-label">إجمالي المبلغ المسدد</div>
          <div class="metric-val">${totalPayment.toLocaleString("ar-EG")} <small style="font-size:10px;">ج.م</small></div>
          <div class="metric-sub">${totalInterest > 0 ? `شاملاً ${totalInterest.toLocaleString("ar-EG")} ج.م فوائد` : "بدون أي فوائد إضافية"}</div>
        </div>
      </div>
    </div>

    <!-- Annual Breakdown Table -->
    <div class="table-container">
      <div class="section-title">جدول استهلاك وسداد الأقساط السنوي</div>
      <table>
        <thead>
          <tr>
            <th>السنة</th>
            <th>إجمالي المسدد سنوياً</th>
            <th>أصل القسط المسدد</th>
            <th>الفوائد المسددة</th>
            <th style="text-align:left;">الرصيد المتبقي</th>
          </tr>
        </thead>
        <tbody>
          ${annualSchedule
            .map(
              (row) => `
            <tr>
              <td><strong>السنة ${row.year}</strong></td>
              <td class="num">${row.yearlyPayment.toLocaleString("ar-EG")} ج.م</td>
              <td class="num green">${row.principalPaid.toLocaleString("ar-EG")} ج.م</td>
              <td class="num amber">${row.interestPaid > 0 ? `${row.interestPaid.toLocaleString("ar-EG")} ج.م` : "0 ج.م"}</td>
              <td class="num" style="text-align:left; color:#475569;">${row.remainingBalance.toLocaleString("ar-EG")} ج.م</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Notes -->
    <div class="notes-box">
      <strong>ملاحظات هامة:</strong> ${customNotes}
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-box">
        <div class="sig-title">اعتماد المستشار المالي / المدير التنفيذي</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">توقيع العميل / استلام نسخة العرض</div>
        <div class="sig-line"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>العمودي للتسويق العقاري — منصة العقارات الفاخرة</div>
      <div class="contact-items">
        <span>هاتف: 01000000000</span>
        <span>البريد: info@alamoudi.com</span>
        <span>الموقع: alamoudi-real-estate.vercel.app</span>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;
  };

  const handlePrintOrDownload = () => {
    const htmlContent = generatePrintableHTML();
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleShareWhatsApp = () => {
    const text =
      `*تقرير دراسة التمويل والأقساط العقارية* 🏢\n` +
      `*العمودي للتسويق العقاري*\n` +
      `رقم التقرير: ${reportId}\n` +
      `العميل: ${clientName.trim() || "العميل المحترم"}\n\n` +
      `💰 *سعر العقار:* ${propertyPrice.toLocaleString("ar-EG")} ج.م\n` +
      `💵 *المقدم (${downPaymentPercent}%):* ${downPaymentAmount.toLocaleString("ar-EG")} ج.م\n` +
      `🏦 *المبلغ الممول:* ${loanAmount.toLocaleString("ar-EG")} ج.م\n` +
      `📅 *مدة السداد:* ${loanYears} سنوات (${totalMonths} شهر)\n` +
      `📊 *الفائدة:* ${interestRate}%\n` +
      `--------------------------------\n` +
      `🌟 *القسط الشهري:* ${monthlyInstallment.toLocaleString("ar-EG")} ج.م / شهر\n` +
      `💳 *إجمالي المبلغ المسدد:* ${totalPayment.toLocaleString("ar-EG")} ج.م\n\n` +
      `تم إعداد التقرير بواسطة: ${advisorName}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-accent/40">
        <DialogHeader className="p-5 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#B99A68]/20 text-[#B99A68] flex items-center justify-center font-bold">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-black text-foreground">
                  معاينة وتخصيص تقرير التمويل الرسمي (PDF Report)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  قالب طباعة ملكي جاهز للتصدير كملف PDF عالي الدقة أو الطباعة المباشرة
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-6">
          {/* 1. Customization Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">اسم العميل (اختياري للتقرير):</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: أ / محمد عبد العزيز"
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">اسم المستشار المالي / المحرر:</Label>
              <Input
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                placeholder="مثال: إدارة الاستشارات والتمويل العقاري"
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-foreground">ملاحظات إضافية في أسفل التقرير:</Label>
              <Input
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="أدخل أي بنود أو شروط خاصة ترغب في إظهارها..."
                className="h-9 text-xs bg-background"
              />
            </div>
          </div>

          {/* 2. Interactive In-App Report Canvas Preview */}
          <div className="rounded-xl border border-[#B99A68]/40 bg-card p-6 shadow-md space-y-6 text-foreground">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#B99A68] pb-4">
              <div>
                <h3 className="text-2xl font-black text-foreground">العمودي للتسويق العقاري</h3>
                <p className="text-xs font-bold text-[#B99A68] mt-0.5">
                  خطة التمويل وجدول سداد الأقساط المعتمدة
                </p>
              </div>
              <div className="text-left text-xs text-muted-foreground space-y-1">
                <div className="inline-block bg-primary text-primary-foreground font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                  {reportId}
                </div>
                <div><strong>تاريخ الإصدار:</strong> {issueDate}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-[#B99A68] text-[11px] block">بيانات العميل والخطة</span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العميل:</span>
                  <span className="font-bold">{clientName.trim() || "العميل الكريم"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البرنامج:</span>
                  <span className="font-bold">{programName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مدة السداد:</span>
                  <span className="font-bold">{loanYears} سنوات ({totalMonths} قسطاً)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-[#B99A68] text-[11px] block">بيانات العقار</span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">كود العقار:</span>
                  <span className="font-bold">{selectedProperty?.code || "عقار مختار"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع العقار:</span>
                  <span className="font-bold">{selectedProperty?.title || "شقة فاخرة"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر العقار:</span>
                  <span className="font-bold text-[#B99A68]">{propertyPrice.toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>
            </div>

            {/* Golden Summary KPIs */}
            <div className="rounded-xl bg-gradient-to-r from-[#10202D] via-[#1A3348] to-[#10202D] p-4 text-white border border-[#B99A68]/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-white/5 border border-[#B99A68]/30">
                  <span className="text-[11px] text-white/70 block">القسط الشهري</span>
                  <span className="text-lg font-black text-[#F1DFBC] block mt-0.5">
                    {monthlyInstallment.toLocaleString("ar-EG")} <small className="text-[10px]">ج.م</small>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[11px] text-white/70 block">المقدم ({downPaymentPercent}%)</span>
                  <span className="text-base font-black text-white block mt-0.5">
                    {downPaymentAmount.toLocaleString("ar-EG")} <small className="text-[10px]">ج.م</small>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[11px] text-white/70 block">المبلغ الممول</span>
                  <span className="text-base font-black text-white block mt-0.5">
                    {loanAmount.toLocaleString("ar-EG")} <small className="text-[10px]">ج.م</small>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[11px] text-white/70 block">إجمالي المسدد</span>
                  <span className="text-base font-black text-white block mt-0.5">
                    {totalPayment.toLocaleString("ar-EG")} <small className="text-[10px]">ج.م</small>
                  </span>
                </div>
              </div>
            </div>

            {/* Annual Breakdown Summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">جدول الاستهلاك السنوي</span>
              <div className="border rounded-lg overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-muted/60 text-muted-foreground font-bold">
                    <tr>
                      <th className="p-2">السنة</th>
                      <th className="p-2">المسدد سنوياً</th>
                      <th className="p-2 text-emerald-600">أصل الدين</th>
                      <th className="p-2 text-amber-600">الفوائد</th>
                      <th className="p-2 text-left">الرصيد المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {annualSchedule.slice(0, 5).map((row) => (
                      <tr key={row.year} className="hover:bg-muted/20">
                        <td className="p-2 font-bold">السنة {row.year}</td>
                        <td className="p-2 font-bold">{row.yearlyPayment.toLocaleString("ar-EG")} ج.م</td>
                        <td className="p-2 text-emerald-600">{row.principalPaid.toLocaleString("ar-EG")} ج.م</td>
                        <td className="p-2 text-amber-600">{row.interestPaid > 0 ? `${row.interestPaid.toLocaleString("ar-EG")} ج.م` : "0 ج.م"}</td>
                        <td className="p-2 font-mono text-left">{row.remainingBalance.toLocaleString("ar-EG")} ج.م</td>
                      </tr>
                    ))}
                    {annualSchedule.length > 5 && (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-xs text-muted-foreground bg-muted/10 italic">
                          ... متبقي {annualSchedule.length - 5} سنوات مدرجة بالكامل في مستند PDF النهائي
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs h-10 px-4"
            >
              <Share2 className="h-4 w-4" />
              مشاركة ملخص عبر الواتساب
            </Button>

            <Button
              onClick={handlePrintOrDownload}
              className="bg-[#B99A68] hover:bg-[#C9AB78] text-[#10202D] font-black gap-2 text-xs sm:text-sm h-10 px-5 shadow-md"
            >
              <Download className="h-4 w-4" />
              تحميل التقرير PDF / طباعة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

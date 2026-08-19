import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  Building2,
  Calendar,
  Percent,
  Wallet,
  DollarSign,
  TrendingDown,
  Printer,
  Share2,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";

const FINANCING_PROGRAMS = [
  { id: "direct", name: "تقسيط مباشر من المطور (0% بدون فوائد)", rate: 0, desc: "أقساط متساوية بدون أي فوائد بنكية" },
  { id: "cbe_3", name: "مبادرة التمويل العقاري (3% متناقصة)", rate: 3, desc: "لمحدودي ومتوسطي الدخل حتى 30 سنة" },
  { id: "cbe_8", name: "مبادرة التمويل العقاري (8% متناقصة)", rate: 8, desc: "للإسكان المتوسط وفوق المتوسط حتى 25 سنة" },
  { id: "commercial_14", name: "تمويل بنكي تجاري (14% سنوي)", rate: 14, desc: "البرامج التمويلية للوحدات التجارية والإدارية" },
  { id: "custom", name: "نسبة فائدة مخصصة", rate: 10, desc: "تحديد نسبة الفائدة يدوياً" },
];

export default function MortgageCalculatorPage() {
  const { toast } = useToast();
  const { properties } = useData();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [propertyPrice, setPropertyPrice] = useState<number>(4500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanYears, setLoanYears] = useState<number>(10);
  const [programId, setProgramId] = useState<string>("direct");
  const [customInterestRate, setCustomInterestRate] = useState<number>(10);

  // Property picker handler
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    const prop = properties.find(p => p.id === id || p.code === id);
    if (prop && prop.price > 0) {
      setPropertyPrice(prop.price);
      toast({ title: `تم تعيين سعر العقار ${prop.code}: ${prop.price.toLocaleString("ar-EG")} ج.م` });
    }
  };

  // Active interest rate
  const interestRate = useMemo(() => {
    if (programId === "custom") return customInterestRate;
    const prog = FINANCING_PROGRAMS.find(p => p.id === programId);
    return prog ? prog.rate : 0;
  }, [programId, customInterestRate]);

  // Calculations
  const downPaymentAmount = useMemo(() => {
    return Math.round((propertyPrice * downPaymentPercent) / 100);
  }, [propertyPrice, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return Math.max(0, propertyPrice - downPaymentAmount);
  }, [propertyPrice, downPaymentAmount]);

  const totalMonths = loanYears * 12;

  // Monthly installment calculation
  const { monthlyInstallment, totalInterest, totalPayment } = useMemo(() => {
    if (loanAmount <= 0 || totalMonths <= 0) {
      return { monthlyInstallment: 0, totalInterest: 0, totalPayment: 0 };
    }

    if (interestRate === 0) {
      // 0% direct developer installments
      const monthly = Math.round(loanAmount / totalMonths);
      return {
        monthlyInstallment: monthly,
        totalInterest: 0,
        totalPayment: propertyPrice,
      };
    }

    // Standard reducing balance mortgage formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyRate = interestRate / 100 / 12;
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
    const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
    const monthly = Math.round(numerator / denominator);
    const totalPay = monthly * totalMonths + downPaymentAmount;
    const totalInt = totalPay - propertyPrice;

    return {
      monthlyInstallment: monthly,
      totalInterest: Math.max(0, totalInt),
      totalPayment: totalPay,
    };
  }, [propertyPrice, loanAmount, totalMonths, interestRate, downPaymentAmount]);

  // Annual schedule breakdown
  const annualSchedule = useMemo(() => {
    if (loanAmount <= 0 || totalMonths <= 0) return [];
    const schedule = [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 100 / 12;

    for (let year = 1; year <= loanYears; year++) {
      let yearInterest = 0;
      let yearPrincipal = 0;

      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) break;
        const interest = interestRate === 0 ? 0 : balance * monthlyRate;
        const principal = monthlyInstallment - interest;
        yearInterest += interest;
        yearPrincipal += principal;
        balance = Math.max(0, balance - principal);
      }

      schedule.push({
        year,
        yearlyPayment: Math.round(yearPrincipal + yearInterest),
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        remainingBalance: Math.round(balance),
      });
    }
    return schedule;
  }, [loanAmount, totalMonths, loanYears, interestRate, monthlyInstallment]);

  // Share calculation summary to WhatsApp
  const handleShareWhatsApp = () => {
    const text =
      `*خطة التمويل والأقساط - العمودي للتسويق العقاري* 🏢\n\n` +
      `💰 *سعر العقار:* ${propertyPrice.toLocaleString("ar-EG")} ج.م\n` +
      `💵 *المقدم (${downPaymentPercent}%):* ${downPaymentAmount.toLocaleString("ar-EG")} ج.م\n` +
      `🏦 *المبلغ الممول:* ${loanAmount.toLocaleString("ar-EG")} ج.م\n` +
      `📅 *مدة السداد:* ${loanYears} سنوات (${totalMonths} شهر)\n` +
      `📊 *الفائدة:* ${interestRate}%\n` +
      `--------------------------------\n` +
      `🌟 *القسط الشهري:* ${monthlyInstallment.toLocaleString("ar-EG")} ج.م / شهر\n` +
      `💳 *إجمالي المدفوع:* ${totalPayment.toLocaleString("ar-EG")} ج.م\n\n` +
      `للمزيد من التفاصيل: ${window.location.origin}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
        <AdminPageHeader
          title="حاسبة التمويل العقاري والأقساط (Mortgage Calculator)"
          subtitle="حساب الأقساط الشهرية، جدول السداد، نسب الفائدة، ومقارنة خطط التمويل المباشر والبنكي للعملاء"
          eyebrow="الخدمات المالية والحسابات"
          icon={Calculator}
          actions={
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-1.5 h-10 px-4 rounded-xl text-xs sm:text-sm font-bold border-border"
              >
                <Printer className="h-4 w-4" />
                طباعة التقرير
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 h-10 px-4 rounded-xl shadow-md text-xs sm:text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                مشاركة عبر الواتساب
              </Button>
            </div>
          }
        />

        {/* ── Top Summary KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-accent/40 bg-gradient-to-br from-accent/15 via-card to-card shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">القسط الشهري المتوقع</span>
                <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {monthlyInstallment.toLocaleString("ar-EG")}
                </span>
                <span className="text-xs font-bold text-accent">ج.م / شهر</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">على مدار {totalMonths} قسطاً شهرياً</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">مبلغ الدفعة الأولى (المقدم)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {downPaymentAmount.toLocaleString("ar-EG")}
                </span>
                <span className="text-xs font-bold text-muted-foreground">ج.م ({downPaymentPercent}%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">المتبقي للتمويل: {loanAmount.toLocaleString("ar-EG")} ج.م</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">إجمالي الفوائد / الأرباح</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {totalInterest.toLocaleString("ar-EG")}
                </span>
                <span className="text-xs font-bold text-muted-foreground">ج.م</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {interestRate === 0 ? "بدون أي فوائد إضافية ✓" : `بمعدل فائدة ${interestRate}% سنوياً`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">إجمالي المبلغ المسدد</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {totalPayment.toLocaleString("ar-EG")}
                </span>
                <span className="text-xs font-bold text-muted-foreground">ج.م</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">شاملاً المقدم وكافة الأقساط</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Calculator Form & Schedule Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Inputs Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/80 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-accent" />
                  <CardTitle className="text-base font-bold">بيانات واختيارات التمويل</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  اختر عقاراً من قاعدة البيانات أو أدخل السعر والخيارات يدوياً.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-xs sm:text-sm">

                {/* Pick Existing Property */}
                {properties.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">اختر عقاراً من المنصة (اختياري):</Label>
                    <Select value={selectedPropertyId} onValueChange={handleSelectProperty}>
                      <SelectTrigger className="h-10 text-xs bg-background/80">
                        <SelectValue placeholder="اختر عقاراً لملء السعر تلقائياً..." />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.slice(0, 30).map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.code} — {p.title} ({p.price ? p.price.toLocaleString("ar-EG") + " ج.م" : "غير محدد"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Property Price Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">سعر العقار الإجمالي (ج.م):</Label>
                    <span className="text-xs font-bold font-mono text-accent">
                      {propertyPrice.toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={propertyPrice || ""}
                    onChange={e => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                    className="h-10 text-sm font-bold bg-background/80"
                    placeholder="مثال: 4,500,000"
                  />
                </div>

                {/* Down Payment (المقدم) Slider & Presets */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">نسبة الدفعة الأولى (المقدم):</Label>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {downPaymentPercent}% ({downPaymentAmount.toLocaleString("ar-EG")} ج.م)
                    </span>
                  </div>
                  <Slider
                    value={[downPaymentPercent]}
                    min={0}
                    max={70}
                    step={5}
                    onValueChange={val => setDownPaymentPercent(val[0])}
                    className="py-1"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[10, 15, 20, 25, 30, 50].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPaymentPercent(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          downPaymentPercent === pct
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan Duration (مدة السداد) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">مدة السداد / التقسيط (سنوات):</Label>
                    <span className="text-xs font-bold font-mono text-accent">
                      {loanYears} سنوات ({totalMonths} شهر)
                    </span>
                  </div>
                  <Slider
                    value={[loanYears]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={val => setLoanYears(val[0])}
                    className="py-1"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[1, 3, 5, 7, 10, 15, 20, 25].map(yrs => (
                      <button
                        key={yrs}
                        type="button"
                        onClick={() => setLoanYears(yrs)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          loanYears === yrs
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {yrs} سنين
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financing Program Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">برنامج التمويل / نوع الفائدة:</Label>
                  <Select value={programId} onValueChange={setProgramId}>
                    <SelectTrigger className="h-10 text-xs bg-background/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FINANCING_PROGRAMS.map(prog => (
                        <SelectItem key={prog.id} value={prog.id} className="text-xs">
                          {prog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {FINANCING_PROGRAMS.find(p => p.id === programId)?.desc}
                  </p>
                </div>

                {/* Custom Rate Input if selected */}
                {programId === "custom" && (
                  <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border/60">
                    <Label className="text-xs font-bold text-foreground">نسبة الفائدة السنوية (%):</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={customInterestRate || ""}
                      onChange={e => setCustomInterestRate(Number(e.target.value))}
                      className="h-9 text-xs bg-background"
                      placeholder="مثال: 9.5"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Annual Amortization Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/80 bg-card shadow-sm h-full flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base font-bold">جدول استهلاك وسداد الأقساط السنوي</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-border">
                    {loanYears} سنوات سداد
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  تفصيل المبالغ المسددة سنوياً من أصل التمويل والفوائد والرصيد المتبقي.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2.5 px-3 font-bold">السنة</th>
                      <th className="py-2.5 px-3 font-bold">المسدد سنوياً</th>
                      <th className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">أصل الدين</th>
                      <th className="py-2.5 px-3 font-bold text-amber-600">الفائدة</th>
                      <th className="py-2.5 px-3 font-bold text-left">الرصيد المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {annualSchedule.map(row => (
                      <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-foreground">السنة {row.year}</td>
                        <td className="py-2.5 px-3 font-bold">{row.yearlyPayment.toLocaleString("ar-EG")} ج.م</td>
                        <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                          {row.principalPaid.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-amber-600 font-medium">
                          {row.interestPaid > 0 ? row.interestPaid.toLocaleString("ar-EG") + " ج.م" : "0 ج.م"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-left text-muted-foreground font-semibold">
                          {row.remainingBalance.toLocaleString("ar-EG")} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

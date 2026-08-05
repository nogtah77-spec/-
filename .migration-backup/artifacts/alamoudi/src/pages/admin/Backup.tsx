import { useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Download, Upload, RefreshCw, CheckCircle2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";

const KEYS = ["alamoudi_regions","alamoudi_property_types","alamoudi_properties","alamoudi_users","alamoudi_inquiries","alamoudi_finishing_requests","alamoudi_property_requests","alamoudi_settings","alamoudi_favorites","alamoudi_compare"];

export default function Backup() {
  const data = useData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backup: Record<string, any> = { exportedAt: new Date().toISOString(), version: "1.0" };
    KEYS.forEach(k => {
      try { const v = localStorage.getItem(k); if (v) backup[k] = JSON.parse(v); } catch {}
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `alamoudi-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "تم تصدير النسخة الاحتياطية بنجاح" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);
        let count = 0;
        KEYS.forEach(k => {
          if (backup[k] !== undefined) {
            localStorage.setItem(k, JSON.stringify(backup[k])); count++;
          }
        });
        toast({ title: "تم استيراد النسخة الاحتياطية", description: `تم استعادة ${count} مجموعة بيانات. يرجى تحديث الصفحة.` });
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        toast({ title: "فشل استيراد النسخة الاحتياطية", description: "تأكد من أن الملف صحيح وغير تالف.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleReset = () => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف جميع البيانات ولا يمكن التراجع عن هذا الإجراء.")) return;
    KEYS.forEach(k => localStorage.removeItem(k));
    toast({ title: "تم حذف جميع البيانات", description: "يتم تحديث الصفحة..." });
    setTimeout(() => window.location.reload(), 1500);
  };

  const stats = [
    { label: "العقارات", count: data.properties.length },
    { label: "المستخدمين", count: data.users.length },
    { label: "الاستفسارات", count: data.inquiries.length },
    { label: "طلبات التشطيبات", count: data.finishingRequests.length },
    { label: "طلبات إضافة عقار", count: data.propertyRequests.length },
    { label: "المناطق", count: data.regions.length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">النسخ الاحتياطي</h1>
          <p className="text-muted-foreground mt-1">تصدير واستيراد واستعادة بيانات المنصة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center card-luxury">
              <div className="text-2xl font-bold text-accent">{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-luxury border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-accent" />تصدير نسخة احتياطية</CardTitle>
              <CardDescription>تصدير جميع بيانات المنصة في ملف JSON</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />جميع العقارات والبيانات
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />الإعدادات والأرقام
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />الاستفسارات والطلبات
                </div>
              </div>
              <Button className="w-full bg-accent text-white hover:bg-accent/90 gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />تصدير نسخة احتياطية
              </Button>
            </CardContent>
          </Card>

          <Card className="card-luxury border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-blue-500" />استيراد نسخة احتياطية</CardTitle>
              <CardDescription>استعادة البيانات من ملف نسخة احتياطية سابق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => fileRef.current?.click()}>
                <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">اختر ملف النسخة الاحتياطية</p>
                <p className="text-xs text-muted-foreground mt-1">ملفات JSON فقط</p>
              </div>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />اختيار الملف واستيراده
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="card-luxury border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600"><RefreshCw className="h-5 w-5" />إعادة ضبط المنصة</CardTitle>
            <CardDescription>حذف جميع البيانات وإعادة الموقع إلى الإعدادات الافتراضية</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">تحذير: هذا الإجراء لا يمكن التراجع عنه. يُنصح بتصدير نسخة احتياطية قبل المتابعة.</p>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20 gap-2" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />إعادة ضبط جميع البيانات
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

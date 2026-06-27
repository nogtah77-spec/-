import { useRef, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TEMPLATE_HEADERS = "العنوان,الوصف,السعر,المساحة,غرف_النوم,الحمامات,الدور,التشطيب,الفيو,الفئة,الحالة";
const TEMPLATE_ROW = "شقة فاخرة,وصف العقار,2500000,120,3,2,4,super-lux,بحري,sale,active";

function toCSV(rows: Record<string, any>[], headers: string[]): string {
  const escape = (v: any) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
}

export default function ImportExport() {
  const { properties, users, inquiries, regions, propertyTypes, addProperty } = useData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportType, setExportType] = useState("properties");
  const [dragging, setDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  const getExportData = () => {
    switch (exportType) {
      case "properties":
        return properties.map(p => ({
          "الكود": p.code, "العنوان": p.title, "الوصف": p.description,
          "السعر": p.price, "المساحة": p.area, "غرف_النوم": p.beds,
          "الحمامات": p.baths, "الدور": p.floor, "التشطيب": p.finishing,
          "الفيو": p.view, "الفئة": p.category, "الحالة": p.status,
          "مميز": p.featured ? "نعم" : "لا", "نوع_العرض": p.agentType,
          "رابط_الخريطة": p.mapsUrl, "رابط_الفيديو": p.videoUrl,
          "المنطقة": regions.find(r => r.id === p.regionId)?.name ?? p.regionId,
          "النوع": propertyTypes.find(t => t.id === p.typeId)?.name ?? p.typeId,
          "تاريخ_الإضافة": new Date(p.createdAt).toLocaleDateString("ar-EG"),
        }));
      case "users":
        return users.map(u => ({
          "الاسم": u.name, "البريد الإلكتروني": u.email,
          "الدور": u.role, "نشط": u.active ? "نعم" : "لا",
          "تاريخ_الانضمام": new Date(u.joinedAt).toLocaleDateString("ar-EG"),
        }));
      case "inquiries":
        return inquiries.map(i => ({
          "الاسم": i.name, "الهاتف": i.phone, "البريد": i.email,
          "الموضوع": i.subject, "الرسالة": i.message, "الحالة": i.status,
          "التاريخ": new Date(i.createdAt).toLocaleDateString("ar-EG"),
        }));
      default: return [];
    }
  };

  const handleExport = () => {
    const data = getExportData();
    if (data.length === 0) { toast({ title: "لا توجد بيانات للتصدير", variant: "destructive" }); return; }
    const headers = Object.keys(data[0]);
    const csv = toCSV(data, headers);
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `alamoudi-${exportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: `تم تصدير ${data.length} سجل بنجاح` });
  };

  const handleTemplate = () => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + TEMPLATE_HEADERS + "\n" + TEMPLATE_ROW], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "template-properties.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const processImport = (text: string) => {
    try {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) { toast({ title: "الملف فارغ أو غير صحيح", variant: "destructive" }); return; }
      const headers = lines[0].replace(/^\uFEFF/, "").split(",");
      let success = 0; let errors = 0;
      lines.slice(1).forEach(line => {
        try {
          const vals = line.split(",");
          const row: Record<string, string> = {};
          headers.forEach((h, i) => { row[h.trim()] = (vals[i] ?? "").trim(); });
          const title = row["العنوان"] || row["title"];
          if (!title) { errors++; return; }
          addProperty({
            title, description: row["الوصف"] || row["description"] || "",
            price: Number(row["السعر"] || row["price"] || 0),
            area: Number(row["المساحة"] || row["area"] || 0),
            beds: Number(row["غرف_النوم"] || row["beds"] || 0),
            baths: Number(row["الحمامات"] || row["baths"] || 0),
            floors: 0, floor: Number(row["الدور"] || 0),
            finishing: row["التشطيب"] || "", view: row["الفيو"] || "",
            typeId: "", regionId: "",
            category: (row["الفئة"] || "sale") as any,
            status: (row["الحالة"] || "draft") as any,
            featured: false, agentType: "direct",
            images: [], videoUrl: "", externalUrl: "", mapsUrl: "",
          });
          success++;
        } catch { errors++; }
      });
      setImportResult({ success, errors });
      toast({ title: `تم الاستيراد: ${success} نجح، ${errors} فشل` });
    } catch {
      toast({ title: "خطأ في قراءة الملف", variant: "destructive" });
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { toast({ title: "يدعم ملفات CSV فقط", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = e => processImport(e.target?.result as string);
    reader.readAsText(file, "utf-8");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الاستيراد والتصدير</h1>
          <p className="text-muted-foreground mt-1 text-sm">استيراد وتصدير بيانات المنصة بصيغة CSV</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import */}
          <Card>
            <CardHeader>
              <CardTitle>استيراد البيانات</CardTitle>
              <CardDescription>رفع ملف CSV لاستيراد عقارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn("border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                  dragging ? "border-accent bg-accent/5" : "border-border hover:bg-muted/30 hover:border-accent/50")}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">اسحب ملف CSV هنا أو انقر للاختيار</p>
                <p className="text-xs text-muted-foreground">ملفات CSV فقط</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { handleFile(f); e.target.value = ""; } }} />

              {importResult && (
                <div className={cn("flex items-center gap-3 rounded-lg p-3 text-sm",
                  importResult.errors > 0 ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700" : "bg-green-50 dark:bg-green-950/20 text-green-700")}>
                  {importResult.errors === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  نجح: {importResult.success} — فشل: {importResult.errors}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">تحتاج لنموذج؟</span>
                <Button variant="link" className="text-primary h-auto p-0 text-xs" onClick={handleTemplate}>
                  تحميل نموذج CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export */}
          <Card>
            <CardHeader>
              <CardTitle>تصدير البيانات</CardTitle>
              <CardDescription>تنزيل بيانات المنصة بصيغة CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">البيانات المراد تصديرها</label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="properties">العقارات ({properties.length})</SelectItem>
                    <SelectItem value="users">المستخدمين ({users.length})</SelectItem>
                    <SelectItem value="inquiries">الاستفسارات ({inquiries.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />صيغة CSV بترميز UTF-8</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />يدعم Excel وجداول البيانات</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />يشمل جميع الحقول</div>
              </div>
              <Button className="w-full bg-accent text-white hover:bg-accent/90 gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />تصدير CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

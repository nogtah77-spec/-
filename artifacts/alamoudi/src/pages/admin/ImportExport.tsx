import { useRef, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { parseWorkbookBytes, parseDelimitedText, type ParsedProperty } from "@/lib/propertyImport";

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
  const { properties, users, inquiries, regions, propertyTypes, importProperties } = useData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportType, setExportType] = useState("properties");
  const [dragging, setDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; errors: number; sheets: { name: string; count: number }[] } | null>(null);

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

  const applyImport = (items: ParsedProperty[], sheets: { name: string; count: number }[]) => {
    const valid = items.filter(p => p.price || p.area || p.code || (p.title && p.title.trim()));
    const errors = items.length - valid.length;
    if (valid.length === 0) {
      toast({ title: "لم يتم العثور على بيانات صالحة في الملف", variant: "destructive" });
      return;
    }
    const { added, updated } = importProperties(valid);
    setImportResult({ added, updated, errors, sheets });
    toast({ title: `تم الاستيراد بنجاح`, description: `أُضيف ${added} عقار، حُدّث ${updated}، تخطّي ${errors}` });
  };

  const handleFile = (file: File) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
    const isText = name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv");
    if (!isExcel && !isText) {
      toast({ title: "صيغة غير مدعومة", description: "يدعم Excel (xlsx/xls) و CSV و TXT", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast({ title: "تعذّر قراءة الملف", variant: "destructive" });
    reader.onload = e => {
      try {
        if (isExcel) {
          const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
          const { items, sheets } = parseWorkbookBytes(bytes);
          applyImport(items, sheets);
        } else {
          const { items, sheets } = parseDelimitedText(e.target?.result as string, regions);
          applyImport(items, sheets);
        }
      } catch {
        toast({ title: "خطأ في معالجة الملف", description: "تأكد أن الملف بالتنسيق الصحيح", variant: "destructive" });
      }
    };
    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file, "utf-8");
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
              <CardTitle>استيراد العقارات</CardTitle>
              <CardDescription>رفع ملف Excel أو CSV — يُوزَّع تلقائياً حسب المنطقة والفئة، ويُحدِّث العقار إن تطابق الكود</CardDescription>
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
                <p className="text-sm font-medium mb-1">اسحب الملف هنا أو انقر للاختيار</p>
                <p className="text-xs text-muted-foreground">Excel (xlsx · xls) · CSV · TXT</p>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt,.tsv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { handleFile(f); e.target.value = ""; } }} />

              {importResult && (
                <div className={cn("rounded-lg p-3 text-sm space-y-2",
                  importResult.errors > 0 ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700" : "bg-green-50 dark:bg-green-950/20 text-green-700")}>
                  <div className="flex items-center gap-2 font-medium">
                    {importResult.errors === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    أُضيف {importResult.added} · حُدِّث {importResult.updated} · تُخطّي {importResult.errors}
                  </div>
                  {importResult.sheets.length > 0 && (
                    <ul className="text-xs space-y-0.5 opacity-80 pr-6 list-disc">
                      {importResult.sheets.map((s, i) => <li key={i}>{s.name}: {s.count}</li>)}
                    </ul>
                  )}
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

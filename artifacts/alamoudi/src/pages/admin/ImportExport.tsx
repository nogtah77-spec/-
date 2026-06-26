import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Download, FileSpreadsheet } from "lucide-react";

export default function ImportExport() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الاستيراد والتصدير</h1>
          <p className="text-muted-foreground mt-1">استيراد وتصدير بيانات العقارات والمستخدمين بكميات كبيرة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>استيراد البيانات</CardTitle>
              <CardDescription>تحميل ملفات Excel أو CSV لإضافة سجلات جديدة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-1">اسحب ملفات البيانات هنا</h3>
                <p className="text-sm text-muted-foreground mb-4">تدعم المنصة صيغ CSV و XLSX</p>
                <Button variant="outline">استعراض الملفات</Button>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-muted-foreground">بحاجة لمساعدة؟</span>
                <Button variant="link" className="text-primary h-auto p-0">تحميل نموذج ملف استيراد</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تصدير البيانات</CardTitle>
              <CardDescription>تنزيل البيانات الحالية للحفظ أو التحليل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر نوع البيانات</label>
                  <Select defaultValue="properties">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="properties">قائمة العقارات</SelectItem>
                      <SelectItem value="users">بيانات المستخدمين</SelectItem>
                      <SelectItem value="inquiries">طلبات التواصل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">صيغة الملف</label>
                  <Select defaultValue="xlsx">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end border-t mt-4">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                  <Download className="ml-2 h-4 w-4" />
                  بدء التصدير
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

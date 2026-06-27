import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, UploadCloud, MapPin } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { useData, PropertyCategory, PropertyStatus } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";

export default function PropertyForm() {
  const { regions, propertyTypes, addProperty, updateProperty, properties } = useData();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const existing = isEdit ? properties.find(p => p.id === params.id) : undefined;

  // Form state
  const [form, setForm] = useState({
    title: existing?.title ?? "",
    description: existing?.description ?? "",
    price: existing?.price ?? 0,
    area: existing?.area ?? 0,
    beds: existing?.beds ?? 0,
    baths: existing?.baths ?? 0,
    floors: existing?.floors ?? 0,
    typeId: existing?.typeId ?? "",
    regionId: existing?.regionId ?? "",
    category: existing?.category ?? "sale" as PropertyCategory,
    status: existing?.status ?? "draft" as PropertyStatus,
  });

  const handleSave = () => {
    if (!form.title.trim() || !form.typeId || !form.regionId) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة (العنوان، النوع، المنطقة)", variant: "destructive" });
      return;
    }
    if (isEdit && params.id) {
      updateProperty(params.id, form);
    } else {
      addProperty(form);
    }
    toast({ title: "تم الحفظ", description: "تم حفظ العقار بنجاح" });
    setLocation("/admin/properties");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "تعديل عقار" : "إضافة عقار جديد"}
            </h1>
            <p className="text-muted-foreground mt-1">أدخل تفاصيل العقار لنشره على المنصة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/properties">إلغاء</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
              <Save className="ml-2 h-4 w-4" />
              حفظ ونشر
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان العقار *</Label>
                  <Input 
                    id="title" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    placeholder="مثال: فيلا فاخرة بتصميم عصري في حطين" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">وصف العقار</Label>
                  <Textarea 
                    id="desc" 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    placeholder="اكتب وصفاً مفصلاً للعقار ومميزاته..." 
                    className="min-h-[120px]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (جنيه مصري)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={form.price || ""} 
                      onChange={e => setForm({ ...form, price: Number(e.target.value) })} 
                      placeholder="0" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">المساحة (متر مربع)</Label>
                    <Input 
                      id="area" 
                      type="number" 
                      value={form.area || ""} 
                      onChange={e => setForm({ ...form, area: Number(e.target.value) })} 
                      placeholder="0" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الصور والوسائط</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground mb-1">اسحب وأفلت الصور هنا</p>
                  <p className="text-xs text-muted-foreground">أو انقر لاختيار ملفات (JPG, PNG)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التصنيف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>فئة العقار</Label>
                  <Select value={form.category} onValueChange={(val: PropertyCategory) => setForm({ ...form, category: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">للبيع</SelectItem>
                      <SelectItem value="rent">للإيجار</SelectItem>
                      <SelectItem value="furnished">شقق مفروشة</SelectItem>
                      <SelectItem value="administrative">إداري</SelectItem>
                      <SelectItem value="medical">طبي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع العقار *</Label>
                  <Select value={form.typeId} onValueChange={val => setForm({ ...form, typeId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.filter(t => t.active).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة *</Label>
                  <Select value={form.regionId} onValueChange={val => setForm({ ...form, regionId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.filter(r => r.active).map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(val: PropertyStatus) => setForm({ ...form, status: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="حالة العقار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="listed">معروض</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sold">مباعة</SelectItem>
                      <SelectItem value="rented">مؤجر</SelectItem>
                      <SelectItem value="reserved">محجوز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المرافق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds">غرف النوم</Label>
                    <Input 
                      id="beds" 
                      type="number" 
                      value={form.beds || ""} 
                      onChange={e => setForm({ ...form, beds: Number(e.target.value) })} 
                      placeholder="0" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baths">الحمامات</Label>
                    <Input 
                      id="baths" 
                      type="number" 
                      value={form.baths || ""} 
                      onChange={e => setForm({ ...form, baths: Number(e.target.value) })} 
                      placeholder="0" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floors">عدد الطوابق</Label>
                  <Input 
                    id="floors" 
                    type="number" 
                    value={form.floors || ""} 
                    onChange={e => setForm({ ...form, floors: Number(e.target.value) })} 
                    placeholder="0" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الموقع على الخريطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md h-40 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">حدد الموقع على الخريطة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

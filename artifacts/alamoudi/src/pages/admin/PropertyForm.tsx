import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, UploadCloud, MapPin } from "lucide-react";
import { useParams, Link } from "wouter";

export default function PropertyForm() {
  const params = useParams();
  const isEdit = !!params.id;

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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                  <Label htmlFor="title">عنوان العقار</Label>
                  <Input id="title" placeholder="مثال: فيلا فاخرة بتصميم عصري في حطين" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">وصف العقار</Label>
                  <Textarea id="desc" placeholder="اكتب وصفاً مفصلاً للعقار ومميزاته..." className="min-h-[120px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (جنيه مصري)</Label>
                    <Input id="price" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">المساحة (متر مربع)</Label>
                    <Input id="area" type="number" placeholder="0" />
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">البيع</SelectItem>
                      <SelectItem value="rent">الإيجار</SelectItem>
                      <SelectItem value="furnished">شقق مفروشة</SelectItem>
                      <SelectItem value="admin">إداري</SelectItem>
                      <SelectItem value="medical">طبي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع العقار</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">شقة</SelectItem>
                      <SelectItem value="duplex">دوبلكس</SelectItem>
                      <SelectItem value="penthouse">بنتهاوس</SelectItem>
                      <SelectItem value="villa">فيلا</SelectItem>
                      <SelectItem value="townhouse">تاون هاوس</SelectItem>
                      <SelectItem value="twinhouse">توين هاوس</SelectItem>
                      <SelectItem value="studio">استوديو</SelectItem>
                      <SelectItem value="shop">محل</SelectItem>
                      <SelectItem value="office">مكتب إداري</SelectItem>
                      <SelectItem value="clinic">عيادة</SelectItem>
                      <SelectItem value="medical_center">مركز طبي</SelectItem>
                      <SelectItem value="restaurant">مطعم</SelectItem>
                      <SelectItem value="cafe">كافيه</SelectItem>
                      <SelectItem value="land">أرض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tagamoa">التجمع الخامس</SelectItem>
                      <SelectItem value="beit_elwatan">بيت الوطن</SelectItem>
                      <SelectItem value="narges">النرجس</SelectItem>
                      <SelectItem value="andalus">الأندلس</SelectItem>
                      <SelectItem value="west_gam3at">غرب الجامعات</SelectItem>
                      <SelectItem value="south_academy">جنوب الأكاديمية</SelectItem>
                      <SelectItem value="mostasmereen">المستثمرين</SelectItem>
                      <SelectItem value="shorouk">الشروق</SelectItem>
                      <SelectItem value="rehab">الرحاب</SelectItem>
                      <SelectItem value="madinaty">مدينتي</SelectItem>
                      <SelectItem value="new_capital">العاصمة الإدارية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue placeholder="حالة العقار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط (معروض)</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sold">مباع</SelectItem>
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
                    <Input id="beds" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baths">الحمامات</Label>
                    <Input id="baths" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floors">عدد الطوابق</Label>
                  <Input id="floors" type="number" placeholder="0" />
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

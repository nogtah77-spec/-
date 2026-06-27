import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function Settings() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات المنصة</h1>
          <p className="text-muted-foreground mt-1">إدارة إعدادات الموقع العامة وتفضيلات النظام</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="appearance">المظهر</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>المعلومات الأساسية لمنصة التسويق العقاري</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">اسم الشركة</Label>
                  <Input id="siteName" defaultValue="العمودي للتسويق العقاري" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDesc">وصف الشركة</Label>
                  <Textarea id="siteDesc" rows={3} defaultValue="شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logoUpload">شعار الشركة</Label>
                  <Input id="logoUpload" type="file" accept="image/*" />
                  <p className="text-xs text-muted-foreground">صورة بصيغة PNG أو JPG شفافة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">رقم الهاتف</Label>
                    <Input id="contactPhone" defaultValue="+20 10 0000 0000" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone2">رقم الهاتف 2</Label>
                    <Input id="contactPhone2" placeholder="+20 11 0000 0000" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactWhatsapp">واتساب</Label>
                    <Input id="contactWhatsapp" defaultValue="+20 10 0000 0000" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                    <Input id="contactEmail" type="email" defaultValue="info@alamoudi.com" dir="ltr" className="text-right" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialTiktok">تيك توك</Label>
                    <Input id="socialTiktok" placeholder="https://tiktok.com/@alamoudi" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialFb">فيسبوك</Label>
                    <Input id="socialFb" placeholder="https://facebook.com/alamoudi" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialIg">إنستغرام</Label>
                    <Input id="socialIg" placeholder="https://instagram.com/alamoudi" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mapUrl">رابط خرائط جوجل</Label>
                    <Input id="mapUrl" placeholder="https://maps.google.com/..." dir="ltr" className="text-right" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>التحكم في التنبيهات ورسائل البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات العقارات الجديدة</Label>
                    <p className="text-sm text-muted-foreground">إرسال تنبيه عند إضافة عقار جديد</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>طلبات التواصل</Label>
                    <p className="text-sm text-muted-foreground">تنبيه عند تلقي طلب تواصل جديد من عميل</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تحديثات النظام</Label>
                    <p className="text-sm text-muted-foreground">إشعارات حول تحديثات وأعطال المنصة</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الأمان وكلمات المرور</CardTitle>
                <CardDescription>سياسات الأمان وحماية الحسابات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>فرض المصادقة الثنائية (2FA)</Label>
                    <p className="text-sm text-muted-foreground">لجميع حسابات مدراء النظام والمستشارين</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <Label htmlFor="passLength">الحد الأدنى لطول كلمة المرور</Label>
                  <Input id="passLength" type="number" defaultValue="8" className="w-32" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>المظهر</CardTitle>
                <CardDescription>تخصيص الواجهة والألوان</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">المظهر يتم التحكم به حالياً عبر نظام السمات (Theme) الخاص بالمنصة.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Save } from "lucide-react";

export default function Roles() {
  const roles = [
    { id: "admin", name: "مدير النظام", desc: "صلاحيات كاملة على جميع أجزاء المنصة" },
    { id: "agent", name: "مستشار عقاري", desc: "إدارة العقارات والرد على استفسارات العملاء" },
    { id: "customer", name: "عميل", desc: "تصفح العقارات وحفظ المفضلة وتقديم الطلبات" }
  ];

  const permissions = [
    {
      category: "إدارة العقارات",
      items: ["إضافة عقار", "تعديل عقار", "حذف عقار", "نشر العقارات"]
    },
    {
      category: "إدارة المستخدمين",
      items: ["عرض المستخدمين", "إضافة مستخدم", "تعديل صلاحيات", "حظر مستخدم"]
    },
    {
      category: "التقارير",
      items: ["عرض التحليلات", "تصدير البيانات", "سجلات النشاط"]
    },
    {
      category: "الإعدادات",
      items: ["تعديل إعدادات الموقع", "إدارة المناطق", "إدارة الأنواع"]
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الأدوار والصلاحيات</h1>
            <p className="text-muted-foreground mt-1">تحديد مستويات الوصول وصلاحيات كل دور</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="ml-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className={role.id === "admin" ? "border-accent shadow-md" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`h-5 w-5 ${role.id === "admin" ? "text-accent" : "text-muted-foreground"}`} />
                  <CardTitle>{role.name}</CardTitle>
                </div>
                <CardDescription>{role.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {permissions.map((group, i) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-semibold text-sm border-b pb-1">{group.category}</h4>
                      <div className="space-y-2">
                        {group.items.map((item, j) => (
                          <div key={j} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id={`${role.id}-${i}-${j}`} 
                              defaultChecked={role.id === "admin"} 
                              disabled={role.id === "admin"}
                            />
                            <Label htmlFor={`${role.id}-${i}-${j}`} className="text-sm font-normal cursor-pointer">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

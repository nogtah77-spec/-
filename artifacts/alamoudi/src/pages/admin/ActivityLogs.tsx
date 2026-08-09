import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Download, Search, Activity, RefreshCw, Trash2, ShieldAlert } from "lucide-react";
import { useData } from "@/context/DataContext";
import { ActivityItem } from "@/components/admin/ActivityItem";
import { RecentPropertiesPanel } from "@/components/admin/RecentPropertiesPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ACTION_LABELS: Record<string, string> = {
  created: "إضافة",
  updated: "تعديل",
  deleted: "حذف",
  status: "تغيير حالة",
  imported: "استيراد",
  login: "دخول",
  logout: "خروج",
};

const ENTITY_LABELS: Record<string, string> = {
  property: "عقار",
  property_type: "نوع عقار",
  region: "منطقة",
  user: "مستخدم",
  inquiry: "استفسار",
  finishing_request: "طلب تشطيب",
  property_request: "طلب إضافة عقار",
  customer_property_request: "طلب عميل",
  contract: "عقد",
  ad: "إعلان",
  settings: "إعدادات",
  about_page: "صفحة تعريفية",
  finishing_gallery: "معرض تشطيب",
  auth: "تسجيل الدخول",
};

export default function ActivityLogs() {
  const { activityLogs, properties, regions, propertyTypes } = useData();
  const { reload } = useData();
  const { currentUser, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    void refreshCurrentUser();
  }, [refreshCurrentUser]);

  const canClearLogs =
    currentUser?.role === "admin" ||
    (currentUser?.role === "agent" && currentUser.canClearActivityLogs);

  const actionOptions = useMemo(
    () => Array.from(new Set(activityLogs.map((log) => log.action))).sort(),
    [activityLogs],
  );

  const entityOptions = useMemo(
    () => Array.from(new Set(activityLogs.map((log) => log.entityType))).sort(),
    [activityLogs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activityLogs.filter(
      (l) =>
        (!q ||
          l.title.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q) ||
          (ACTION_LABELS[l.action] ?? l.action).toLowerCase().includes(q) ||
          (ENTITY_LABELS[l.entityType] ?? l.entityType).toLowerCase().includes(q)) &&
        (actionFilter === "all" || l.action === actionFilter) &&
        (entityFilter === "all" || l.entityType === entityFilter),
    );
  }, [activityLogs, query, actionFilter, entityFilter]);

  const refreshLogs = async () => {
    setRefreshing(true);
    try {
      await reload();
      toast({ title: "تم تحديث السجل", description: "تم جلب أحدث أنشطة المنصة." });
    } finally {
      setRefreshing(false);
    }
  };

  const clearLogs = async () => {
    setClearing(true);
    try {
      await api.del("/activity-logs");
      setClearDialogOpen(false);
      await reload();
      toast({ title: "تم تصفير سجلات النشاط", description: "تم حذف جميع السجلات نهائيًا." });
    } catch (error) {
      const status = (error as { status?: number }).status;
      toast({
        title: "تعذّر تصفير السجلات",
        description: status === 403 ? "لا تملك صلاحية تنفيذ هذا الإجراء." : "حدث خطأ أثناء حذف السجلات.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const exportCsv = () => {
    const header = ["التاريخ", "العملية", "الكيان", "النشاط", "بواسطة"];
    const rows = filtered.map((l) => [
      l.createdAt,
      ACTION_LABELS[l.action] ?? l.action,
      ENTITY_LABELS[l.entityType] ?? l.entityType,
      l.title,
      l.actor,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="سجلات النشاط"
          subtitle="تتبع التغييرات والإجراءات المتخذة في النظام"
          eyebrow="المراجعة والمتابعة"
          icon={Activity}
          actions={
            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
              <Button
                variant="outline"
                className="h-10 min-w-0 w-full gap-1.5 border-white/25 bg-white/10 px-2 text-[11px] text-white hover:border-white/40 hover:bg-white/15 hover:text-white sm:w-auto sm:gap-2 sm:px-4 sm:text-sm"
                onClick={() => void refreshLogs()}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="truncate">تحديث</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 min-w-0 w-full gap-1.5 border-white/25 bg-white/10 px-2 text-[11px] text-white hover:border-white/40 hover:bg-white/15 hover:text-white sm:w-auto sm:gap-2 sm:px-4 sm:text-sm"
                onClick={exportCsv}
                disabled={filtered.length === 0}
              >
                <Download className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="truncate">تصدير السجل</span>
              </Button>
              {canClearLogs && (
                <Button
                  variant="outline"
                  className="h-10 min-w-0 w-full gap-1.5 border-red-300/40 bg-red-500/15 px-2 text-[11px] text-red-100 hover:border-red-200/60 hover:bg-red-500/25 hover:text-white sm:w-auto sm:gap-2 sm:px-4 sm:text-sm"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={activityLogs.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate">تصفير السجلات</span>
                </Button>
              )}
            </div>
          }
        />

        <RecentPropertiesPanel
          properties={properties}
          regions={regions}
          propertyTypes={propertyTypes}
        />

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_11rem]">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في النشاط أو المنفّذ أو نوع الكيان..."
              className="pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger><SelectValue placeholder="كل العمليات" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل العمليات</SelectItem>
              {actionOptions.map((action) => (
                <SelectItem key={action} value={action}>{ACTION_LABELS[action] ?? action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger><SelectValue placeholder="كل الكيانات" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الكيانات</SelectItem>
              {entityOptions.map((entity) => (
                <SelectItem key={entity} value={entity}>{ENTITY_LABELS[entity] ?? entity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs text-muted-foreground">
            <span>{filtered.length} نتيجة معروضة من أصل {activityLogs.length}</span>
            {(query || actionFilter !== "all" || entityFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => { setQuery(""); setActionFilter("all"); setEntityFilter("all"); }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-8 w-8" />}
              title={query || actionFilter !== "all" || entityFilter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد سجلات بعد"}
              description={
                query || actionFilter !== "all" || entityFilter !== "all"
                  ? "جرّب كلمة بحث مختلفة."
                  : "ستظهر جميع الأنشطة والتغييرات في النظام هنا."
              }
              className="border-none bg-transparent py-12"
            />
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              تصفير سجلات النشاط؟
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-7">
              سيتم حذف جميع سجلات النشاط وعددها {activityLogs.length} سجلًا نهائيًا من المنصة.
              لا يمكن التراجع عن هذا الإجراء، وسيؤثر على سجل المتابعة لجميع الموظفين.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => { event.preventDefault(); void clearLogs(); }}
              disabled={clearing}
            >
              {clearing ? "جارٍ التصفير..." : "نعم، تصفير السجلات"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

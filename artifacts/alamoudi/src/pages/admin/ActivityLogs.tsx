import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Search, Activity } from "lucide-react";
import { useData } from "@/context/DataContext";
import { ActivityItem } from "@/components/admin/ActivityItem";

export default function ActivityLogs() {
  const { activityLogs } = useData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activityLogs;
    return activityLogs.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q),
    );
  }, [activityLogs, query]);

  const exportCsv = () => {
    const header = ["التاريخ", "النشاط", "بواسطة"];
    const rows = filtered.map((l) => [l.createdAt, l.title, l.actor]);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">سجلات النشاط</h1>
            <p className="text-muted-foreground mt-1">تتبع التغييرات والإجراءات المتخذة في النظام</p>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="ml-2 h-4 w-4" />
            تصدير السجل
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في السجلات..."
              className="pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-8 w-8" />}
              title={query ? "لا توجد نتائج مطابقة" : "لا توجد سجلات بعد"}
              description={
                query
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
    </AdminLayout>
  );
}

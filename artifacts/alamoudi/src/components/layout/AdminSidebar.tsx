import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Building2, MapPin, Home, Users, ShieldCheck, Settings,
  BarChart3, Activity, ArrowDownUp, MessageSquare, Wrench, ClipboardList, Database, Sparkles, Megaphone, LayoutTemplate, BookUser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { AI_ASSISTANT_ENABLED } from "@/config/features";

const sidebarItems = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/properties", label: "العقارات", icon: Building2 },
  { href: "/admin/regions", label: "المناطق", icon: MapPin },
  { href: "/admin/property-types", label: "أنواع العقارات", icon: Home },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/roles", label: "الأدوار والصلاحيات", icon: ShieldCheck },
  { separator: true },
  { href: "/admin/sources", label: "مصادر العقارات", icon: BookUser },
  { href: "/admin/inquiries", label: "استفسارات العملاء", icon: MessageSquare, badge: "inquiries" },
  { href: "/admin/property-requests", label: "طلبات إضافة عقار", icon: ClipboardList, badge: "propertyRequests" },
  { href: "/admin/finishing-requests", label: "طلبات التشطيبات", icon: Wrench, badge: "finishingRequests" },
  ...(AI_ASSISTANT_ENABLED
    ? [{ href: "/admin/ai-leads", label: "عملاء المستشار الذكي", icon: Sparkles, badge: "aiLeads" }]
    : []),
  { separator: true },
  { href: "/admin/ads",            label: "الإعلانات",    icon: Megaphone      },
  { href: "/admin/smart-banners", label: "البانر الذكي",  icon: LayoutTemplate },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/activity-logs", label: "سجلات النشاط", icon: Activity },
  { href: "/admin/import-export", label: "الاستيراد والتصدير", icon: ArrowDownUp },
  { href: "/admin/backup", label: "النسخ الاحتياطي", icon: Database },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { inquiries, propertyRequests, finishingRequests, aiLeads } = useData();

  const badgeCounts: Record<string, number> = {
    inquiries: inquiries.filter(x => x.status === "new").length,
    propertyRequests: propertyRequests.filter(x => x.status === "new").length,
    finishingRequests: finishingRequests.filter(x => x.status === "new").length,
    aiLeads: aiLeads.filter(x => x.status === "new").length,
  };

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <nav className="space-y-0.5 px-3">
        {sidebarItems.map((item, i) => {
          if ("separator" in item) {
            return <div key={i} className="my-2 border-t border-sidebar-border opacity-30" />;
          }
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          const count = item.badge ? badgeCounts[item.badge] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground opacity-70")} />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

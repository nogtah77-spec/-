import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Home,
  Users,
  ShieldCheck,
  Settings,
  BarChart3,
  Activity,
  ArrowDownUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/properties", label: "العقارات", icon: Building2 },
  { href: "/admin/regions", label: "المناطق", icon: MapPin },
  { href: "/admin/property-types", label: "أنواع العقارات", icon: Home },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/roles", label: "الأدوار والصلاحيات", icon: ShieldCheck },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/activity-logs", label: "سجلات النشاط", icon: Activity },
  { href: "/admin/import-export", label: "الاستيراد والتصدير", icon: ArrowDownUp },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="px-6 mb-6">
        <img src="/logo.png" alt="العمودي للتسويق العقاري" className="h-12 w-auto object-contain mx-auto" />
      </div>
      <nav className="space-y-1 px-3">
        {sidebarItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
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
              <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground opacity-70")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

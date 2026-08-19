import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Building2, MapPin, Home, Users, ShieldCheck, Settings, FileCheck2,
  BarChart3, Activity, ArrowDownUp, MessageSquare, Wrench, ClipboardList, Database, Sparkles, Megaphone, LayoutTemplate, BookUser, Images, Inbox, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { AI_ASSISTANT_ENABLED } from "@/config/features";

type SidebarBadge =
  | "inquiries"
  | "customerPropertyRequests"
  | "propertyRequests"
  | "finishingRequests"
  | "aiLeads";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: SidebarBadge;
  adminOnly?: boolean;
};

type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

const sidebarSections: SidebarSection[] = [
  {
    items: [
      { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    ],
  },
  {
    title: "العقارات والمعاملات",
    items: [
      { href: "/admin/properties", label: "العقارات", icon: Building2 },
      { href: "/admin/regions", label: "المناطق", icon: MapPin },
      { href: "/admin/property-types", label: "أنواع العقارات", icon: Home },
      { href: "/admin/sources", label: "مصادر العقارات", icon: BookUser },
      { href: "/admin/contracts", label: "العقود", icon: FileCheck2 },
    ],
  },
  {
    title: "العملاء والطلبات",
    items: [
      { href: "/admin/requests", label: "طلبات العملاء", icon: Inbox, badge: "customerPropertyRequests" },
      { href: "/admin/inquiries", label: "استفسارات العملاء", icon: MessageSquare, badge: "inquiries" },
      { href: "/admin/property-requests", label: "طلبات إضافة عقار", icon: ClipboardList, badge: "propertyRequests" },
      { href: "/admin/finishing-requests", label: "طلبات التشطيبات", icon: Wrench, badge: "finishingRequests" },
      { href: "/admin/finishing-gallery", label: "معرض التشطيبات", icon: Images },
      ...(AI_ASSISTANT_ENABLED
        ? [{ href: "/admin/ai-leads", label: "عملاء المستشار الذكي", icon: Sparkles, badge: "aiLeads" as const }]
        : []),
    ],
  },
  {
    title: "التسويق والمحتوى",
    items: [
      { href: "/admin/ads", label: "الإعلانات", icon: Megaphone },
      { href: "/admin/smart-banners", label: "البانر الذكي", icon: LayoutTemplate },
    ],
  },
  {
    title: "المستخدمون والصلاحيات",
    items: [
      { href: "/admin/users", label: "المستخدمين", icon: Users },
      { href: "/admin/roles", label: "الأدوار والصلاحيات", icon: ShieldCheck },
    ],
  },
  {
    title: "الذكاء الاصطناعي والأتمتة",
    items: [
      { href: "/admin/agents", label: "وكلاء الذكاء الاصطناعي", icon: Bot, adminOnly: true },
      { href: "/admin/whatsapp", label: "ربط واتساب الذكي (WhatsApp Bot)", icon: MessageSquare, adminOnly: true },
    ],
  },
  {
    title: "التقارير والنظام",
    items: [
      { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
      { href: "/admin/activity-logs", label: "سجلات النشاط", icon: Activity },
      { href: "/admin/import-export", label: "الاستيراد والتصدير", icon: ArrowDownUp, adminOnly: true },
      { href: "/admin/backup", label: "النسخ الاحتياطي", icon: Database, adminOnly: true },
      { href: "/admin/settings", label: "الإعدادات", icon: Settings },
    ],
  },
];

export function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const [location] = useLocation();
  const { inquiries, propertyRequests, finishingRequests, aiLeads, customerPropertyRequests } = useData();

  const badgeCounts: Record<string, number> = {
    inquiries: inquiries.filter(x => x.status === "new").length,
    customerPropertyRequests: customerPropertyRequests.filter(x => x.status === "new").length,
    propertyRequests: propertyRequests.filter(x => x.status === "new").length,
    finishingRequests: finishingRequests.filter(x => x.status === "new").length,
    aiLeads: aiLeads.filter(x => x.status === "new").length,
  };
  const visibleSections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain py-4 [touch-action:pan-y]">
      <nav className="space-y-0.5 px-3">
        {visibleSections.map((section, sectionIndex) => (
          <div
            key={section.title ?? "home"}
            className={cn(sectionIndex > 0 && "mt-5")}
            role="group"
            aria-label={section.title}
          >
            {section.title && (
              <div className="mb-2 flex items-center gap-2 px-3 text-xs font-bold leading-6 tracking-wide text-sidebar-foreground/80">
                <span className="h-px flex-1 bg-sidebar-border/80" />
                <span className="shrink-0">{section.title}</span>
                <span className="h-px flex-1 bg-sidebar-border/80" />
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
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
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

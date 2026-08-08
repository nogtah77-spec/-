import type { ReactNode } from "react";
import { BriefcaseBusiness } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  eyebrow = "إدارة المنصة",
  icon: Icon = BriefcaseBusiness,
  className,
}: AdminPageHeaderProps) {
  return (
    <section
      dir="rtl"
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-[#B4986B]/35 bg-[linear-gradient(135deg,#10202D_0%,#172F42_58%,#0D1B27_100%)] px-4 py-4 text-white shadow-[0_10px_28px_rgba(16,32,45,.14)] sm:px-6",
        className,
      )}
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B4986B]/40 bg-[#B4986B]/15 text-[#D6B77F]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold tracking-[.12em] text-[#D6B77F]">{eyebrow}</p>
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            <p className="mt-0.5 truncate text-xs text-white/65 sm:text-sm">{subtitle}</p>
          </div>
        </div>

        {actions && (
          <div className="relative flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
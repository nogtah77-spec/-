import { Plus, Pencil, Trash2, RefreshCw, Upload, Activity, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/context/DataContext";

const ACTION_META: Record<string, { icon: typeof Activity; cls: string }> = {
  created: { icon: Plus, cls: "text-emerald-600 bg-emerald-500/10" },
  updated: { icon: Pencil, cls: "text-blue-600 bg-blue-500/10" },
  deleted: { icon: Trash2, cls: "text-red-600 bg-red-500/10" },
  status: { icon: RefreshCw, cls: "text-amber-600 bg-amber-500/10" },
  imported: { icon: Upload, cls: "text-violet-600 bg-violet-500/10" },
  login: { icon: LogIn, cls: "text-indigo-600 bg-indigo-500/10" },
};

function metaFor(action: string) {
  return ACTION_META[action] ?? { icon: Activity, cls: "text-muted-foreground bg-muted" };
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ar });
  } catch {
    return "";
  }
}

export function ActivityItem({ log }: { log: ActivityLog }) {
  const { icon: Icon, cls } = metaFor(log.action);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn("p-2 rounded-md shrink-0", cls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{log.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {log.actor && <span>{log.actor}</span>}
          {log.actor && " · "}
          <span>{relativeTime(log.createdAt)}</span>
        </p>
      </div>
    </div>
  );
}

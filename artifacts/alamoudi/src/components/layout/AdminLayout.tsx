import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Button } from "../ui/button";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Link } from "wouter";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground dir-rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 right-0 border-l border-border bg-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="text-xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">
            العمودي للعقارات
          </Link>
          <div className="text-xs text-sidebar-foreground mt-1">لوحة التحكم</div>
        </div>
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:mr-64">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-[-8px]">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0 bg-sidebar">
                <div className="p-6 border-b border-sidebar-border">
                  <span className="text-xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">
                    العمودي للعقارات
                  </span>
                </div>
                <AdminSidebar />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-4 mr-auto">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                م
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium leading-none">مدير النظام</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Scale } from "lucide-react";

export default function Compare() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl">
      <Navbar />
      
      <main className="flex-1 bg-background py-12">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">المقارنة</h1>
            <p className="text-muted-foreground">قارن بين العقارات لتتخذ القرار الأفضل</p>
          </div>
          
          <div className="py-12">
            <EmptyState
              icon={<Scale className="h-8 w-8" />}
              title="قائمة المقارنة فارغة"
              description="أضف عقارين أو أكثر للمقارنة بين الميزات والمواصفات الخاصة بكل منها."
              action={{
                label: "تصفح العقارات",
                onClick: () => window.location.href = "/"
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

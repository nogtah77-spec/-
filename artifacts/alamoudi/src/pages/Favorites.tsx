import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Favorites() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl">
      <Navbar />
      
      <main className="flex-1 bg-background py-12">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">المفضلة</h1>
            <p className="text-muted-foreground">العقارات التي قمت بحفظها للرجوع إليها لاحقاً</p>
          </div>
          
          <div className="py-12">
            <EmptyState
              icon={<Heart className="h-8 w-8" />}
              title="لا توجد عقارات مفضلة"
              description="لم تقم بإضافة أي عقار إلى قائمة المفضلة بعد. تصفح العقارات المتاحة وأضف ما يعجبك."
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

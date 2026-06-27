import { Card, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Heart, Scale, Bed, Bath, Square } from "lucide-react";
import { Skeleton } from "./skeleton";
import type { Property } from "@/context/DataContext";

interface PropertyCardProps {
  isLoading?: boolean;
  property?: Property & { typeName?: string; regionName?: string };
}

export function PropertyCard({
  isLoading = false,
  property,
}: PropertyCardProps) {
  if (isLoading || !property) {
    return (
      <Card className="overflow-hidden hover-elevate transition-all border-border shadow-sm group">
        <Skeleton className="h-64 w-full rounded-none" />
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </CardFooter>
      </Card>
    );
  }

  const statusLabels: Record<string, string> = {
    active: "نشط",
    listed: "معروض",
    draft: "مسودة",
    sold: "مباعة",
    rented: "مؤجر",
    reserved: "محجوز",
  };

  const categoryLabels: Record<string, string> = {
    sale: "للبيع",
    rent: "للإيجار",
    furnished: "مفروش",
    administrative: "إداري",
    medical: "طبي",
    commercial: "تجاري",
  };

  return (
    <Card className="overflow-hidden hover-elevate transition-all border-border shadow-sm group cursor-pointer card-luxury">
      <div className="relative h-64 overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors z-10" />
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Badge className="bg-background/90 text-foreground backdrop-blur hover:bg-background/90 font-medium">
            {property.typeName || "عقار"}
          </Badge>
          <Badge className="bg-accent text-accent-foreground border-none font-medium">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4 z-20">
          <div className="flex items-center text-background bg-foreground/60 backdrop-blur px-2 py-1 rounded text-sm font-medium">
            <span className="opacity-90">{property.regionName || "المنطقة"}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {property.title}
          </h3>
        </div>
        <p className="text-2xl font-bold text-accent mb-6">
          {property.price.toLocaleString("ar-EG")} <span className="text-sm font-normal text-muted-foreground">ج.م</span>
        </p>
        
        <div className="flex justify-between items-center text-muted-foreground text-sm border-t pt-4">
          <div className="flex items-center gap-1.5" title="غرف النوم">
            <Bed className="h-4 w-4" />
            <span>{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5" title="الحمامات">
            <Bath className="h-4 w-4" />
            <span>{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5" title="المساحة">
            <Square className="h-4 w-4" />
            <span>{property.area} م²</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" data-testid={`button-details-${property.id}`}>
          التفاصيل
        </Button>
        <Button variant="outline" size="icon" className="text-muted-foreground hover:text-accent border-border" data-testid={`button-favorite-${property.id}`}>
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-muted-foreground hover:text-accent border-border" data-testid={`button-compare-${property.id}`}>
          <Scale className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

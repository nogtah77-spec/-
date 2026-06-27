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

export function PropertyCard({ isLoading = false, property }: PropertyCardProps) {
  if (isLoading || !property) {
    return (
      <Card className="overflow-hidden border-border shadow-sm flex flex-col h-full">
        <Skeleton className="h-52 w-full rounded-none flex-shrink-0" />
        <CardContent className="p-5 flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/2" />
          <div className="flex justify-between mt-auto pt-3 border-t border-border">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex gap-2 flex-shrink-0">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </CardFooter>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    active: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    listed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    draft: "text-gray-500 bg-gray-100 dark:bg-gray-800/40",
    sold: "text-red-600 bg-red-50 dark:bg-red-900/20",
    rented: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    reserved: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
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
    <Card className="overflow-hidden border-border shadow-sm group cursor-pointer card-luxury flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      {/* Image area */}
      <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
        <div className="absolute top-3 right-3 z-20 flex gap-1.5">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm text-xs px-2 py-0.5 font-medium">
            {property.typeName || "عقار"}
          </Badge>
          <Badge className="bg-accent text-white border-none text-xs px-2 py-0.5 font-medium">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3 z-20">
          <span className="text-white/95 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
            {property.regionName || "المنطقة"}
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors mb-2">
          {property.title}
        </h3>
        <p className="text-xl font-bold text-accent mb-auto">
          {property.price.toLocaleString("ar-EG")}{" "}
          <span className="text-xs font-normal text-muted-foreground">ج.م</span>
        </p>

        <div className="flex justify-between items-center text-muted-foreground text-xs border-t border-border mt-4 pt-4">
          <div className="flex items-center gap-1" title="غرف النوم">
            <Bed className="h-3.5 w-3.5" />
            <span>{property.beds}</span>
          </div>
          <div className="flex items-center gap-1" title="الحمامات">
            <Bath className="h-3.5 w-3.5" />
            <span>{property.baths}</span>
          </div>
          <div className="flex items-center gap-1" title="المساحة">
            <Square className="h-3.5 w-3.5" />
            <span>{property.area} م²</span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-5 pt-0 flex gap-2 flex-shrink-0">
        <Button
          className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          data-testid={`button-details-${property.id}`}
        >
          التفاصيل
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-accent border-border"
          data-testid={`button-favorite-${property.id}`}
        >
          <Heart className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-accent border-border"
          data-testid={`button-compare-${property.id}`}
        >
          <Scale className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

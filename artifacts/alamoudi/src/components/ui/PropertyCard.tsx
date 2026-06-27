import { Card, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Heart, Scale, Bed, Bath, Square, Share2, MessageCircle, Phone, Copy, Camera } from "lucide-react";
import { Skeleton } from "./skeleton";
import type { Property } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type CardSize = "large" | "medium" | "compact";

interface PropertyCardProps {
  isLoading?: boolean;
  property?: Property & { typeName?: string; regionName?: string };
  size?: CardSize;
}

export function PropertyCard({ isLoading = false, property, size = "large" }: PropertyCardProps) {
  const { settings } = useData();
  const { toast } = useToast();

  if (isLoading || !property) {
    if (size === "compact") {
      return (
        <Card className="flex flex-row h-28 overflow-hidden border-border shadow-sm">
          <Skeleton className="w-28 h-full rounded-none flex-shrink-0" />
          <div className="flex-1 p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Card>
      );
    }
    return (
      <Card className="overflow-hidden border-border shadow-sm flex flex-col h-full">
        <Skeleton className={cn("w-full rounded-none flex-shrink-0", size === "medium" ? "h-36" : "h-52")} />
        <CardContent className="p-4 flex-1 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </CardFooter>
      </Card>
    );
  }

  const categoryLabels: Record<string, string> = {
    sale: "للبيع",
    rent: "للإيجار",
    furnished: "مفروش",
    administrative: "إداري",
    medical: "طبي",
    commercial: "تجاري",
  };

  const isNew = () => {
    try {
      const created = new Date(property.createdAt);
      return Date.now() - created.getTime() < 7 * 24 * 60 * 60 * 1000;
    } catch { return false; }
  };

  const handleShare = async () => {
    const text = `${property.title} — ${property.price.toLocaleString("ar-EG")} ج.م`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "تم النسخ", description: "تم نسخ بيانات العقار" });
    }
  };

  const handleWhatsApp = () => {
    const num = settings.whatsapp.replace(/[\s+]/g, "") || settings.phone1.replace(/[\s+]/g, "");
    const text = encodeURIComponent(`مهتم بـ: ${property.title} — ${property.price.toLocaleString("ar-EG")} ج.م`);
    if (num) window.open(`https://wa.me/${num}?text=${text}`, "_blank");
    else toast({ title: "لم يتم إعداد واتساب", variant: "destructive" });
  };

  const handleCall = () => {
    const num = settings.phone1.replace(/\s/g, "");
    if (num) window.location.href = `tel:${num}`;
    else toast({ title: "لم يتم إعداد رقم الهاتف", variant: "destructive" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(property.id.toUpperCase());
    toast({ title: "تم النسخ", description: `كود العقار: ${property.id.toUpperCase()}` });
  };

  /* ─── Compact (horizontal) layout ─── */
  if (size === "compact") {
    return (
      <Card className="flex flex-row overflow-hidden border-border shadow-sm group cursor-pointer card-luxury hover:-translate-y-0.5 transition-all duration-200 h-28">
        <div className="relative w-28 flex-shrink-0 bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10" />
          <div className="absolute top-2 right-2">
            <Badge className="bg-accent text-white border-none text-[10px] px-1.5 py-0.5 font-medium">
              {categoryLabels[property.category] || "للبيع"}
            </Badge>
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {property.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{property.regionName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-accent">
              {property.price.toLocaleString("ar-EG")} <span className="text-[10px] font-normal text-muted-foreground">ج.م</span>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.beds}</span>
              <span className="flex items-center gap-0.5"><Square className="h-3 w-3" />{property.area}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const imageHeight = size === "medium" ? "h-36" : "h-52";

  /* ─── Large / Medium layout ─── */
  return (
    <Card className="overflow-hidden border-border shadow-sm group cursor-pointer card-luxury flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className={cn("relative overflow-hidden bg-muted flex-shrink-0", imageHeight)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />

        {/* Badges top-right */}
        <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1.5 max-w-[70%]">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm text-[11px] px-2 py-0.5 font-medium">
            {property.typeName || "عقار"}
          </Badge>
          <Badge className="bg-accent text-white border-none text-[11px] px-2 py-0.5 font-medium">
            {categoryLabels[property.category] || "للبيع"}
          </Badge>
        </div>

        {/* Status badges top-left */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
          {isNew() && (
            <Badge className="bg-emerald-500 text-white border-none text-[10px] px-1.5 py-0.5 font-medium w-fit">
              جديد
            </Badge>
          )}
          {property.status === "reserved" && (
            <Badge className="bg-amber-500 text-white border-none text-[10px] px-1.5 py-0.5 font-medium w-fit">
              محجوز
            </Badge>
          )}
          {property.category === "furnished" && (
            <Badge className="bg-purple-500 text-white border-none text-[10px] px-1.5 py-0.5 font-medium w-fit">
              مفروش
            </Badge>
          )}
        </div>

        {/* Region bottom-right */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="text-white/95 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
            {property.regionName || "المنطقة"}
          </span>
        </div>

        {/* Image count bottom-left */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-xs flex items-center gap-1">
            <Camera className="h-3 w-3" />
            <span>0</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className={cn("flex-1 flex flex-col", size === "medium" ? "p-4" : "p-5")}>
        <h3 className={cn(
          "font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors mb-1.5",
          size === "medium" ? "text-sm" : "text-base"
        )}>
          {property.title}
        </h3>
        <p className={cn("font-bold text-accent mb-auto", size === "medium" ? "text-lg" : "text-xl")}>
          {property.price.toLocaleString("ar-EG")}{" "}
          <span className="text-xs font-normal text-muted-foreground">ج.م</span>
        </p>
        <div className={cn(
          "flex justify-between items-center text-muted-foreground border-t border-border",
          size === "medium" ? "mt-3 pt-3 text-xs" : "mt-4 pt-4 text-xs"
        )}>
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.beds}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.baths}</span>
          <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" />{property.area} م²</span>
        </div>
      </CardContent>

      {/* Footer actions */}
      <CardFooter className={cn("flex-shrink-0 flex flex-col gap-2", size === "medium" ? "p-4 pt-0" : "p-5 pt-0")}>
        <div className="flex gap-1.5 w-full">
          <Button
            className="flex-1 h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
            data-testid={`button-details-${property.id}`}
          >
            التفاصيل
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-accent border-border"
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            title="مشاركة"
            data-testid={`button-share-${property.id}`}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-accent border-border"
            title="المفضلة"
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-accent border-border"
            title="المقارنة"
            data-testid={`button-compare-${property.id}`}
          >
            <Scale className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950/30 text-xs gap-1"
            onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
            data-testid={`button-whatsapp-${property.id}`}
          >
            <MessageCircle className="h-3 w-3" />
            واتساب
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/30 text-xs gap-1"
            onClick={(e) => { e.stopPropagation(); handleCall(); }}
            data-testid={`button-call-${property.id}`}
          >
            <Phone className="h-3 w-3" />
            اتصال
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-muted-foreground border-border hover:text-accent text-xs gap-1 px-2"
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            title="نسخ كود العقار"
            data-testid={`button-copy-${property.id}`}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

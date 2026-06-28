import { Card, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Heart, Scale, Bed, Bath, Square, Share2, MessageCircle, Phone, Copy, Camera } from "lucide-react";
import { Skeleton } from "./skeleton";
import type { Property } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { useUserPrefs } from "@/context/UserPrefsContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export type CardSize = "large" | "medium" | "compact";

interface PropertyCardProps {
  isLoading?: boolean;
  property?: Property & { typeName?: string; regionName?: string };
  size?: CardSize;
}

const categoryLabels: Record<string, string> = {
  sale: "للبيع", rent: "للإيجار", furnished: "مفروش",
  administrative: "إداري", medical: "طبي", commercial: "تجاري",
};

export function PropertyCard({ isLoading = false, property, size = "large" }: PropertyCardProps) {
  const { settings } = useData();
  const { compare, toggleFavorite, isFavorite, toggleCompare, isInCompare } = useUserPrefs();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  if (isLoading || !property) {
    if (size === "compact") {
      return (
        <Card className="flex flex-row h-28 overflow-hidden border-border shadow-sm">
          <Skeleton className="w-28 h-full rounded-none flex-shrink-0" />
          <div className="flex-1 p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-full" /></div>
        </Card>
      );
    }
    return (
      <Card className="overflow-hidden border-border shadow-sm flex flex-col h-full">
        <Skeleton className={cn("w-full rounded-none flex-shrink-0", size === "medium" ? "h-36" : "h-52")} />
        <CardContent className="p-4 flex-1 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-3 w-full" /></CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2"><Skeleton className="h-8 flex-1" /><Skeleton className="h-8 w-8" /></CardFooter>
      </Card>
    );
  }

  const heroImg = property.images?.[0];
  const isNew = () => { try { return Date.now() - new Date(property.createdAt).getTime() < 7 * 86400000; } catch { return false; } };
  const goToDetails = () => navigate(`/properties/${property.id}`);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) { try { await navigator.share({ title: property.title, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ رابط العقار" });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = (settings.whatsapp || settings.phone1).replace(/[\s+]/g, "");
    const text = encodeURIComponent(`السلام عليكم، أرغب بالاستفسار عن العقار رقم (${property.code}).`);
    if (num) window.open(`https://wa.me/${num}?text=${text}`, "_blank");
    else toast({ title: "لم يتم إعداد واتساب", variant: "destructive" });
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = settings.phone1.replace(/\s/g, "");
    if (num) window.location.href = `tel:${num}`;
    else toast({ title: "لم يتم إعداد رقم الهاتف", variant: "destructive" });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(property.code);
    toast({ title: "تم نسخ الكود", description: property.code });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFav = isFavorite(property.id);
    toggleFavorite(property.id);
    toast({ title: wasFav ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة" });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCompare(property.id) && compare.length >= 3) {
      toast({ title: "الحد الأقصى 3 عقارات للمقارنة", variant: "destructive" });
      return;
    }
    const wasIn = isInCompare(property.id);
    toggleCompare(property.id);
    toast({ title: wasIn ? "تمت الإزالة من المقارنة" : "تمت الإضافة للمقارنة" });
  };

  if (size === "compact") {
    return (
      <Card onClick={goToDetails} className="flex flex-row overflow-hidden border-border shadow-sm group cursor-pointer card-luxury hover:-translate-y-0.5 transition-all duration-200 h-28">
        <div className="relative w-28 flex-shrink-0 bg-muted overflow-hidden">
          {heroImg ? <img src={heroImg} alt={property.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />}
          <div className="absolute top-2 right-2">
            <Badge className="bg-accent text-white border-none text-[10px] px-1.5 py-0.5">{categoryLabels[property.category] || "للبيع"}</Badge>
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{property.code}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{property.regionName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-accent">{property.price.toLocaleString("en-US")} <span className="text-[10px] font-normal text-muted-foreground">EGP</span></p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {property.beds > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.beds}</span>}
              <span className="flex items-center gap-0.5"><Square className="h-3 w-3" />{property.area}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const imageHeight = size === "medium" ? "h-36" : "h-52";

  return (
    <Card onClick={goToDetails} className="overflow-hidden border-border shadow-sm group cursor-pointer card-luxury flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      <div className={cn("relative overflow-hidden bg-muted flex-shrink-0", imageHeight)}>
        {heroImg
          ? <img src={heroImg} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><Camera className="h-10 w-10 text-muted-foreground/30" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />

        <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1.5 max-w-[70%]">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm text-[11px] px-2 py-0.5">{property.typeName || "عقار"}</Badge>
          <Badge className="bg-accent text-white border-none text-[11px] px-2 py-0.5">{categoryLabels[property.category] || "للبيع"}</Badge>
        </div>

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
          {property.featured && <Badge className="bg-yellow-500 text-white border-none text-[10px] px-1.5 py-0.5">مميز</Badge>}
          {isNew() && <Badge className="bg-emerald-500 text-white border-none text-[10px] px-1.5 py-0.5">جديد</Badge>}
          {property.status === "reserved" && <Badge className="bg-amber-500 text-white border-none text-[10px] px-1.5 py-0.5">محجوز</Badge>}
          {property.category === "furnished" && <Badge className="bg-purple-500 text-white border-none text-[10px] px-1.5 py-0.5">مفروش</Badge>}
        </div>

        {property.regionName && (
          <div className="absolute bottom-3 right-3 z-20">
            <span className="text-white/95 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-xs">{property.regionName}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-xs flex items-center gap-1">
            <Camera className="h-3 w-3" />{property.images?.length || 0}
          </span>
        </div>
      </div>

      <CardContent className={cn("flex-1 flex flex-col", size === "medium" ? "p-4" : "p-5")}>
        <h3 className={cn("font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors mb-1.5", size === "medium" ? "text-base" : "text-lg")}>
          {property.code}
        </h3>
        <p className={cn("font-bold text-accent mb-auto", size === "medium" ? "text-lg" : "text-xl")}>
          {property.price.toLocaleString("en-US")} <span className="text-xs font-normal text-muted-foreground">EGP</span>
        </p>
        <div className={cn("flex justify-between items-center text-muted-foreground border-t border-border", size === "medium" ? "mt-3 pt-3 text-xs" : "mt-4 pt-4 text-xs")}>
          {property.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.beds}</span>}
          {property.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.baths}</span>}
          <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" />{property.area} م²</span>
        </div>
      </CardContent>

      <CardFooter className={cn("flex-shrink-0 flex flex-col gap-2", size === "medium" ? "p-4 pt-0" : "p-5 pt-0")}>
        <div className="flex gap-1.5 w-full">
          <Button onClick={(e) => { e.stopPropagation(); goToDetails(); }} className="flex-1 h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium">
            التفاصيل
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-border" onClick={handleShare} title="مشاركة"><Share2 className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon"
            className={cn("h-8 w-8 border-border", isFavorite(property.id) ? "text-red-500 border-red-200" : "")}
            onClick={handleFavorite} title="المفضلة">
            <Heart className={cn("h-3.5 w-3.5", isFavorite(property.id) ? "fill-red-500" : "")} />
          </Button>
          <Button variant="outline" size="icon"
            className={cn("h-8 w-8 border-border", isInCompare(property.id) ? "text-accent border-accent/30" : "")}
            onClick={handleCompare} title="مقارنة">
            <Scale className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5 w-full">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950/30 text-xs gap-1" onClick={handleWhatsApp}>
            <MessageCircle className="h-3 w-3" />واتساب
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/30 text-xs gap-1" onClick={handleCall}>
            <Phone className="h-3 w-3" />اتصال
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-muted-foreground border-border hover:text-accent text-xs gap-1 px-2" onClick={handleCopy} title="نسخ الكود">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

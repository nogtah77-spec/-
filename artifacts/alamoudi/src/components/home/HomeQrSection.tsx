import { useData } from "@/context/DataContext";
import { QrCodeView } from "@/components/ui/QrCodeView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Phone, Globe, QrCode as QrIcon, ExternalLink, Copy,
  Check, Smartphone
} from "lucide-react";
import { WhatsAppIcon, TikTokIcon } from "@/components/icons/BrandIcons";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function HomeQrSection() {
  const { settings } = useData();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const qrCodes = (settings.qrCodes || []).filter(
    (q) => q.active !== false && q.showInHome !== false
  );

  if (qrCodes.length === 0) return null;

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "تم نسخ الرابط بنجاح" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (icon?: string) => {
    switch (icon) {
      case "whatsapp":
        return <WhatsAppIcon className="h-5 w-5 fill-[#25D366]" />;
      case "location":
        return <MapPin className="h-5 w-5 text-red-500" />;
      case "tiktok":
        return <TikTokIcon className="h-5 w-5 text-black dark:text-white" />;
      case "website":
        return <Globe className="h-5 w-5 text-blue-500" />;
      case "phone":
        return <Phone className="h-5 w-5 text-amber-500" />;
      default:
        return <QrIcon className="h-5 w-5 text-accent" />;
    }
  };

  return (
    <section className="py-10 sm:py-14 border-t border-border/70 bg-transparent relative overflow-hidden">
      {/* Subtle luxury glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10">
        {/* Compact Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <Badge className="bg-accent/15 text-accent border border-accent/30 px-2.5 py-0.5 text-[11px] mb-2 rounded-full font-bold">
            <Smartphone className="h-3 w-3 ml-1" />
            امسح بكاميرا هاتفك
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            روابط سريعة عبر الـ QR Code
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            امسح الرمز المباشر للانتقال الفوري للواتساب أو اللوكيشن أو تصفح المنصة
          </p>
        </div>

        {/* Compact QR Cards Grid */}
        <div
          className={cn(
            "grid gap-3 sm:gap-4 justify-center",
            qrCodes.length === 1 && "grid-cols-1 max-w-xs mx-auto",
            qrCodes.length === 2 && "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto",
            qrCodes.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
          )}
        >
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="group rounded-2xl bg-card border border-border/80 hover:border-accent/50 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Header Icon & Title */}
              <div className="flex items-center gap-2 mb-2 w-full justify-center">
                <div className="h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  {getIcon(qr.icon)}
                </div>
                <div className="text-right min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                    {qr.title}
                  </h3>
                  {qr.subtitle && (
                    <p className="text-[10px] text-muted-foreground truncate">{qr.subtitle}</p>
                  )}
                </div>
              </div>

              {/* QR Code Canvas/Image (Compact Mini Box) */}
              <div className="my-1.5 p-1.5 rounded-xl bg-white shadow-xs border border-gray-200 group-hover:border-accent/40 transition-colors">
                <QrCodeView
                  url={qr.url}
                  imageUrl={qr.imageUrl}
                  type={qr.type}
                  size={96}
                  alt={qr.title}
                />
              </div>

              {/* Action Buttons */}
              {qr.url && (
                <div className="w-full flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-[11px] gap-1 rounded-lg border-border/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <a href={qr.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      فتح الرابط
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-lg"
                    onClick={() => handleCopy(qr.id, qr.url)}
                    title="نسخ الرابط"
                  >
                    {copiedId === qr.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

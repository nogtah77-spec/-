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
    <section className="py-14 sm:py-20 border-t border-border/70 bg-gradient-to-b from-background via-card/40 to-background relative overflow-hidden">
      {/* Subtle luxury glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <Badge className="bg-accent/15 text-accent border border-accent/30 px-3 py-1 text-xs mb-3.5 rounded-full font-bold">
            <Smartphone className="h-3.5 w-3.5 ml-1.5" />
            امسح بكاميرا هاتفك للوصول الفوري
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            روابط وتواصل سريع عبر الـ QR Code
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            وجّه كاميرا هاتفك نحو أي رمز للانتقال المباشر للموقع أو محادثة الواتساب أو تصفح المنصة
          </p>
        </div>

        {/* QR Cards Grid */}
        <div
          className={cn(
            "grid gap-4 sm:gap-6 justify-center",
            qrCodes.length === 1 && "grid-cols-1 max-w-sm mx-auto",
            qrCodes.length === 2 && "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto",
            qrCodes.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
          )}
        >
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="group rounded-3xl bg-card border border-border/80 hover:border-accent/50 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Header Icon & Title */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  {getIcon(qr.icon)}
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    {qr.title}
                  </h3>
                  {qr.subtitle && (
                    <p className="text-[11px] text-muted-foreground">{qr.subtitle}</p>
                  )}
                </div>
              </div>

              {/* QR Code Canvas/Image */}
              <div className="my-3 p-3 rounded-2xl bg-white shadow-inner border border-gray-200 group-hover:border-accent/40 transition-colors">
                <QrCodeView
                  url={qr.url}
                  imageUrl={qr.imageUrl}
                  type={qr.type}
                  size={150}
                  alt={qr.title}
                />
              </div>

              {/* Action Buttons */}
              {qr.url && (
                <div className="w-full flex items-center gap-2 mt-2 pt-3 border-t border-border/60">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 rounded-xl border-border/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <a href={qr.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      فتح الرابط
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl"
                    onClick={() => handleCopy(qr.id, qr.url)}
                    title="نسخ الرابط"
                  >
                    {copiedId === qr.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
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

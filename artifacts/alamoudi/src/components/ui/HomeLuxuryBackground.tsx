import React from "react";
import { useTheme } from "next-themes";
import { useData, BackgroundPatternType } from "@/context/DataContext";

interface HomeLuxuryBackgroundProps {
  className?: string;
}

export function HomeLuxuryBackground({ className = "" }: HomeLuxuryBackgroundProps) {
  const { settings } = useData();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const bgConfig = settings?.homeBackgroundSettings;

  if (bgConfig && bgConfig.enabled === false) {
    return null;
  }

  const pattern: BackgroundPatternType = isDark
    ? (bgConfig?.patternDark || "architectural")
    : (bgConfig?.patternLight || "marble_waves");

  const opacityPercent = isDark
    ? (bgConfig?.opacityDark ?? 45)
    : (bgConfig?.opacityLight ?? 30);

  const blurAmount = isDark
    ? (bgConfig?.blurDark ?? 0)
    : (bgConfig?.blurLight ?? 0);

  const customImg = isDark
    ? bgConfig?.customImageDark
    : bgConfig?.customImageLight;

  const opacity = Math.max(0, Math.min(100, opacityPercent)) / 100;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 transition-opacity duration-700 ease-out ${className}`}
      style={{
        opacity,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {/* Pattern 1: Architectural Blueprint Lines & Coordinates */}
      {pattern === "architectural" && (
        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="arch-pattern-grid"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke={isDark ? "rgba(184, 142, 75, 0.18)" : "rgba(184, 142, 75, 0.22)"}
                  strokeWidth="0.75"
                />
                <path
                  d="M 40 0 L 40 80 M 0 40 L 80 40"
                  fill="none"
                  stroke={isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(16, 32, 45, 0.04)"}
                  strokeWidth="0.5"
                  strokeDasharray="2,4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="1.5"
                  fill={isDark ? "#B88E4B" : "#A67C38"}
                  opacity={isDark ? "0.4" : "0.5"}
                />
              </pattern>
              <linearGradient id="arch-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? "#0B131B" : "#FFFFFF"} stopOpacity="0" />
                <stop offset="50%" stopColor={isDark ? "#B88E4B" : "#B88E4B"} stopOpacity={isDark ? "0.08" : "0.06"} />
                <stop offset="100%" stopColor={isDark ? "#0B131B" : "#FFFFFF"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#arch-pattern-grid)" />
            <rect width="100%" height="100%" fill="url(#arch-grad)" />
          </svg>
        </div>
      )}

      {/* Pattern 2: Royal Mashrabiya / Islamic Geometric Arabesque */}
      {pattern === "mashrabiya" && (
        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="mashrabiya-pattern"
                width="64"
                height="64"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M32 0 L64 32 L32 64 L0 32 Z"
                  fill="none"
                  stroke={isDark ? "rgba(184, 142, 75, 0.16)" : "rgba(184, 142, 75, 0.2)"}
                  strokeWidth="0.8"
                />
                <path
                  d="M16 16 L48 16 L48 48 L16 48 Z"
                  fill="none"
                  stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 32, 45, 0.05)"}
                  strokeWidth="0.5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="3"
                  fill="none"
                  stroke={isDark ? "rgba(184, 142, 75, 0.3)" : "rgba(184, 142, 75, 0.35)"}
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mashrabiya-pattern)" />
          </svg>
        </div>
      )}

      {/* Pattern 3: Minimalist Luxury Micro-Grid */}
      {pattern === "luxury_grid" && (
        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="luxury-grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 32, 45, 0.06)"}
                  strokeWidth="0.5"
                />
                <path
                  d="M 18 20 L 22 20 M 20 18 L 20 22"
                  stroke={isDark ? "rgba(184, 142, 75, 0.25)" : "rgba(184, 142, 75, 0.3)"}
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#luxury-grid-pattern)" />
          </svg>
        </div>
      )}

      {/* Pattern 4: Organic Topography / Marble Contour Waves */}
      {pattern === "marble_waves" && (
        <div className="absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="marble-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? "#B88E4B" : "#B88E4B"} stopOpacity="0.25" />
                <stop offset="50%" stopColor={isDark ? "#10202D" : "#E2E8F0"} stopOpacity="0.1" />
                <stop offset="100%" stopColor={isDark ? "#B88E4B" : "#B88E4B"} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#marble-stroke)" strokeWidth="1.2">
              <path d="M-100,150 C200,300 450,50 800,200 C1150,350 1300,100 1600,250" />
              <path d="M-100,280 C250,420 500,180 850,320 C1200,460 1350,220 1600,380" />
              <path d="M-100,420 C300,560 550,320 900,460 C1250,600 1400,360 1600,520" />
              <path d="M-100,580 C350,720 600,480 950,620 C1300,760 1450,520 1600,680" />
              <path d="M-100,750 C400,890 650,650 1000,790 C1350,930 1500,690 1600,850" />
            </g>
          </svg>
        </div>
      )}

      {/* Pattern 5: Ambient Aurora / Atmospheric Glow */}
      {pattern === "ambient_aurora" && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            className="absolute -top-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(184,142,75,0.18) 0%, rgba(16,32,45,0) 70%)"
                : "radial-gradient(circle, rgba(184,142,75,0.15) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
          <div
            className="absolute top-[40%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[140px]"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(22,35,48,0.35) 0%, rgba(11,19,27,0) 70%)"
                : "radial-gradient(circle, rgba(226,232,240,0.4) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
          <div
            className="absolute bottom-[5%] right-[25%] w-[550px] h-[550px] rounded-full blur-[130px]"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(184,142,75,0.12) 0%, rgba(16,32,45,0) 70%)"
                : "radial-gradient(circle, rgba(184,142,75,0.1) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
        </div>
      )}

      {/* Pattern 6: Custom Image Background */}
      {pattern === "custom" && customImg && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${customImg})` }}
        />
      )}
    </div>
  );
}

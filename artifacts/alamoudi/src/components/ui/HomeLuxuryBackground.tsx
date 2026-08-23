import React from "react";
import { useTheme } from "next-themes";
import { useData, type HomeBackgroundSettings } from "@/context/DataContext";

interface HomeLuxuryBackgroundProps {
  className?: string;
  forcedTheme?: "dark" | "light";
  overrideConfig?: Partial<HomeBackgroundSettings>;
}

const DEFAULT_DARK_IMG = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80"; // Luxury Night Skyscrapers & Golden Lights
const DEFAULT_LIGHT_IMG = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"; // Luxury Villa with Pool & Palm Trees

export function HomeLuxuryBackground({ className = "", forcedTheme, overrideConfig }: HomeLuxuryBackgroundProps) {
  const { settings } = useData();
  const { resolvedTheme } = useTheme();

  const isDark = forcedTheme ? forcedTheme === "dark" : resolvedTheme === "dark";
  const baseConfig = settings?.homeBackgroundSettings;
  const bgConfig = overrideConfig ? { ...(baseConfig || {}), ...overrideConfig } : baseConfig;

  if (bgConfig && bgConfig.enabled === false) {
    return null;
  }

  const bgImage = isDark
    ? (bgConfig?.bgImageDark || DEFAULT_DARK_IMG)
    : (bgConfig?.bgImageLight || DEFAULT_LIGHT_IMG);

  const overlayColor = isDark
    ? (bgConfig?.overlayColorDark || "#0B131B")
    : (bgConfig?.overlayColorLight || "#F8FAFC");

  const overlayOpacityPercent = isDark
    ? (bgConfig?.overlayOpacityDark ?? 75)
    : (bgConfig?.overlayOpacityLight ?? 80);

  const blurAmount = isDark
    ? (bgConfig?.blurDark ?? 1)
    : (bgConfig?.blurLight ?? 1);

  const imageOpacityPercent = isDark
    ? (bgConfig?.imageOpacityDark ?? 90)
    : (bgConfig?.imageOpacityLight ?? 85);

  const imgOpacity = Math.max(0, Math.min(100, imageOpacityPercent)) / 100;
  const overlayOpacity = Math.max(0, Math.min(100, overlayOpacityPercent)) / 100;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      {/* 1. Underlying High-Definition Image Layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-300 ease-out transform-gpu"
        style={{
          backgroundImage: `url("${bgImage}")`,
          opacity: imgOpacity,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
          transform: blurAmount > 0 ? "scale(1.05)" : "scale(1)", // Prevent blur clipping at boundaries
        }}
      />

      {/* 2. Primary Solid/Translucent Color Overlay Layer */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-300"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />

      {/* 3. Subtle Ambient Luxury Vignette & Contrast Depth */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 20%, rgba(184, 142, 75, 0.08) 0%, rgba(11, 19, 27, 0.4) 60%, rgba(11, 19, 27, 0.8) 100%)"
            : "radial-gradient(ellipse at 50% 20%, rgba(184, 142, 75, 0.05) 0%, rgba(248, 250, 252, 0.3) 60%, rgba(248, 250, 252, 0.75) 100%)",
        }}
      />
    </div>
  );
}

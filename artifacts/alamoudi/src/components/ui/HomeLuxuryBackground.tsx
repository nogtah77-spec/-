import React from "react";
import { useTheme } from "next-themes";
import { useData, type HomeBackgroundSettings } from "@/context/DataContext";

interface HomeLuxuryBackgroundProps {
  className?: string;
  forcedTheme?: "dark" | "light";
  overrideConfig?: Partial<HomeBackgroundSettings>;
}

const DEFAULT_DARK_IMG = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80"; // Luxury Night Skyscrapers & Golden Lights
const DEFAULT_LIGHT_IMG = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"; // Luxury Sunlit Villa with Crystal Pool

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

  // Solid base color behind the image to prevent white bleed-through in dark mode
  const baseBackdropColor = isDark ? (overlayColor || "#0B131B") : (overlayColor || "#F8FAFC");

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      style={{ backgroundColor: baseBackdropColor }}
    >
      {/* 1. Underlying High-Definition Image Layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-300 ease-out transform-gpu"
        style={{
          backgroundImage: `url("${bgImage}")`,
          opacity: imgOpacity,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
          transform: blurAmount > 0 ? "scale(1.06)" : "scale(1)", // Prevent blur border bleed
        }}
      />

      {/* 2. Primary Solid/Translucent Color Overlay Layer */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-300 pointer-events-none"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />
    </div>
  );
}

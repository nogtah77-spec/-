import React from "react";
import { useTheme } from "next-themes";
import { useData, type HomeBackgroundSettings } from "@/context/DataContext";

interface HomeLuxuryBackgroundProps {
  className?: string;
  forcedTheme?: "dark" | "light";
  overrideConfig?: Partial<HomeBackgroundSettings>;
  isFixed?: boolean;
}

const DEFAULT_DARK_IMG = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80"; // Dubai Gold lights
const DEFAULT_LIGHT_IMG = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"; // Luxury Villa pool

export function HomeLuxuryBackground({
  className = "",
  forcedTheme,
  overrideConfig,
}: HomeLuxuryBackgroundProps) {
  const { settings } = useData();
  const { resolvedTheme } = useTheme();

  const isDark = forcedTheme ? forcedTheme === "dark" : resolvedTheme === "dark";
  const baseConfig = settings?.homeBackgroundSettings;
  const bgConfig = overrideConfig ? { ...(baseConfig || {}), ...overrideConfig } : baseConfig;

  // If explicitly disabled by admin, don't render
  if (bgConfig && bgConfig.enabled === false) {
    return null;
  }

  const bgImage = isDark
    ? (bgConfig?.bgImageDark || DEFAULT_DARK_IMG)
    : (bgConfig?.bgImageLight || DEFAULT_LIGHT_IMG);

  const overlayColor = isDark
    ? (bgConfig?.overlayColorDark || "#000000")
    : (bgConfig?.overlayColorLight || "#FFFFFF");

  const overlayOpacityPercent = isDark
    ? (bgConfig?.overlayOpacityDark ?? 30)
    : (bgConfig?.overlayOpacityLight ?? 35);

  const blurAmount = isDark
    ? (bgConfig?.blurDark ?? 0)
    : (bgConfig?.blurLight ?? 0);

  const imageOpacityPercent = isDark
    ? (bgConfig?.imageOpacityDark ?? 100)
    : (bgConfig?.imageOpacityLight ?? 100);

  const imgOpacity = Math.max(0.1, Math.min(100, imageOpacityPercent)) / 100;
  const overlayOpacity = Math.max(0, Math.min(100, overlayOpacityPercent)) / 100;

  const isSimulator = !!overrideConfig;
  const positionClass = isSimulator
    ? "absolute inset-0 w-full h-full z-0 pointer-events-none"
    : "fixed inset-0 w-full h-full z-0 pointer-events-none";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden select-none ${positionClass} ${className}`}
    >
      {/* 1. Underlying High-Definition Image Layer via <img> for 100% reliable decoding across all devices */}
      <img
        key={bgImage}
        src={bgImage}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-300 transform-gpu"
        style={{
          opacity: imgOpacity,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
          transform: blurAmount > 0 ? "scale(1.06)" : "scale(1)",
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

      {/* 3. Subtle luxury vignette to blend edges seamlessly */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-300 pointer-events-none opacity-30"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
            : "radial-gradient(ellipse at center, transparent 50%, rgba(255,255,255,0.6) 100%)",
        }}
      />
    </div>
  );
}

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

  // Simulator preview ALWAYS renders regardless of enabled flag
  const isSimulator = !!overrideConfig;
  if (!isSimulator && bgConfig && bgConfig.enabled === false) {
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

  // Locks firmly to screen viewport without mobile browser address-bar jitter
  const positionClass = isSimulator
    ? "absolute inset-0 w-full h-full z-0 pointer-events-none"
    : "fixed top-0 left-0 w-screen h-screen min-h-[100dvh] z-0 pointer-events-none transform-gpu";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden select-none ${positionClass} ${className}`}
      style={{
        transform: "translate3d(0,0,0)",
        WebkitTransform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* 1. Underlying High-Definition Image Layer (transition only opacity, not dimensions/transform) */}
      <img
        key={bgImage}
        src={bgImage}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300"
        style={{
          opacity: imgOpacity,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
          transform: blurAmount > 0 ? "scale(1.06)" : undefined,
        }}
      />

      {/* 2. Primary Solid/Translucent Color Overlay Layer */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />

      {/* 3. Subtle luxury vignette */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none opacity-30"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
            : "radial-gradient(ellipse at center, transparent 50%, rgba(255,255,255,0.6) 100%)",
        }}
      />
    </div>
  );
}

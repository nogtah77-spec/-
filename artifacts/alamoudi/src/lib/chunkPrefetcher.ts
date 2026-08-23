/**
 * Background Chunk & Route Prefetcher for 100% Seamless Offline PWA Operation.
 * Pre-warms all lazy-loaded routes and chunks during idle time when online,
 * ensuring every single page, admin tab, and feature opens instantly offline.
 */
export function prefetchAppChunks() {
  if (typeof window === "undefined") return;

  const prefetch = () => {
    // Only prefetch when online to warm up Service Worker caches
    if (!navigator.onLine) return;

    const routes = [
      () => import("@/pages/Home"),
      () => import("@/pages/About"),
      () => import("@/pages/AddProperty"),
      () => import("@/pages/Consultation"),
      () => import("@/pages/FinishingServices"),
      () => import("@/pages/PrivacyPolicy"),
      () => import("@/pages/PropertyDetails"),
      () => import("@/pages/Favorites"),
      () => import("@/pages/Compare"),
      () => import("@/pages/Login"),
      () => import("@/pages/RegionPage"),
      () => import("@/pages/admin/Dashboard"),
      () => import("@/pages/admin/Properties"),
      () => import("@/pages/admin/PropertyForm"),
      () => import("@/pages/admin/Regions"),
      () => import("@/pages/admin/PropertyTypes"),
      () => import("@/pages/admin/Users"),
      () => import("@/pages/admin/Roles"),
      () => import("@/pages/admin/Settings"),
      () => import("@/pages/admin/Analytics"),
      () => import("@/pages/admin/ActivityLogs"),
      () => import("@/pages/admin/ImportExport"),
      () => import("@/pages/admin/Inquiries"),
      () => import("@/pages/admin/CustomerRequests"),
      () => import("@/pages/admin/Contracts"),
      () => import("@/pages/admin/PropertyRequests"),
      () => import("@/pages/admin/FinishingRequests"),
      () => import("@/pages/admin/AiLeads"),
      () => import("@/pages/admin/Backup"),
      () => import("@/pages/admin/Ads"),
      () => import("@/pages/admin/AdAnalytics"),
      () => import("@/pages/admin/SmartBanners"),
      () => import("@/pages/admin/Sources"),
      () => import("@/pages/admin/AiAgents"),
      () => import("@/pages/admin/WhatsAppBot"),
      () => import("@/pages/admin/MortgageCalculatorPage"),
      () => import("@/pages/admin/FinishingGallery"),
      () => import("@/components/ai/AIChatWidget"),
    ];

    // Sequentially load chunks in background without starving UI thread
    routes.forEach((loadChunk, index) => {
      setTimeout(() => {
        if (navigator.onLine) {
          loadChunk().catch(() => {});
        }
      }, 150 * (index + 1));
    });
  };

  // Run when browser is idle after initial render
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 1000);
  }
}

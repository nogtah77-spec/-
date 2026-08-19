/**
 * Dynamic OpenGraph and Meta Tag manager for client-side pages
 */

export interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
}

export function updatePageMeta({
  title,
  description,
  image,
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
}: PageMetaOptions) {
  if (typeof document === "undefined") return;

  const baseTitle = "العمودي للتسويق العقاري";
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  document.title = fullTitle;

  const defaultDesc = "شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر.";
  const finalDesc = description || defaultDesc;

  // Helper to set or create meta tag
  const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      if (isProperty) {
        el.setAttribute("property", nameOrProperty);
      } else {
        el.setAttribute("name", nameOrProperty);
      }
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };

  // Standard SEO
  setMeta("description", finalDesc);

  // OpenGraph (Facebook, WhatsApp, Telegram, LinkedIn)
  setMeta("og:title", fullTitle, true);
  setMeta("og:description", finalDesc, true);
  setMeta("og:url", url, true);
  setMeta("og:type", type, true);
  setMeta("og:site_name", baseTitle, true);

  if (image) {
    setMeta("og:image", image, true);
    setMeta("og:image:alt", fullTitle, true);
  }

  // Twitter Cards
  setMeta("twitter:card", image ? "summary_large_image" : "summary");
  setMeta("twitter:title", fullTitle);
  setMeta("twitter:description", finalDesc);
  if (image) {
    setMeta("twitter:image", image);
  }
}

/**
 * Property Draft Service
 * Provides real-time auto-saving and recovery for unfinished property entries (TikTok style).
 */

export interface PropertyDraftData {
  form: Record<string, any>;
  images: string[];
  aiText?: string;
  updatedAt: number; // timestamp ms
  previewTitle: string;
  previewSummary?: string;
  isEdit?: boolean;
  editPropertyId?: string;
}

const STORAGE_KEY = "alm_property_form_active_draft";
const DISMISS_SESSION_KEY = "alm_draft_banner_dismissed_until";

/**
 * Checks if the current form has meaningful data worth saving
 */
export function hasMeaningfulData(form: Record<string, any>, images: string[], aiText?: string): boolean {
  if (images && images.length > 0) return true;
  if (aiText && aiText.trim().length > 10) return true;
  if (form.code && form.code.trim().length > 0) return true;
  if (form.price && Number(form.price) > 0) return true;
  if (form.area && Number(form.area) > 0) return true;
  if (form.description && form.description.trim().length > 10) return true;
  if (form.location && form.location.trim().length > 3) return true;
  if (form.subArea && form.subArea.trim().length > 2) return true;
  return false;
}

/**
 * Saves the draft to localStorage and dispatches change event
 */
export function savePropertyDraft(draft: PropertyDraftData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    // Reset session dismissal when user makes fresh edits
    sessionStorage.removeItem(DISMISS_SESSION_KEY);
    window.dispatchEvent(new CustomEvent("alm-property-draft-changed", { detail: draft }));
  } catch (e) {
    console.warn("Failed to save property draft to localStorage:", e);
  }
}

/**
 * Loads the active draft from localStorage
 */
export function loadPropertyDraft(): PropertyDraftData | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PropertyDraftData;
    // Expire drafts older than 14 days
    if (Date.now() - parsed.updatedAt > 14 * 24 * 60 * 60 * 1000) {
      clearPropertyDraft();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Clears the active draft
 */
export function clearPropertyDraft(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(DISMISS_SESSION_KEY);
    window.dispatchEvent(new CustomEvent("alm-property-draft-changed", { detail: null }));
  } catch (e) {
    console.warn("Failed to clear property draft:", e);
  }
}

/**
 * Dismisses the recovery banner for the current session (Save as draft mode)
 */
export function dismissDraftBanner(): void {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(DISMISS_SESSION_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent("alm-property-draft-changed"));
  } catch {}
}

/**
 * Checks if the user dismissed the banner in the current session
 */
export function isDraftBannerDismissed(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(DISMISS_SESSION_KEY);
  } catch {
    return false;
  }
}

/**
 * Formats relative time in Arabic (منذ دقيقتين، منذ ساعة، إلخ)
 */
export function formatArabicRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "الآن";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "منذ دقيقة";
  if (diffMin === 2) return "منذ دقيقتين";
  if (diffMin <= 10) return `منذ ${diffMin} دقائق`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "منذ ساعة";
  if (diffHours === 2) return "منذ ساعتين";
  if (diffHours <= 10) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "منذ يوم";
  if (diffDays === 2) return "منذ يومين";
  return `منذ ${diffDays} أيام`;
}

import { sendRealtimeSync } from "@/context/DataContext";
import { supabase } from "@/lib/supabaseClient";

export interface PushNotificationPayload {
  id?: string;
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  createdAt?: string;
  sentBy?: string;
}

const STORAGE_KEY_PERMISSION = "alm_push_permission_prompted";
const STORAGE_KEY_HISTORY = "alm_notifications_history";

/**
 * Check if Browser supports Web Push and Notifications
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from user with graceful error handling
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(STORAGE_KEY_PERMISSION, "true");
    
    if (permission === "granted") {
      // Send an immediate welcome confirmation notification
      await showLocalNotification({
        title: "العمودي للتسويق العقاري",
        body: "تم تفعيل الإشعارات الفورية بنجاح! ستصلك أحدث العروض والفرص العقارية الحصرية فور طرحها.",
        url: "/",
        tag: "welcome-alert",
      });
    }

    return permission;
  } catch (error) {
    console.warn("Failed to request notification permission:", error);
    return "denied";
  }
}

/**
 * Display a native OS notification on the current device
 */
export async function showLocalNotification(payload: PushNotificationPayload): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const title = payload.title || "العمودي للتسويق العقاري";
  const options: NotificationOptions = {
    body: payload.body || "فرصة عقارية جديدة متاحة الآن في المنصة.",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/logo.png",
    dir: "rtl",
    lang: "ar",
    tag: payload.tag || `alm-alert-${Date.now()}`,
    renotify: true,
    data: {
      url: payload.url || "/",
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200] as any,
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }

    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn("Error showing local notification:", err);
    return false;
  }
}

/**
 * Broadcast a push notification to all subscribers worldwide via Realtime Cloud WebSocket
 */
export async function broadcastPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  const fullPayload: PushNotificationPayload = {
    ...payload,
    id: payload.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/logo.png",
    createdAt: new Date().toISOString(),
    url: payload.url || "/",
  };

  // 1. Show locally immediately on the sender's device if permitted
  if (getNotificationPermission() === "granted") {
    showLocalNotification(fullPayload).catch(() => {});
  }

  // 2. Realtime Broadcast across all connected devices and browser instances
  sendRealtimeSync("PUSH_NOTIFICATION", fullPayload);

  // 3. Save to History (LocalStorage + Supabase Store)
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history: PushNotificationPayload[] = raw ? JSON.parse(raw) : [];
    history.unshift(fullPayload);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));

    // Save to Supabase
    if (supabase) {
      supabase.from("properties").upsert({
        id: "__notifications_history_store__",
        code: "__NOTIF_STORE__",
        title: "Notifications History Store",
        description: JSON.stringify(history.slice(0, 50)),
        price: 0,
        area: 0,
        status: "archived",
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }
  } catch {}

  return true;
}

/**
 * Fetch past sent notifications history
 */
export async function fetchNotificationsHistory(): Promise<PushNotificationPayload[]> {
  try {
    // Try cloud first
    if (supabase) {
      const { data } = await supabase
        .from("properties")
        .select("description")
        .eq("id", "__notifications_history_store__")
        .maybeSingle();

      if (data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed)) {
          try { localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(parsed)); } catch {}
          return parsed;
        }
      }
    }

    // Fallback to local
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

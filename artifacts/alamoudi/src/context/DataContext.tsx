import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Region { id: string; name: string; active: boolean; heroImage?: string; }
export interface PropertyType { id: string; name: string; active: boolean; }

export type PropertyStatus = "active" | "listed" | "draft" | "sold" | "rented" | "reserved";
export type PropertyCategory = "sale" | "rent" | "furnished" | "administrative" | "medical" | "commercial";

export interface Property {
  id: string;
  code: string;
  title: string;
  description: string;
  price: number;
  area: number;
  beds: number;
  baths: number;
  floors: number;
  floor: number;
  finishing: string;
  view: string;
  typeId: string;
  regionId: string;
  category: PropertyCategory;
  status: PropertyStatus;
  featured: boolean;
  agentType?: "direct" | "broker";
  images: string[];
  videoUrl: string;
  externalUrl: string;
  mapsUrl: string;
  createdAt: string;
  unitType?: string;
  subArea?: string;
  layout?: string;
  master?: string;
  elevator?: string;
  parking?: string;
  additionalFeatures?: string;
  floorText?: string;
  location?: string;
  source?: string;
  sourcePhones?: string[];
  sourceEmail?: string;
  sourceLocation?: string;
  sourceNotes?: string;
  views?: number;
  coverPriority?: "image" | "video";
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: "admin" | "agent" | "customer";
  active: boolean;
  joinedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "reviewed" | "replied";
  createdAt: string;
}

export interface FinishingRequest {
  id: string;
  name: string;
  phone: string;
  location: string;
  area: string;
  finishingType: string;
  description: string;
  status: "new" | "reviewed" | "replied";
  createdAt: string;
}

export interface PropertyRequest {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  ownerEmail: string;
  regionId: string;
  propertyTypeId: string;
  listingType: string;
  area: string;
  price: string;
  description: string;
  mapsUrl: string;
  notes: string;
  images: string[];
  status: "new" | "reviewed" | "replied";
  createdAt: string;
}

export interface AiLead {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: string;
  requirements: string;
  budget: string;
  notes: string;
  status: "new" | "reviewed" | "replied";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  title: string;
  actor: string;
  createdAt: string;
}

export interface TiktokVideo {
  id: string;
  thumbnail: string;
  title: string;
  videoUrl: string;
}

export type AdType = "premium" | "secondary";
export type AdStatus = "active" | "scheduled" | "expired" | "disabled";

export interface Ad {
  id: string;
  type: AdType;                  // premium = إعلان رئيسي (21:9) | secondary = إعلان صغير (16:9)
  desktopImageUrl: string;       // صورة الديسكتوب (مطلوبة)
  mobileImageUrl?: string;       // صورة الجوال (اختياري)
  linkUrl?: string;
  whatsappNumber?: string;       // رقم واتساب للتواصل المباشر عند النقر
  linkPriority?: "whatsapp" | "url"; // الأولوية لو الاثنان موجودان (افتراضي: whatsapp)
  whatsappMessage?: string;          // الرسالة الجاهزة اللي بتظهر للعميل عند فتح الواتساب
  title?: string;
  order: number;
  duration: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  views: number;
  clicks: number;
  linkClicks?: number;           // نقرات أدت لفتح لينك أو واتساب
  // للتوافق مع البيانات القديمة
  imageUrl?: string;
}

export interface SiteSettings {
  companyName: string;
  companyDescription: string;
  heroLine1: string;
  heroLine2: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  tiktok: string;
  tiktokName: string;
  tiktokAvatar: string;
  facebook: string;
  instagram: string;
  telegram: string;
  mapsUrl: string;
  heroImageUrl: string;
  heroOverlayOpacity: number;
  /** Shared overlay color for region cover heroes. */
  regionHeroOverlayColor: string;
  /** Opacity of the solid overlay over region cover images, 0-100. */
  regionHeroOverlayOpacity: number;
  /** Strength of the bottom-to-top gradient over region cover images, 0-100. */
  regionHeroGradientOpacity: number;
  tiktokVideos: TiktokVideo[];
  ads: Ad[];
  /** Seconds to wait after each card movement before starting the next one. */
  carouselAutoPlayDelay: number;
  /** Movement speed multiplier: 1 is the natural speed. */
  carouselMotionSpeed: number;
  /** Allow visitors/customers to download property images. */
  allowCustomerImageDownloads: boolean;
  /** Allow authenticated staff members to download property images. */
  allowStaffImageDownloads: boolean;
  themeMode?: "light" | "dark" | "user";
}

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "العمودي للتسويق العقاري",
  companyDescription: "شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر.",
  heroLine1: "شريكك الموثوق في عالم التسويق العقاري والتشطيبات",
  heroLine2: "نقدم لك أفضل الفرص العقارية والاستثمارية في مصر",
  phone1: "+20 10 0000 0000",
  phone2: "",
  whatsapp: "+20 10 0000 0000",
  email: "info@alamoudi.com",
  tiktok: "https://www.tiktok.com/@alamoudi.realestate",
  tiktokName: "Alamoudi | الـعـمـودي",
  tiktokAvatar: "",
  facebook: "",
  instagram: "",
  telegram: "",
  mapsUrl: "https://maps.google.com",
  heroImageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
  heroOverlayOpacity: 85,
  regionHeroOverlayColor: "#000000",
  regionHeroOverlayOpacity: 25,
  regionHeroGradientOpacity: 60,
  tiktokVideos: [],
  ads: [],
  carouselAutoPlayDelay: 3.5,
  carouselMotionSpeed: 1,
  allowCustomerImageDownloads: true,
  allowStaffImageDownloads: true,
  themeMode: "user",
};

export interface VisitorStats {
  online: number;
  today: number;
  week: number;
  month: number;
}

interface DataContextType {
  ready: boolean;
  fetching: boolean;
  reload: () => Promise<void>;
  regions: Region[];
  propertyTypes: PropertyType[];
  properties: Property[];
  users: User[];
  inquiries: Inquiry[];
  finishingRequests: FinishingRequest[];
  propertyRequests: PropertyRequest[];
  aiLeads: AiLead[];
  activityLogs: ActivityLog[];
  visitorStats: VisitorStats;
  settings: SiteSettings;
  trackPropertyView: (id: string) => void;
  refreshVisitorStats: () => Promise<void>;
  updateSettings: (s: Partial<SiteSettings>) => void;
  addRegion: (name: string, heroImage?: string) => Promise<boolean>;
  updateRegion: (id: string, name: string, heroImage?: string) => Promise<boolean>;
  deleteRegion: (id: string) => Promise<boolean>;
  toggleRegion: (id: string) => Promise<boolean>;
  addPropertyType: (name: string) => void;
  updatePropertyType: (id: string, name: string) => void;
  deletePropertyType: (id: string) => void;
  togglePropertyType: (id: string) => void;
  addProperty: (p: Omit<Property, "id" | "createdAt" | "code"> & { code?: string }) => Promise<boolean>;
  updateProperty: (id: string, p: Partial<Property>) => Promise<boolean>;
  deleteProperty: (id: string) => void;
  bulkDeleteProperties: (ids: string[]) => void;
  bulkUpdateProperties: (ids: string[], updates: Partial<Property>) => void;
  importProperties: (items: Omit<Property, "id" | "createdAt">[]) => { added: number; updated: number };
  addUser: (u: Omit<User, "id" | "joinedAt">) => void;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUser: (id: string) => void;
  addInquiry: (i: Omit<Inquiry, "id" | "createdAt" | "status">) => void;
  updateInquiryStatus: (id: string, status: Inquiry["status"]) => void;
  deleteInquiry: (id: string) => void;
  addFinishingRequest: (r: Omit<FinishingRequest, "id" | "createdAt" | "status">) => void;
  updateFinishingRequestStatus: (id: string, status: FinishingRequest["status"]) => void;
  deleteFinishingRequest: (id: string) => void;
  addPropertyRequest: (r: Omit<PropertyRequest, "id" | "createdAt" | "status">) => void;
  updatePropertyRequestStatus: (id: string, status: PropertyRequest["status"]) => void;
  deletePropertyRequest: (id: string) => void;
  reloadAiLeads: () => Promise<void>;
  updateAiLeadStatus: (id: string, status: AiLead["status"]) => void;
  deleteAiLead: (id: string) => void;
  addTiktokVideo: (v: Omit<TiktokVideo, "id">) => void;
  updateTiktokVideo: (id: string, v: Partial<Omit<TiktokVideo, "id">>) => void;
  deleteTiktokVideo: (id: string) => void;
  addAd: (a: Omit<Ad, "id">) => void;
  updateAd: (id: string, a: Partial<Omit<Ad, "id">>) => void;
  deleteAd: (id: string) => void;
  reorderAds: (ordered: Ad[]) => void;
  trackAdView: (id: string, payload?: Record<string, unknown>) => void;
  trackAdClick: (id: string, payload?: Record<string, unknown>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function genCode() { return "ALM-" + Math.floor(10000 + Math.random() * 90000); }

const CACHE_KEY = "alm_cache_v4";
// الـ cache بيُعرض فوراً حتى لو قديم، والـ API دايماً بيرفّش في الخلفية
// TTL طويل جداً (7 أيام) كـ safety net بس للـ cache القديم جداً
const CACHE_HARD_TTL = 7 * 24 * 60 * 60 * 1000;

interface CachePayload {
  ts: number;
  regions: Region[];
  types: PropertyType[];
  properties: Property[];
  settings: SiteSettings;
}

function readCache(): CachePayload | null {
  try {
    // حاول تقرأ الـ v4 أول
    let raw = localStorage.getItem(CACHE_KEY);
    // لو مش موجود، حاول تهجّر الـ v3 القديم
    if (!raw) {
      const oldRaw = localStorage.getItem("alm_cache_v3");
      if (oldRaw) {
        localStorage.setItem(CACHE_KEY, oldRaw);
        localStorage.removeItem("alm_cache_v3");
        raw = oldRaw;
      }
    }
    if (!raw) return null;
    const parsed: CachePayload = JSON.parse(raw);
    // نرفض بس الـ cache اللي عمره أكتر من 7 أيام
    if (Date.now() - parsed.ts > CACHE_HARD_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(payload: Omit<CachePayload, "ts">) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), ...payload })); } catch {}
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [finishingRequests, setFinishingRequests] = useState<FinishingRequest[]>([]);
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>([]);
  const [aiLeads, setAiLeads] = useState<AiLead[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ online: 0, today: 0, week: 0, month: 0 });
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const reload = useCallback(async () => {
    const [
      regionsR, typesR, propertiesR, settingsR,
      usersR, inquiriesR, finishingR, requestsR, aiLeadsR, activityR, visitorStatsR,
    ] = await Promise.allSettled([
      api.get<Region[]>("/regions"),
      api.get<PropertyType[]>("/property-types"),
      api.get<Property[]>("/properties"),
      api.get<SiteSettings>("/settings"),
      api.get<User[]>("/users"),
      api.get<Inquiry[]>("/inquiries"),
      api.get<FinishingRequest[]>("/finishing-requests"),
      api.get<PropertyRequest[]>("/property-requests"),
      api.get<AiLead[]>("/ai/leads"),
      api.get<ActivityLog[]>("/activity-logs"),
      api.get<VisitorStats>("/visitors/stats"),
    ]);
    const newRegions  = regionsR.status   === "fulfilled" ? regionsR.value   : null;
    const newTypes    = typesR.status     === "fulfilled" ? typesR.value     : null;
    const newProps    = propertiesR.status === "fulfilled" ? propertiesR.value : null;
    const newSettings = settingsR.status  === "fulfilled" && settingsR.value && Object.keys(settingsR.value).length > 0
                        ? settingsR.value : null;
    if (newRegions)  setRegions(newRegions);
    if (newTypes)    setPropertyTypes(newTypes);
    if (newProps)    setProperties(newProps);
    if (newSettings) setSettings({ ...DEFAULT_SETTINGS, ...newSettings, tiktokVideos: newSettings.tiktokVideos ?? [] });
    setUsers(usersR.status           === "fulfilled" ? usersR.value     : []);
    setInquiries(inquiriesR.status   === "fulfilled" ? inquiriesR.value : []);
    setFinishingRequests(finishingR.status === "fulfilled" ? finishingR.value : []);
    setPropertyRequests(requestsR.status  === "fulfilled" ? requestsR.value  : []);
    if (aiLeadsR.status    === "fulfilled") setAiLeads(aiLeadsR.value);
    if (activityR.status   === "fulfilled") setActivityLogs(activityR.value);
    if (visitorStatsR.status === "fulfilled") setVisitorStats(visitorStatsR.value);
    if (newRegions || newTypes || newProps || newSettings) {
      writeCache({
        regions:    newRegions  ?? [],
        types:      newTypes    ?? [],
        properties: newProps    ?? [],
        settings:   newSettings ?? DEFAULT_SETTINGS,
      });
    }
  }, []);

  const trackPropertyView = useCallback((id: string) => {
    void api.post(`/properties/${id}/view`, {}).catch(() => {
      /* view tracking is best-effort; never surface errors to visitors */
    });
  }, []);

  const refreshVisitorStats = useCallback(async () => {
    try {
      setVisitorStats(await api.get<VisitorStats>("/visitors/stats"));
    } catch {
      /* not authorized / not staff — ignore */
    }
  }, []);

  const reloadAiLeads = useCallback(async () => {
    try {
      setAiLeads(await api.get<AiLead[]>("/ai/leads"));
    } catch {
      /* not authorized / not staff — ignore */
    }
  }, []);

  // Optimistic writes update local state first; if the server rejects, surface
  // the error and re-sync from the server so the UI never diverges from truth.
  const persist = useCallback((p: Promise<unknown>) => {
    return p
      .then(() => true)
      .catch((err: unknown) => {
        const apiError = err as { status?: number; message?: string };
        const message = apiError.status === 401
          ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى ثم أعد حفظ العقار."
          : apiError.status === 413
            ? "حجم الصور كبير جدًا بالنسبة للطلب. صغّر الصور ثم حاول مرة أخرى."
            : apiError.message || "تعذّر حفظ التغيير على الخادم";
        toast({ title: "تعذّر حفظ التغيير", description: message, variant: "destructive" });
        void reload();
        return false;
      });
  }, [toast, reload]);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setRegions(cached.regions);
      setPropertyTypes(cached.types);
      setProperties(cached.properties);
      setSettings({ ...DEFAULT_SETTINGS, ...cached.settings, tiktokVideos: cached.settings.tiktokVideos ?? [], ads: cached.settings.ads ?? [] });
      setReady(true);
    }

    let destroyed = false;

    void Promise.allSettled([
      api.get<Region[]>("/regions"),
      api.get<PropertyType[]>("/property-types"),
      api.get<Property[]>("/properties"),
      api.get<SiteSettings>("/settings"),
    ]).then(([regionsR, typesR, propertiesR, settingsR]) => {
      if (destroyed) return;

      const newRegions  = regionsR.status   === "fulfilled" ? regionsR.value   : null;
      const newTypes    = typesR.status     === "fulfilled" ? typesR.value     : null;
      const newProps    = propertiesR.status === "fulfilled" ? propertiesR.value : null;
      const newSettings = settingsR.status  === "fulfilled" && settingsR.value && Object.keys(settingsR.value).length > 0
                          ? settingsR.value : null;

      if (newRegions)  setRegions(newRegions);
      if (newTypes)    setPropertyTypes(newTypes);
      if (newProps)    setProperties(newProps);
      if (newSettings) setSettings({ ...DEFAULT_SETTINGS, ...newSettings, tiktokVideos: newSettings.tiktokVideos ?? [], ads: newSettings.ads ?? [] });

      const gotData = newRegions !== null || newTypes !== null || newProps !== null || newSettings !== null;
      setFetching(false);
      setReady(true);

      if (gotData) {
        writeCache({
          regions:    newRegions  ?? cached?.regions  ?? [],
          types:      newTypes    ?? cached?.types    ?? [],
          properties: newProps    ?? cached?.properties ?? [],
          settings:   newSettings ?? cached?.settings ?? DEFAULT_SETTINGS,
        });
        void Promise.allSettled([
          api.get<User[]>("/users"),
          api.get<Inquiry[]>("/inquiries"),
          api.get<FinishingRequest[]>("/finishing-requests"),
          api.get<PropertyRequest[]>("/property-requests"),
          api.get<AiLead[]>("/ai/leads"),
          api.get<ActivityLog[]>("/activity-logs"),
          api.get<VisitorStats>("/visitors/stats"),
        ]).then(([usersR, inquiriesR, finishingR, requestsR, aiLeadsR, activityR, visitorStatsR]) => {
          if (destroyed) return;
          setUsers(usersR.status           === "fulfilled" ? usersR.value     : []);
          setInquiries(inquiriesR.status   === "fulfilled" ? inquiriesR.value : []);
          setFinishingRequests(finishingR.status === "fulfilled" ? finishingR.value : []);
          setPropertyRequests(requestsR.status  === "fulfilled" ? requestsR.value  : []);
          if (aiLeadsR.status    === "fulfilled") setAiLeads(aiLeadsR.value);
          if (activityR.status   === "fulfilled") setActivityLogs(activityR.value);
          if (visitorStatsR.status === "fulfilled") setVisitorStats(visitorStatsR.value);
        });
      }
    });

    return () => { destroyed = true; };
  }, []);

  const updateSettings = (s: Partial<SiteSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...s };
      persist(api.put("/settings", next));
      return next;
    });
  };

  const addRegion = async (name: string, heroImage = "") => {
    const region: Region = { id: genId(), name, active: true, heroImage };
    setRegions(p => [...p, region]);
    return persist(api.post("/regions", region));
  };
  const updateRegion = async (id: string, name: string, heroImage?: string) => {
    setRegions(p => p.map(r => r.id === id ? { ...r, name, ...(heroImage !== undefined ? { heroImage } : {}) } : r));
    return persist(api.patch(`/regions/${id}`, { name, ...(heroImage !== undefined ? { heroImage } : {}) }));
  };
  const deleteRegion = async (id: string) => {
    setRegions(p => p.filter(r => r.id !== id));
    return persist(api.del(`/regions/${id}`));
  };
  const toggleRegion = async (id: string) => {
    const current = regions.find(r => r.id === id);
    const active = !(current?.active ?? true);
    setRegions(p => p.map(r => r.id === id ? { ...r, active } : r));
    return persist(api.patch(`/regions/${id}`, { active }));
  };

  const addPropertyType = (name: string) => {
    const t: PropertyType = { id: genId(), name, active: true };
    setPropertyTypes(p => [...p, t]);
    persist(api.post("/property-types", t));
  };
  const updatePropertyType = (id: string, name: string) => {
    setPropertyTypes(p => p.map(t => t.id === id ? { ...t, name } : t));
    persist(api.patch(`/property-types/${id}`, { name }));
  };
  const deletePropertyType = (id: string) => {
    setPropertyTypes(p => p.filter(t => t.id !== id));
    persist(api.del(`/property-types/${id}`));
  };
  const togglePropertyType = (id: string) => {
    const current = propertyTypes.find(t => t.id === id);
    const active = !(current?.active ?? true);
    setPropertyTypes(p => p.map(t => t.id === id ? { ...t, active } : t));
    persist(api.patch(`/property-types/${id}`, { active }));
  };

  const addProperty = (p: Omit<Property, "id" | "createdAt" | "code"> & { code?: string }) => {
    const code = p.code?.trim() || genCode();
    const property: Property = { ...p, code, id: genId(), createdAt: new Date().toISOString() };
    setProperties(prev => [...prev, property]);
    return persist(api.post("/properties", property));
  };
  const updateProperty = (id: string, p: Partial<Property>) => {
    setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, ...p } : prop));
    return persist(api.patch(`/properties/${id}`, p));
  };
  const deleteProperty = (id: string) => {
    setProperties(p => p.filter(x => x.id !== id));
    persist(api.del(`/properties/${id}`));
  };
  const bulkDeleteProperties = (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setProperties(p => p.filter(x => !idSet.has(x.id)));
    persist(api.del("/properties/bulk", { ids }));
  };
  const bulkUpdateProperties = (ids: string[], updates: Partial<Property>) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setProperties(p => p.map(x => idSet.has(x.id) ? { ...x, ...updates } : x));
    persist(api.patch("/properties/bulk", { ids, updates }));
  };

  const importProperties = (items: Omit<Property, "id" | "createdAt">[]) => {
    let added = 0;
    let updated = 0;
    const payload: Property[] = [];
    setProperties(prev => {
      const next = [...prev];
      const indexByCode = new Map<string, number>();
      next.forEach((p, i) => { if (p.code) indexByCode.set(p.code, i); });
      for (const item of items) {
        const code = item.code || genCode();
        const existingIdx = item.code ? indexByCode.get(item.code) : undefined;
        if (existingIdx !== undefined) {
          const merged = { ...next[existingIdx], ...item, code };
          next[existingIdx] = merged;
          payload.push(merged);
          updated++;
        } else {
          const created: Property = { ...item, code, id: genId(), createdAt: new Date().toISOString() };
          indexByCode.set(code, next.length);
          next.push(created);
          payload.push(created);
          added++;
        }
      }
      return next;
    });
    if (payload.length > 0) persist(api.post("/properties/import", payload));
    return { added, updated };
  };

  const addUser = (u: Omit<User, "id" | "joinedAt">) => {
    const user: User = { ...u, id: genId(), joinedAt: new Date().toISOString() };
    setUsers(p => [...p, { ...user, password: undefined }]);
    persist(api.post("/users", user));
  };
  const updateUser = (id: string, u: Partial<User>) => {
    const { password: _pw, ...rest } = u;
    setUsers(p => p.map(x => x.id === id ? { ...x, ...rest } : x));
    persist(api.patch(`/users/${id}`, u));
  };
  const deleteUser = (id: string) => {
    setUsers(p => p.filter(x => x.id !== id));
    persist(api.del(`/users/${id}`));
  };
  const toggleUser = (id: string) => {
    const current = users.find(x => x.id === id);
    const active = !(current?.active ?? true);
    setUsers(p => p.map(x => x.id === id ? { ...x, active } : x));
    persist(api.patch(`/users/${id}`, { active }));
  };

  const addInquiry = (i: Omit<Inquiry, "id" | "createdAt" | "status">) => {
    const inquiry: Inquiry = { ...i, id: genId(), status: "new", createdAt: new Date().toISOString() };
    setInquiries(p => [...p, inquiry]);
    persist(api.post("/inquiries", inquiry));
  };
  const updateInquiryStatus = (id: string, status: Inquiry["status"]) => {
    setInquiries(p => p.map(x => x.id === id ? { ...x, status } : x));
    persist(api.patch(`/inquiries/${id}`, { status }));
  };
  const deleteInquiry = (id: string) => {
    setInquiries(p => p.filter(x => x.id !== id));
    persist(api.del(`/inquiries/${id}`));
  };

  const addFinishingRequest = (r: Omit<FinishingRequest, "id" | "createdAt" | "status">) => {
    const fr: FinishingRequest = { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() };
    setFinishingRequests(p => [...p, fr]);
    persist(api.post("/finishing-requests", fr));
  };
  const updateFinishingRequestStatus = (id: string, status: FinishingRequest["status"]) => {
    setFinishingRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
    persist(api.patch(`/finishing-requests/${id}`, { status }));
  };
  const deleteFinishingRequest = (id: string) => {
    setFinishingRequests(p => p.filter(x => x.id !== id));
    persist(api.del(`/finishing-requests/${id}`));
  };

  const addPropertyRequest = (r: Omit<PropertyRequest, "id" | "createdAt" | "status">) => {
    const pr: PropertyRequest = { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() };
    setPropertyRequests(p => [...p, pr]);
    persist(api.post("/property-requests", pr));
  };
  const updatePropertyRequestStatus = (id: string, status: PropertyRequest["status"]) => {
    setPropertyRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
    persist(api.patch(`/property-requests/${id}`, { status }));
  };
  const deletePropertyRequest = (id: string) => {
    setPropertyRequests(p => p.filter(x => x.id !== id));
    persist(api.del(`/property-requests/${id}`));
  };

  const updateAiLeadStatus = (id: string, status: AiLead["status"]) => {
    setAiLeads(p => p.map(x => x.id === id ? { ...x, status } : x));
    persist(api.patch(`/ai/leads/${id}`, { status }));
  };
  const deleteAiLead = (id: string) => {
    setAiLeads(p => p.filter(x => x.id !== id));
    persist(api.del(`/ai/leads/${id}`));
  };

  const addTiktokVideo = (v: Omit<TiktokVideo, "id">) =>
    updateSettings({ tiktokVideos: [...(settings.tiktokVideos ?? []), { ...v, id: genId() }] });
  const updateTiktokVideo = (id: string, v: Partial<Omit<TiktokVideo, "id">>) =>
    updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).map(x => x.id === id ? { ...x, ...v } : x) });
  const deleteTiktokVideo = (id: string) =>
    updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).filter(x => x.id !== id) });

  // ── إدارة الإعلانات — routes مخصصة مع activity logging ─────────────────────
  const addAd = (a: Omit<Ad, "id">) => {
    const newAd: Ad = { ...a, id: genId(), views: 0, clicks: 0 };
    setSettings(prev => ({ ...prev, ads: [...(prev.ads ?? []), newAd] }));
    persist(api.post("/ads/manage", newAd));
  };
  const updateAd = (id: string, a: Partial<Omit<Ad, "id">>) => {
    setSettings(prev => ({
      ...prev,
      ads: (prev.ads ?? []).map(x => x.id === id ? { ...x, ...a } : x),
    }));
    persist(api.patch(`/ads/manage/${id}`, a));
  };
  const deleteAd = (id: string) => {
    setSettings(prev => ({ ...prev, ads: (prev.ads ?? []).filter(x => x.id !== id) }));
    persist(api.del(`/ads/manage/${id}`));
  };
  // إعادة ترتيب الإعلانات دفعةً واحدة
  const reorderAds = (ordered: Ad[]) => {
    const reordered = ordered.map((a, i) => ({ ...a, order: i + 1 }));
    setSettings(prev => {
      const orderedIds = new Set(reordered.map(a => a.id));
      const unchanged  = (prev.ads ?? []).filter(a => !orderedIds.has(a.id));
      return { ...prev, ads: [...reordered, ...unchanged] };
    });
    persist(api.patch("/ads/manage/reorder", { ordered: reordered }));
  };
  // تتبّع المشاهدات والنقرات — يُرسَل للـ API مع بيانات تفصيلية
  // best-effort: لا نعرض خطأ أبداً، ونحدّث الـ state المحلي فوراً للتجاوب
  const trackAdView = useCallback((id: string, payload?: Record<string, unknown>) => {
    setSettings(prev => ({
      ...prev,
      ads: (prev.ads ?? []).map(x => x.id === id ? { ...x, views: (x.views ?? 0) + 1 } : x),
    }));
    void api.post(`/ads/${id}/view`, payload ?? {}).catch(() => { /* best-effort */ });
  }, []);
  const trackAdClick = useCallback((id: string, payload?: Record<string, unknown>) => {
    setSettings(prev => ({
      ...prev,
      ads: (prev.ads ?? []).map(x => x.id === id ? { ...x, clicks: (x.clicks ?? 0) + 1 } : x),
    }));
    void api.post(`/ads/${id}/click`, payload ?? {}).catch(() => { /* best-effort */ });
  }, []);

  return (
    <DataContext.Provider value={{
      ready, fetching, reload,
      regions, propertyTypes, properties, users, inquiries, finishingRequests, propertyRequests, aiLeads, activityLogs, settings,
      visitorStats,
      trackPropertyView, refreshVisitorStats,
      updateSettings,
      reloadAiLeads, updateAiLeadStatus, deleteAiLead,
      addRegion, updateRegion, deleteRegion, toggleRegion,
      addPropertyType, updatePropertyType, deletePropertyType, togglePropertyType,
      addProperty, updateProperty, deleteProperty, bulkDeleteProperties, bulkUpdateProperties, importProperties,
      addUser, updateUser, deleteUser, toggleUser,
      addInquiry, updateInquiryStatus, deleteInquiry,
      addFinishingRequest, updateFinishingRequestStatus, deleteFinishingRequest,
      addPropertyRequest, updatePropertyRequestStatus, deletePropertyRequest,
      addTiktokVideo, updateTiktokVideo, deleteTiktokVideo,
      addAd, updateAd, deleteAd, reorderAds, trackAdView, trackAdClick,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

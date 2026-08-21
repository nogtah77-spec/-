import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SEED_PROPERTIES } from "@/data/seedProperties";
import { supabaseService } from "@/lib/supabaseService";

export interface Region { id: string; name: string; active: boolean; heroImage?: string; }
export interface PropertyType { id: string; name: string; active: boolean; }

export type PropertyStatus = "active" | "listed" | "draft" | "sold" | "rented" | "reserved";
export type PropertyCategory = "residential" | "administrative" | "medical" | "commercial" | "sale" | "rent" | "furnished";
export type PropertyListingType = "sale" | "rent" | "furnished";
export type PropertySourceType = "direct" | "broker";

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
  floor: number | string;
  finishing: string;
  view: string;
  typeId: string;
  regionId: string;
  category: PropertyCategory;
  listingType?: PropertyListingType;
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
  assignedStaffId?: string;
  brokerId?: string;
  views?: number;
  coverPriority?: "image" | "video";
}

export interface Broker {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  company?: string;
  specialty?: string;
  commission?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: "admin" | "agent" | "customer";
  active: boolean;
  canClearActivityLogs: boolean;
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

export type CustomerPropertyRequestStatus = "new" | "reviewed" | "replied" | "closed";

export interface CustomerPropertyRequest {
  id: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  requestType: string;
  transactionType: string;
  preferredAreas: string;
  budgetMin: string;
  budgetMax: string;
  bedrooms: string;
  bathrooms: string;
  areaMin: string;
  areaMax: string;
  finishing: string;
  furnished: string;
  paymentMethod: string;
  requiredFeatures: string;
  details: string;
  notes: string;
  source: string;
  followUpDate: string;
  assignedStaffId: string;
  viewingDate: string;
  status: CustomerPropertyRequestStatus;
  createdAt: string;
}

export type ContractType = "rent" | "furnished_rent" | "sale" | "installment";
export type ContractStatus = "draft" | "active" | "completed" | "cancelled";
export type ContractInstallmentStatus = "pending" | "paid" | "overdue";

export interface ContractDocument {
  id: string;
  objectPath: string;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface ContractInstallment {
  id: string;
  dueDate: string;
  amount: string;
  status: ContractInstallmentStatus;
  notes: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractType: ContractType;
  status: ContractStatus;
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  propertyType: string;
  propertyRegion: string;
  propertyAddress: string;
  assignedStaffId: string;
  partyOneRole: string;
  partyOneName: string;
  partyOnePhone: string;
  partyOneEmail: string;
  partyOneNationalId: string;
  partyOneAddress: string;
  partyTwoRole: string;
  partyTwoName: string;
  partyTwoPhone: string;
  partyTwoEmail: string;
  partyTwoNationalId: string;
  partyTwoAddress: string;
  startDate: string;
  endDate: string;
  signingDate: string;
  handoverDate: string;
  renewalDate: string;
  noticePeriod: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  insuranceAmount: string;
  depositAmount: string;
  currency: string;
  paymentMethod: string;
  paymentFrequency: string;
  nextPaymentDate: string;
  installments: ContractInstallment[];
  terms: string;
  notes: string;
  documents: ContractDocument[];
  createdAt: string;
  updatedAt: string;
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
  /** Optional full-bleed image used only on the staff login screen. */
  loginBackgroundEnabled: boolean;
  loginBackgroundImageUrl: string;
  /** Login backdrop overlay color and opacity, 0-100. */
  loginOverlayColor: string;
  loginOverlayOpacity: number;
  /** Bottom-to-top contrast gradient strength, 0-100. */
  loginGradientOpacity: number;
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
  loginBackgroundEnabled: false,
  loginBackgroundImageUrl: "",
  loginOverlayColor: "#10202D",
  loginOverlayOpacity: 72,
  loginGradientOpacity: 58,
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
  customerPropertyRequests: CustomerPropertyRequest[];
  contracts: Contract[];
  brokers: Broker[];
  activityLogs: ActivityLog[];
  visitorStats: VisitorStats;
  settings: SiteSettings;
  trackPropertyView: (id: string) => void;
  refreshVisitorStats: () => Promise<void>;
  updateSettings: (s: Partial<SiteSettings>) => Promise<boolean>;
  addBroker: (b: Omit<Broker, "id" | "createdAt">) => Promise<boolean>;
  updateBroker: (id: string, b: Partial<Broker>) => Promise<boolean>;
  deleteBroker: (id: string) => Promise<boolean>;
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
  addUser: (u: Omit<User, "id" | "joinedAt">) => Promise<boolean>;
  updateUser: (id: string, u: Partial<User>) => Promise<boolean>;
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
  addCustomerPropertyRequest: (request: Omit<CustomerPropertyRequest, "id" | "createdAt" | "status">) => Promise<boolean>;
  updateCustomerPropertyRequest: (id: string, request: Partial<Omit<CustomerPropertyRequest, "id" | "createdAt">>) => Promise<boolean>;
  deleteCustomerPropertyRequest: (id: string) => void;
  addContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "contractNumber"> & { contractNumber?: string }) => Promise<boolean>;
  updateContract: (id: string, contract: Partial<Omit<Contract, "id" | "createdAt" | "updatedAt">>) => Promise<boolean>;
  deleteContract: (id: string) => Promise<boolean>;
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

export const DEFAULT_BROKERS: Broker[] = [
  {
    id: "broker-1",
    name: "م/ وائل الشناوي",
    phone: "01012345678",
    whatsapp: "01012345678",
    company: "القمة للتسويق العقاري",
    specialty: "فلل ودوبلكس التجمع",
    commission: "2.5%",
    notes: "وسيط معتمد وموثوق، سرعة في المعاينات والتنسيق",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "broker-2",
    name: "أ/ كريم منصور",
    phone: "01123456789",
    whatsapp: "01123456789",
    company: "رويال هومز",
    specialty: "شقق ومحلات الشروق ومدينتي",
    commission: "50% مناصفة",
    notes: "عروض حصرية في كمبوند وصال والشروق",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "broker-3",
    name: "أ/ ياسمين فؤاد",
    phone: "01234567890",
    whatsapp: "01234567890",
    company: "وسيط معتمد",
    specialty: "مقرات إدارية وعيادات التجمع",
    commission: "2.5%",
    notes: "علاقات قوية مع المستثمرين والمقرات الإدارية",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_REGIONS: Region[] = [
  { id: "badr", name: "مدينة بدر", active: true },
  { id: "shorouk", name: "مدينة الشروق", active: true, heroImage: "/city-heroes/shorouk.jpg" },
  { id: "madinaty", name: "مدينتي", active: true },
  { id: "wasal", name: "كمبوند وصال", active: true },
  { id: "tagamoa", name: "التجمع", active: true },
  { id: "beit_elwatan", name: "بيت الوطن", active: true },
  { id: "nasr_city", name: "مدينة نصر", active: true },
  { id: "new_heliopolis", name: "هليوبوليس الجديدة", active: true },
];

export const DEFAULT_PROPERTY_TYPES: PropertyType[] = [
  { id: "apartment", name: "شقة", active: true },
  { id: "duplex", name: "دوبلكس", active: true },
  { id: "villa", name: "فيلا", active: true },
  { id: "townhouse", name: "تاون هاوس", active: true },
  { id: "twinhouse", name: "توين هاوس", active: true },
  { id: "penthouse", name: "بنتهاوس", active: true },
  { id: "shop", name: "محل", active: true },
  { id: "clinic", name: "عيادة", active: true },
  { id: "office", name: "مكتب", active: true },
  { id: "building", name: "عمارة", active: true },
  { id: "entire_building", name: "مبنى", active: true },
];

export const DEFAULT_STAFF_USERS: User[] = [
  { id: "staff-1", name: "سعيد العمودي", email: "saeed@alamoudi.com", username: "saeed", role: "admin", active: true, canClearActivityLogs: true, joinedAt: "2026-01-01" },
];

function mergeWithSeedProperties(cachedList: Property[] = []): Property[] {
  const deleted: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("alm_deleted_properties") || "[]");
    } catch {
      return [];
    }
  })();

  const overrides: Record<string, Property> = (() => {
    try {
      return JSON.parse(localStorage.getItem("alm_property_overrides") || "{}");
    } catch {
      return {};
    }
  })();

  const map = new Map<string, Property>();

  // 1. Initial seeds (only if not deleted)
  for (const p of SEED_PROPERTIES) {
    if (p) {
      const isDeleted = deleted.includes(p.id) || (p.code && deleted.includes(p.code));
      if (!isDeleted) {
        const idKey = (p.id || "").toLowerCase();
        const codeKey = (p.code || "").toLowerCase();
        if (idKey) map.set(idKey, p);
        if (codeKey) map.set(codeKey, p);
      }
    }
  }

  // 2. Cached properties override seeds
  for (const p of cachedList) {
    if (p) {
      const isDeleted = deleted.includes(p.id) || (p.code && deleted.includes(p.code));
      if (!isDeleted) {
        const idKey = (p.id || "").toLowerCase();
        const codeKey = (p.code || "").toLowerCase();
        if (idKey) map.set(idKey, p);
        if (codeKey) map.set(codeKey, p);
      }
    }
  }

  // 3. User Overrides ALWAYS win
  for (const [, p] of Object.entries(overrides)) {
    if (p) {
      const isDeleted = deleted.includes(p.id) || (p.code && deleted.includes(p.code));
      if (!isDeleted) {
        const idKey = (p.id || "").toLowerCase();
        const codeKey = (p.code || "").toLowerCase();
        if (idKey) map.set(idKey, p);
        if (codeKey) map.set(codeKey, p);
      }
    }
  }

  // Deduplicate by unique id
  const finalMap = new Map<string, Property>();
  for (const p of map.values()) {
    const isDeleted = deleted.includes(p.id) || (p.code && deleted.includes(p.code));
    if (!isDeleted) {
      const uniqueKey = p.id || p.code;
      if (uniqueKey) finalMap.set(uniqueKey, p);
    }
  }
  return Array.from(finalMap.values());
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
    parsed.properties = mergeWithSeedProperties(parsed.properties || []);
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
  const [regions, setRegions] = useState<Region[]>(() => {
    const cached = readCache();
    return cached?.regions?.length ? cached.regions : DEFAULT_REGIONS;
  });
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(() => {
    const cached = readCache();
    return cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES;
  });
  const [properties, setProperties] = useState<Property[]>(() => {
    const cached = readCache();
    return mergeWithSeedProperties(cached?.properties || []);
  });
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem("alm_deleted_users") || "[]");
      const raw = localStorage.getItem("alm_users");
      const list: User[] = raw ? JSON.parse(raw) : DEFAULT_STAFF_USERS;
      return list.filter(u => !deletedIds.includes(u.id));
    } catch {
      return DEFAULT_STAFF_USERS;
    }
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [finishingRequests, setFinishingRequests] = useState<FinishingRequest[]>([]);
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>([]);
  const [aiLeads, setAiLeads] = useState<AiLead[]>([]);
  const [customerPropertyRequests, setCustomerPropertyRequests] = useState<CustomerPropertyRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>(() => {
    try {
      const raw = localStorage.getItem("alm_brokers");
      return raw ? JSON.parse(raw) : DEFAULT_BROKERS;
    } catch {
      return DEFAULT_BROKERS;
    }
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ online: 0, today: 0, week: 0, month: 0 });
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = readCache();
    return cached?.settings
      ? { ...DEFAULT_SETTINGS, ...cached.settings, tiktokVideos: cached.settings.tiktokVideos ?? [], ads: cached.settings.ads ?? [] }
      : DEFAULT_SETTINGS;
  });

  const reload = useCallback(async () => {
    const [
      regionsR, typesR, propertiesR, settingsR,
       usersR, inquiriesR, finishingR, requestsR, customerPropertyRequestsR, contractsR, aiLeadsR, activityR, visitorStatsR,
    ] = await Promise.allSettled([
      api.get<Region[]>("/regions"),
      api.get<PropertyType[]>("/property-types"),
      api.get<Property[]>("/properties"),
      api.get<SiteSettings>("/settings"),
      api.get<User[]>("/users"),
      api.get<Inquiry[]>("/inquiries"),
      api.get<FinishingRequest[]>("/finishing-requests"),
      api.get<PropertyRequest[]>("/property-requests"),
      api.get<CustomerPropertyRequest[]>("/customer-property-requests"),
      api.get<Contract[]>("/contracts"),
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
    if (usersR.status === "fulfilled") setUsers(usersR.value);
    if (inquiriesR.status === "fulfilled") setInquiries(inquiriesR.value);
    if (finishingR.status === "fulfilled") setFinishingRequests(finishingR.value);
    if (requestsR.status === "fulfilled") setPropertyRequests(requestsR.value);
    if (customerPropertyRequestsR.status === "fulfilled") setCustomerPropertyRequests(customerPropertyRequestsR.value);
    if (contractsR.status === "fulfilled") setContracts(contractsR.value);
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

      if (newRegions && newRegions.length > 0) setRegions(newRegions);
      else if (!cached?.regions?.length) setRegions(DEFAULT_REGIONS);

      if (newTypes && newTypes.length > 0) setPropertyTypes(newTypes);
      else if (!cached?.types?.length) setPropertyTypes(DEFAULT_PROPERTY_TYPES);

      if (newProps && newProps.length > 0) setProperties(newProps);
      else setProperties(mergeWithSeedProperties(cached?.properties));

      if (newSettings) setSettings({ ...DEFAULT_SETTINGS, ...newSettings, tiktokVideos: newSettings.tiktokVideos ?? [], ads: newSettings.ads ?? [] });

      const gotData = newRegions !== null || newTypes !== null || newProps !== null || newSettings !== null;
      setFetching(false);
      setReady(true);

      if (gotData) {
        writeCache({
          regions: (newRegions && newRegions.length > 0) ? newRegions : (cached?.regions?.length ? cached.regions : DEFAULT_REGIONS),
          types: (newTypes && newTypes.length > 0) ? newTypes : (cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES),
          properties: (newProps && newProps.length > 0) ? newProps : mergeWithSeedProperties(cached?.properties),
          settings: newSettings ?? cached?.settings ?? DEFAULT_SETTINGS,
        });
        void Promise.allSettled([
          api.get<User[]>("/users"),
          api.get<Inquiry[]>("/inquiries"),
          api.get<FinishingRequest[]>("/finishing-requests"),
           api.get<PropertyRequest[]>("/property-requests"),
           api.get<CustomerPropertyRequest[]>("/customer-property-requests"),
           api.get<Contract[]>("/contracts"),
          api.get<AiLead[]>("/ai/leads"),
          api.get<ActivityLog[]>("/activity-logs"),
          api.get<VisitorStats>("/visitors/stats"),
         ]).then(([usersR, inquiriesR, finishingR, requestsR, customerPropertyRequestsR, contractsR, aiLeadsR, activityR, visitorStatsR]) => {
          if (destroyed) return;
          if (usersR.status === "fulfilled" && usersR.value?.length) {
            setUsers(usersR.value);
            try { localStorage.setItem("alm_users", JSON.stringify(usersR.value)); } catch {}
          } else {
            try {
              const raw = localStorage.getItem("alm_users");
              if (raw) setUsers(JSON.parse(raw));
              else setUsers(DEFAULT_STAFF_USERS);
            } catch {
              setUsers(DEFAULT_STAFF_USERS);
            }
          }
           if (inquiriesR.status === "fulfilled") setInquiries(inquiriesR.value);
           if (finishingR.status === "fulfilled") setFinishingRequests(finishingR.value);
           if (requestsR.status === "fulfilled") setPropertyRequests(requestsR.value);
           if (customerPropertyRequestsR.status === "fulfilled") setCustomerPropertyRequests(customerPropertyRequestsR.value);
            if (contractsR.status === "fulfilled") setContracts(contractsR.value);
          if (aiLeadsR.status    === "fulfilled") setAiLeads(aiLeadsR.value);
          if (activityR.status   === "fulfilled") setActivityLogs(activityR.value);
          if (visitorStatsR.status === "fulfilled") setVisitorStats(visitorStatsR.value);
        });
      }

      // Sync with Supabase cloud database
      supabaseService.seedInitialPropertiesIfEmpty().then(() => {
        supabaseService.fetchProperties().then(supabaseProps => {
          if (destroyed) return;
          if (supabaseProps && supabaseProps.length > 0) {
            setProperties(mergeWithSeedProperties(supabaseProps));
            writeCache({
              regions: cached?.regions?.length ? cached.regions : DEFAULT_REGIONS,
              types: cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES,
              properties: mergeWithSeedProperties(supabaseProps),
              settings: cached?.settings ?? DEFAULT_SETTINGS,
            });
          }
        });
        supabaseService.fetchUsers().then(supabaseUsers => {
          if (destroyed) return;
          if (supabaseUsers && supabaseUsers.length > 0) {
            setUsers(prev => {
              const mergedMap = new Map<string, User>();
              prev.forEach(u => mergedMap.set(u.id, u));
              supabaseUsers.forEach(u => mergedMap.set(u.id, u));
              const merged = Array.from(mergedMap.values());
              try { localStorage.setItem("alm_users", JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        }).catch(() => {});
      }).catch(() => {});
    });

    return () => { destroyed = true; };
  }, []);

  const addBroker = useCallback(async (b: Omit<Broker, "id" | "createdAt">) => {
    const newBroker: Broker = {
      ...b,
      id: "broker-" + genId(),
      createdAt: new Date().toISOString(),
    };
    setBrokers(prev => {
      const updated = [newBroker, ...prev];
      try { localStorage.setItem("alm_brokers", JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast({ title: "تمت إضافة الوسيط بنجاح ✓" });
    return true;
  }, [toast]);

  const updateBroker = useCallback(async (id: string, patch: Partial<Broker>) => {
    setBrokers(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, ...patch } : b));
      try { localStorage.setItem("alm_brokers", JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast({ title: "تم تحديث بيانات الوسيط ✓" });
    return true;
  }, [toast]);

  const deleteBroker = useCallback(async (id: string) => {
    setBrokers(prev => {
      const updated = prev.filter(b => b.id !== id);
      try { localStorage.setItem("alm_brokers", JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast({ title: "تم حذف الوسيط" });
    return true;
  }, [toast]);

  const updateSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    writeCache({
      regions,
      types: propertyTypes,
      properties,
      settings: next,
    });
    try {
      await api.put("/settings", next);
      return true;
    } catch (err) {
      console.warn("Server sync warning (settings saved in client cache):", err);
      return true;
    }
  }, [settings, regions, propertyTypes, properties]);

  const addRegion = async (name: string, heroImage = "") => {
    const region: Region = { id: genId(), name, active: true, heroImage };
    setRegions(p => {
      const updated = [...p, region];
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    try {
      await api.post("/regions", region);
      return true;
    } catch (err) {
      console.warn("Server sync warning (region saved in client cache):", err);
      return true;
    }
  };

  const updateRegion = async (id: string, name: string, heroImage?: string) => {
    setRegions(p => {
      const updated = p.map(r => r.id === id ? { ...r, name, ...(heroImage !== undefined ? { heroImage } : {}) } : r);
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    try {
      await api.patch(`/regions/${id}`, { name, ...(heroImage !== undefined ? { heroImage } : {}) });
      return true;
    } catch (err) {
      console.warn("Server sync warning (region updated in client cache):", err);
      return true;
    }
  };

  const deleteRegion = async (id: string) => {
    setRegions(p => {
      const updated = p.filter(r => r.id !== id);
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    try {
      await api.del(`/regions/${id}`);
      return true;
    } catch (err) {
      console.warn("Server sync warning (region deleted from client cache):", err);
      return true;
    }
  };

  const toggleRegion = async (id: string) => {
    const current = regions.find(r => r.id === id);
    const active = !(current?.active ?? true);
    setRegions(p => {
      const updated = p.map(r => r.id === id ? { ...r, active } : r);
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    try {
      await api.patch(`/regions/${id}`, { active });
      return true;
    } catch (err) {
      console.warn("Server sync warning (region toggled in client cache):", err);
      return true;
    }
  };

  const addPropertyType = async (name: string) => {
    const t: PropertyType = { id: genId(), name, active: true };
    setPropertyTypes(p => {
      const updated = [...p, t];
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    try {
      await api.post("/property-types", t);
      return true;
    } catch (err) {
      console.warn("Server sync warning (property type saved in client cache):", err);
      return true;
    }
  };

  const updatePropertyType = async (id: string, name: string) => {
    setPropertyTypes(p => {
      const updated = p.map(t => t.id === id ? { ...t, name } : t);
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    try {
      await api.patch(`/property-types/${id}`, { name });
      return true;
    } catch (err) {
      console.warn("Server sync warning (property type updated in client cache):", err);
      return true;
    }
  };

  const deletePropertyType = async (id: string) => {
    setPropertyTypes(p => {
      const updated = p.filter(t => t.id !== id);
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    try {
      await api.del(`/property-types/${id}`);
      return true;
    } catch (err) {
      console.warn("Server sync warning (property type deleted from client cache):", err);
      return true;
    }
  };

  const togglePropertyType = async (id: string) => {
    const current = propertyTypes.find(t => t.id === id);
    const active = !(current?.active ?? true);
    setPropertyTypes(p => {
      const updated = p.map(t => t.id === id ? { ...t, active } : t);
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    try {
      await api.patch(`/property-types/${id}`, { active });
      return true;
    } catch (err) {
      console.warn("Server sync warning (property type toggled in client cache):", err);
      return true;
    }
  };

  const addProperty = async (p: Omit<Property, "id" | "createdAt" | "code"> & { code?: string }) => {
    const code = p.code?.trim() || genCode();
    const sanitizedSourcePhones = (p.sourcePhones || []).filter(ph => ph && typeof ph === "string" && ph.trim());
    const property: Property = {
      ...p,
      code,
      sourcePhones: sanitizedSourcePhones,
      id: genId(),
      createdAt: new Date().toISOString(),
    };

    setProperties(prev => {
      const updated = [...prev, property];
      writeCache({
        regions,
        types: propertyTypes,
        properties: updated,
        settings,
      });
      return updated;
    });

    supabaseService.saveProperty(property).catch(() => {});

    try {
      await api.post("/properties", property);
      return true;
    } catch (err) {
      console.warn("Server sync warning (property saved in client cache):", err);
      return true;
    }
  };

  const updateProperty = async (id: string, p: Partial<Property>) => {
    let updatedTarget: Property | null = null;
    const targetIdLower = (id || "").toLowerCase().trim();

    setProperties(prev => {
      let found = false;
      const updated = prev.map(prop => {
        const matchId = (prop.id || "").toLowerCase().trim() === targetIdLower;
        const matchCode = (prop.code || "").toLowerCase().trim() === targetIdLower;
        if (matchId || matchCode) {
          found = true;
          updatedTarget = { ...prop, ...p, id: prop.id || id };
          return updatedTarget;
        }
        return prop;
      });

      if (!found && id) {
        updatedTarget = { ...p, id, code: p.code || id, createdAt: new Date().toISOString() } as Property;
        updated.push(updatedTarget);
      }

      writeCache({
        regions,
        types: propertyTypes,
        properties: updated,
        settings,
      });

      // Save to persistent overrides
      if (updatedTarget) {
        try {
          const overrides = JSON.parse(localStorage.getItem("alm_property_overrides") || "{}");
          overrides[id] = updatedTarget;
          if (updatedTarget.id) overrides[updatedTarget.id] = updatedTarget;
          if (updatedTarget.code) overrides[updatedTarget.code] = updatedTarget;
          localStorage.setItem("alm_property_overrides", JSON.stringify(overrides));
        } catch {}
      }

      return updated;
    });

    if (updatedTarget) {
      await supabaseService.saveProperty(updatedTarget).catch(() => {});
    }

    try {
      await api.patch(`/properties/${id}`, p);
      return true;
    } catch (err) {
      return true;
    }
  };

  const deleteProperty = async (id: string) => {
    const targetIdLower = (id || "").toLowerCase().trim();

    // 1. Add to persistent blacklist
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem("alm_deleted_properties") || "[]");
      if (!deleted.includes(id)) deleted.push(id);
      if (!deleted.includes(targetIdLower)) deleted.push(targetIdLower);
      localStorage.setItem("alm_deleted_properties", JSON.stringify(deleted));

      // Remove from persistent overrides
      const overrides = JSON.parse(localStorage.getItem("alm_property_overrides") || "{}");
      delete overrides[id];
      delete overrides[targetIdLower];
      localStorage.setItem("alm_property_overrides", JSON.stringify(overrides));
    } catch {}

    setProperties(prev => {
      const updated = prev.filter(x => {
        const matchId = (x.id || "").toLowerCase().trim() === targetIdLower;
        const matchCode = (x.code || "").toLowerCase().trim() === targetIdLower;
        return !matchId && !matchCode;
      });
      writeCache({
        regions,
        types: propertyTypes,
        properties: updated,
        settings,
      });
      return updated;
    });

    await supabaseService.deleteProperty(id).catch(() => {});

    try {
      await api.del(`/properties/${id}`);
    } catch (err) {
      console.warn("Server sync warning (deleted from client cache):", err);
    }
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

  const addUser = async (u: Omit<User, "id" | "joinedAt">) => {
    const finalEmail = u.email.trim().toLowerCase();
    const finalUsername = (u.username?.trim() || finalEmail.split("@")[0] || u.name.trim().replace(/\s+/g, "_")).toLowerCase();
    const finalPassword = u.password || "123456";

    const newUser: User = {
      ...u,
      name: u.name.trim(),
      email: finalEmail,
      username: finalUsername,
      password: finalPassword,
      id: genId(),
      joinedAt: new Date().toISOString(),
    };

    // Check duplicate email / username locally
    const duplicate = users.find(
      existing =>
        (existing.email && existing.email.toLowerCase() === finalEmail) ||
        (existing.username && existing.username.toLowerCase() === finalUsername)
    );
    if (duplicate) {
      toast({
        title: "تعذّرت إضافة المستخدم",
        description: "البريد الإلكتروني أو اسم المستخدم مستخدم من قبل.",
        variant: "destructive",
      });
      return false;
    }

    setUsers(prev => {
      const updated = [...prev, newUser];
      try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
      return updated;
    });

    supabaseService.saveUser(newUser).catch(() => {});

    try {
      const saved = await api.post<User>("/users", { ...newUser });
      if (saved && saved.id) {
        setUsers(prev => {
          const updated = prev.map(x => (x.id === newUser.id ? { ...saved, password: finalPassword } : x));
          try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
      return true;
    } catch (err: unknown) {
      console.warn("Server sync warning (user saved in client cache & Supabase):", err);
      return true;
    }
  };

  const updateUser = async (id: string, u: Partial<User>) => {
    let targetUser: User | null = null;
    setUsers(prev => {
      const updated = prev.map(x => {
        if (x.id === id) {
          targetUser = { ...x, ...u };
          return targetUser;
        }
        return x;
      });
      try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (targetUser) {
      supabaseService.saveUser(targetUser).catch(() => {});
    }

    try {
      await api.patch(`/users/${id}`, u);
      return true;
    } catch (err) {
      console.warn("Server sync warning (user updated in client cache):", err);
      return true;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem("alm_deleted_users") || "[]");
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        localStorage.setItem("alm_deleted_users", JSON.stringify(deletedList));
      }
    } catch {}

    setUsers(prev => {
      const updated = prev.filter(x => x.id !== id);
      try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
      return updated;
    });

    supabaseService.deleteUser(id).catch(() => {});

    try {
      await api.del(`/users/${id}`);
      return true;
    } catch (err) {
      console.warn("Server sync warning (user deleted from client cache):", err);
      return true;
    }
  };

  const toggleUser = async (id: string) => {
    let targetUser: User | null = null;
    setUsers(prev => {
      const updated = prev.map(x => {
        if (x.id === id) {
          targetUser = { ...x, active: !x.active };
          return targetUser;
        }
        return x;
      });
      try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (targetUser) {
      supabaseService.saveUser(targetUser).catch(() => {});
    }

    try {
      await api.patch(`/users/${id}`, { active: (targetUser as any)?.active });
      return true;
    } catch (err) {
      console.warn("Server sync warning (user toggled in client cache):", err);
      return true;
    }
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

  const addCustomerPropertyRequest = async (request: Omit<CustomerPropertyRequest, "id" | "createdAt" | "status">) => {
    const item: CustomerPropertyRequest = {
      ...request,
      id: genId(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setCustomerPropertyRequests((current) => [item, ...current]);
    try {
      const saved = await api.post<CustomerPropertyRequest>("/customer-property-requests", request);
      setCustomerPropertyRequests((current) => current.map((entry) => entry.id === item.id ? saved : entry));
      return true;
    } catch (err: unknown) {
      setCustomerPropertyRequests((current) => current.filter((entry) => entry.id !== item.id));
      const apiError = err as { status?: number; message?: string };
      toast({
        title: "تعذّر حفظ الطلب",
        description: apiError.status === 401 ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى." : apiError.message || "تعذّر حفظ التغيير على الخادم",
        variant: "destructive",
      });
      void reload();
      return false;
    }
  };
  const updateCustomerPropertyRequest = (id: string, request: Partial<Omit<CustomerPropertyRequest, "id" | "createdAt">>) => {
    setCustomerPropertyRequests((current) => current.map((item) => item.id === id ? { ...item, ...request } : item));
    return persist(api.patch(`/customer-property-requests/${id}`, request));
  };
  const deleteCustomerPropertyRequest = (id: string) => {
    setCustomerPropertyRequests((current) => current.filter((item) => item.id !== id));
    persist(api.del(`/customer-property-requests/${id}`));
  };

  const addContract = async (contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "contractNumber"> & { contractNumber?: string }) => {
    try {
      const saved = await api.post<Contract>("/contracts", contract);
      setContracts((current) => [saved, ...current]);
      return true;
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string };
      toast({
        title: "تعذّر حفظ العقد",
        description: apiError.status === 401 ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى." : apiError.message || "تعذّر حفظ العقد على الخادم",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateContract = async (id: string, contract: Partial<Omit<Contract, "id" | "createdAt" | "updatedAt">>) => {
    try {
      const saved = await api.patch<Contract>(`/contracts/${id}`, contract);
      setContracts((current) => current.map((item) => item.id === id ? saved : item));
      return true;
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string };
      toast({
        title: "تعذّر تحديث العقد",
        description: apiError.status === 401 ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى." : apiError.message || "تعذّر تحديث العقد على الخادم",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      await api.del(`/contracts/${id}`);
      setContracts((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string };
      toast({
        title: "تعذّر حذف العقد",
        description: apiError.status === 401 ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى." : apiError.message || "تعذّر حذف العقد على الخادم",
        variant: "destructive",
      });
      return false;
    }
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
       regions, propertyTypes, properties, users, inquiries, finishingRequests, propertyRequests, aiLeads, customerPropertyRequests, contracts, activityLogs, settings,
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
      addCustomerPropertyRequest, updateCustomerPropertyRequest, deleteCustomerPropertyRequest,
      addContract, updateContract, deleteContract,
      brokers, addBroker, updateBroker, deleteBroker,
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

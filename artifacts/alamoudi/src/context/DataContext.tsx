import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SEED_PROPERTIES } from "@/data/seedProperties";
import { supabaseService, rowToProperty } from "@/lib/supabaseService";
import { supabase } from "@/lib/supabaseClient";
import { enqueueOfflineAction, isOnline, processOfflineQueue } from "@/lib/offlineSync";

export interface Region { id: string; name: string; active: boolean; heroImage?: string; }
export interface PropertyType { id: string; name: string; active: boolean; }

export type PropertyStatus = "active" | "listed" | "draft" | "sold" | "rented" | "reserved";
export type PropertyCategory = "residential" | "administrative" | "medical" | "commercial" | "sale" | "rent" | "furnished";
export type PropertyListingType = "sale" | "rent" | "furnished";
export type PropertySourceType = "direct" | "broker" | "unspecified";

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
  agentType?: "direct" | "broker" | "unspecified" | string;
  images: string[];
  videoUrl: string;
  externalUrl: string;
  mapsUrl: string;
  createdAt: string;
  updatedAt?: string;
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

export interface QrCodeItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "url" | "image";
  url?: string;
  imageUrl?: string;
  icon?: "location" | "whatsapp" | "tiktok" | "website" | "phone" | "custom";
  active: boolean;
  showInHome?: boolean;
  showInPdf?: boolean;
  order?: number;
}

export interface HomeBackgroundSettings {
  enabled: boolean;
  // Dark Mode
  bgImageDark: string;
  overlayColorDark: string;
  overlayOpacityDark: number; // 0 - 100
  blurDark: number; // 0 - 25
  imageOpacityDark: number; // 0 - 100
  // Light Mode
  bgImageLight: string;
  overlayColorLight: string;
  overlayOpacityLight: number; // 0 - 100
  blurLight: number; // 0 - 25
  imageOpacityLight: number; // 0 - 100
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
  /** Ambient luxury backgrounds for home page sections */
  homeBackgroundSettings?: HomeBackgroundSettings;
  tiktokVideos: TiktokVideo[];
  ads: Ad[];
  qrCodes?: QrCodeItem[];
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
  qrCodes: [
    {
      id: "qr-wa",
      title: "تواصل واتساب مباشر",
      subtitle: "امسح للتحدث معنا فوراً على واتساب",
      type: "url",
      url: "https://wa.me/201000000000",
      icon: "whatsapp",
      active: true,
      showInHome: true,
      showInPdf: true,
      order: 1,
    },
    {
      id: "qr-maps",
      title: "موقعنا على الخريطة",
      subtitle: "امسح لفتح موقع مقر الشركة في خرائط جوجل",
      type: "url",
      url: "https://maps.google.com",
      icon: "location",
      active: true,
      showInHome: true,
      showInPdf: true,
      order: 2,
    },
    {
      id: "qr-web",
      title: "منصة العمودي العقارية",
      subtitle: "امسح لفتح المنصة وتصفح أحدث العقارات",
      type: "url",
      url: "https://alamoudi-real-estate.vercel.app/",
      icon: "website",
      active: true,
      showInHome: true,
      showInPdf: false,
      order: 3,
    },
  ],
  homeBackgroundSettings: {
    enabled: true,
    bgImageDark: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
    overlayColorDark: "#0B131B",
    overlayOpacityDark: 75,
    blurDark: 1,
    imageOpacityDark: 90,
    bgImageLight: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    overlayColorLight: "#F8FAFC",
    overlayOpacityLight: 80,
    blurLight: 1,
    imageOpacityLight: 85,
  },
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
  logActivity: (entry: {
    action: string;
    entityType: string;
    title: string;
    actor?: string;
  }) => ActivityLog;
  clearActivityLogs: () => Promise<boolean>;
}

export const DEFAULT_INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-init-1",
    action: "created",
    entityType: "system",
    title: "تهيئة منصة العمودي العقارية وقاعدة البيانات السحابية",
    actor: "النظام الأساسي",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "act-init-2",
    action: "status",
    entityType: "settings",
    title: "تفعيل نظام التزامن اللحظي وبث الأنشطة المباشر",
    actor: "مدير النظام",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "act-init-3",
    action: "created",
    entityType: "property",
    title: "اعتماد قائمة عقارات التجمع والشروق ومدينتي المحدثة",
    actor: "الإدارة (العمودي)",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

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
  { id: "shorouk", name: "مدينة الشروق", active: true },
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

// Memory Shield for in-flight/recent edits (prevents transient rollback from slower DB queries)
const recentPropertyEdits = new Map<string, { property: Property; timestamp: number }>();

export function recordRecentEdit(property: Property) {
  if (!property) return;
  const item = { property, timestamp: Date.now() };
  if (property.id) recentPropertyEdits.set(property.id, item);
  if (property.code) recentPropertyEdits.set(property.code.toLowerCase().trim(), item);

  try {
    const raw = localStorage.getItem("alm_recent_property_edits");
    const stored = raw ? JSON.parse(raw) : {};
    stored[property.id] = item;
    if (property.code) stored[property.code.toLowerCase().trim()] = item;
    localStorage.setItem("alm_recent_property_edits", JSON.stringify(stored));
  } catch {}
}

export function clearRecentEdit(idOrCode: string) {
  if (!idOrCode) return;
  const key = idOrCode.toLowerCase().trim();
  recentPropertyEdits.delete(idOrCode);
  recentPropertyEdits.delete(key);

  try {
    const raw = localStorage.getItem("alm_recent_property_edits");
    if (raw) {
      const stored = JSON.parse(raw);
      delete stored[idOrCode];
      delete stored[key];
      localStorage.setItem("alm_recent_property_edits", JSON.stringify(stored));
    }
  } catch {}
}

export function mergeFreshWithRecentEdits(freshList: Property[]): Property[] {
  const map = new Map<string, Property>();
  for (const fp of freshList) {
    if (fp && fp.id) map.set(fp.id, fp);
  }

  // Apply active recent edits (within 15 minutes) strictly over fresh DB reads
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  for (const [key, item] of recentPropertyEdits.entries()) {
    if (now - item.timestamp < fifteenMinutes && item.property && item.property.id) {
      map.set(item.property.id, item.property);
    } else if (now - item.timestamp >= fifteenMinutes) {
      recentPropertyEdits.delete(key);
    }
  }

  try {
    const raw = localStorage.getItem("alm_recent_property_edits");
    if (raw) {
      const stored = JSON.parse(raw);
      for (const k of Object.keys(stored)) {
        const it = stored[k];
        if (it && now - it.timestamp < fifteenMinutes && it.property && it.property.id) {
          map.set(it.property.id, it.property);
        }
      }
    }
  } catch {}

  return Array.from(map.values());
}

function readCache(): CachePayload | null {
  try {
    let raw = localStorage.getItem(CACHE_KEY);
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
    if (Date.now() - parsed.ts > CACHE_HARD_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(payload: Omit<CachePayload, "ts">) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), ...payload })); } catch {}
}

// Global broadcast channel for instant multi-device live sync
const globalBroadcastChannel = supabase ? supabase.channel("alm_global_sync", { config: { broadcast: { self: false } } }) : null;
if (globalBroadcastChannel) globalBroadcastChannel.subscribe();

export function sendRealtimeSync(event: string, payload: any) {
  if (globalBroadcastChannel) {
    globalBroadcastChannel.send({
      type: "broadcast",
      event: "sync_event",
      payload: { event, ...payload },
    }).catch(() => {});
  }
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel("alm_local_sync");
      bc.postMessage({ event, ...payload });
      bc.close();
    } catch {}
  }
}

function sanitizeRegions(list?: Region[] | null): Region[] {
  if (!list || !list.length) return DEFAULT_REGIONS;
  return list.map(r => {
    if (r.heroImage && (r.heroImage.includes("/city-heroes/") || r.heroImage.includes("shorouk.jpg"))) {
      return { ...r, heroImage: "" };
    }
    return r;
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [regions, setRegions] = useState<Region[]>(() => {
    try {
      const raw = localStorage.getItem("alm_regions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeRegions(parsed);
      }
    } catch {}
    const cached = readCache();
    return sanitizeRegions(cached?.regions?.length ? cached.regions : DEFAULT_REGIONS);
  });
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(() => {
    try {
      const raw = localStorage.getItem("alm_types");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const cached = readCache();
    return cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES;
  });
  const [properties, setProperties] = useState<Property[]>(() => {
    const cached = readCache();
    if (cached?.properties && cached.properties.length > 0) {
      return cached.properties;
    }
    return SEED_PROPERTIES;
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
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const raw = localStorage.getItem("alm_inquiries");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [finishingRequests, setFinishingRequests] = useState<FinishingRequest[]>(() => {
    try {
      const raw = localStorage.getItem("alm_finishing_requests");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>(() => {
    try {
      const raw = localStorage.getItem("alm_property_requests");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [aiLeads, setAiLeads] = useState<AiLead[]>(() => {
    try {
      const raw = localStorage.getItem("alm_ai_leads");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [customerPropertyRequests, setCustomerPropertyRequests] = useState<CustomerPropertyRequest[]>(() => {
    try {
      const raw = localStorage.getItem("alm_customer_requests");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const raw = localStorage.getItem("alm_contracts");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [brokers, setBrokers] = useState<Broker[]>(() => {
    try {
      const raw = localStorage.getItem("alm_brokers");
      return raw ? JSON.parse(raw) : DEFAULT_BROKERS;
    } catch {
      return DEFAULT_BROKERS;
    }
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const raw = localStorage.getItem("alm_activity_logs");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_INITIAL_ACTIVITIES;
  });
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ online: 0, today: 0, week: 0, month: 0 });
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const raw = localStorage.getItem("alm_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_SETTINGS, ...parsed, tiktokVideos: parsed.tiktokVideos ?? [], ads: parsed.ads ?? [] };
        }
      }
    } catch {}
    const cached = readCache();
    return cached?.settings
      ? { ...DEFAULT_SETTINGS, ...cached.settings, tiktokVideos: cached.settings.tiktokVideos ?? [], ads: cached.settings.ads ?? [] }
      : DEFAULT_SETTINGS;
  });

  const reload = useCallback(async () => {
    if (!isOnline()) return;
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
    if (newSettings) {
      const merged = { ...DEFAULT_SETTINGS, ...newSettings, tiktokVideos: newSettings.tiktokVideos ?? [], ads: newSettings.ads ?? [] };
      setSettings(merged);
      try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
    }
    supabaseService.fetchSettings().then(cloudSettings => {
      if (cloudSettings && Object.keys(cloudSettings).length > 0) {
        setSettings(prev => {
          const merged = { ...DEFAULT_SETTINGS, ...prev, ...cloudSettings, tiktokVideos: cloudSettings.tiktokVideos ?? prev.tiktokVideos ?? [], ads: cloudSettings.ads ?? prev.ads ?? [] };
          try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    }).catch(() => {});
    if (usersR.status === "fulfilled" && usersR.value) {
      setUsers(usersR.value);
      try { localStorage.setItem("alm_users", JSON.stringify(usersR.value)); } catch {}
    }
    if (inquiriesR.status === "fulfilled" && inquiriesR.value) {
      setInquiries(inquiriesR.value);
      try { localStorage.setItem("alm_inquiries", JSON.stringify(inquiriesR.value)); } catch {}
    }
    if (finishingR.status === "fulfilled" && finishingR.value) {
      setFinishingRequests(finishingR.value);
      try { localStorage.setItem("alm_finishing_requests", JSON.stringify(finishingR.value)); } catch {}
    }
    if (requestsR.status === "fulfilled" && requestsR.value) {
      setPropertyRequests(requestsR.value);
      try { localStorage.setItem("alm_property_requests", JSON.stringify(requestsR.value)); } catch {}
    }
    if (customerPropertyRequestsR.status === "fulfilled" && customerPropertyRequestsR.value) {
      setCustomerPropertyRequests(customerPropertyRequestsR.value);
      try { localStorage.setItem("alm_customer_requests", JSON.stringify(customerPropertyRequestsR.value)); } catch {}
    }
    if (contractsR.status === "fulfilled" && contractsR.value) {
      setContracts(contractsR.value);
      try { localStorage.setItem("alm_contracts", JSON.stringify(contractsR.value)); } catch {}
    }
    if (aiLeadsR.status === "fulfilled" && aiLeadsR.value) {
      setAiLeads(aiLeadsR.value);
      try { localStorage.setItem("alm_ai_leads", JSON.stringify(aiLeadsR.value)); } catch {}
    }
    if (activityR.status   === "fulfilled" && Array.isArray(activityR.value) && activityR.value.length > 0) {
      setActivityLogs(prev => {
        const mergedMap = new Map<string, ActivityLog>();
        activityR.value.forEach(l => mergedMap.set(l.id, l));
        prev.forEach(l => mergedMap.set(l.id, l));
        const merged = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        try { localStorage.setItem("alm_activity_logs", JSON.stringify(merged)); } catch {}
        return merged;
      });
    }
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
    if (!isOnline()) return;
    void api.post(`/properties/${id}/view`, {}).catch(() => {
      /* view tracking is best-effort; never surface errors to visitors */
    });
  }, []);

  const refreshVisitorStats = useCallback(async () => {
    if (!isOnline()) return;
    try {
      setVisitorStats(await api.get<VisitorStats>("/visitors/stats"));
    } catch {
      /* not authorized / not staff — ignore */
    }
  }, []);

  const reloadAiLeads = useCallback(async () => {
    if (!isOnline()) return;
    try {
      setAiLeads(await api.get<AiLead[]>("/ai/leads"));
    } catch {
      /* not authorized / not staff — ignore */
    }
  }, []);

  // Optimistic writes update local state first; if the server rejects or is offline,
  // store in offline queue and re-sync when online.
  const persist = useCallback((p: Promise<unknown>, offlineAction?: Parameters<typeof enqueueOfflineAction>[0]) => {
    return p
      .then(() => true)
      .catch((err: unknown) => {
        if (!isOnline() || (err && typeof err === "object" && "status" in err && (err as any).status === 503)) {
          if (offlineAction) {
            enqueueOfflineAction(offlineAction);
            toast({
              title: "تم الحفظ في وضع الأوفلاين 📶",
              description: "تم حفظ التغيير محلياً، وسيتم إرساله ومزامنته تلقائياً عند عودة الإنترنت.",
            });
            return true;
          }
        }
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
    const storedRegions = (() => {
      try {
        const raw = localStorage.getItem("alm_regions");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return sanitizeRegions(parsed);
        }
      } catch {}
      return cached?.regions?.length ? sanitizeRegions(cached.regions) : DEFAULT_REGIONS;
    })();

    const storedTypes = (() => {
      try {
        const raw = localStorage.getItem("alm_types");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
      return cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES;
    })();

    setRegions(storedRegions);
    setPropertyTypes(storedTypes);

    if (cached) {
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

      if (newRegions && newRegions.length > 0) {
        const clean = sanitizeRegions(newRegions);
        setRegions(clean);
        try { localStorage.setItem("alm_regions", JSON.stringify(clean)); } catch {}
      }

      if (newTypes && newTypes.length > 0) {
        setPropertyTypes(newTypes);
        try { localStorage.setItem("alm_types", JSON.stringify(newTypes)); } catch {}
      }

      if (newProps && newProps.length > 0) setProperties(newProps);
      else if (cached?.properties?.length) setProperties(cached.properties);

      if (newSettings) setSettings({ ...DEFAULT_SETTINGS, ...newSettings, tiktokVideos: newSettings.tiktokVideos ?? [], ads: newSettings.ads ?? [] });

      const gotData = newRegions !== null || newTypes !== null || newProps !== null || newSettings !== null;
      setFetching(false);
      setReady(true);

      if (gotData) {
        writeCache({
          regions: (newRegions && newRegions.length > 0) ? sanitizeRegions(newRegions) : storedRegions,
          types: (newTypes && newTypes.length > 0) ? newTypes : storedTypes,
          properties: (newProps && newProps.length > 0) ? newProps : (cached?.properties ?? []),
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
          if (inquiriesR.status === "fulfilled" && inquiriesR.value) {
            setInquiries(inquiriesR.value);
            try { localStorage.setItem("alm_inquiries", JSON.stringify(inquiriesR.value)); } catch {}
          }
          if (finishingR.status === "fulfilled" && finishingR.value) {
            setFinishingRequests(finishingR.value);
            try { localStorage.setItem("alm_finishing_requests", JSON.stringify(finishingR.value)); } catch {}
          }
          if (requestsR.status === "fulfilled" && requestsR.value) {
            setPropertyRequests(requestsR.value);
            try { localStorage.setItem("alm_property_requests", JSON.stringify(requestsR.value)); } catch {}
          }
          if (customerPropertyRequestsR.status === "fulfilled" && customerPropertyRequestsR.value) {
            setCustomerPropertyRequests(customerPropertyRequestsR.value);
            try { localStorage.setItem("alm_customer_requests", JSON.stringify(customerPropertyRequestsR.value)); } catch {}
          }
          if (contractsR.status === "fulfilled" && contractsR.value) {
            setContracts(contractsR.value);
            try { localStorage.setItem("alm_contracts", JSON.stringify(contractsR.value)); } catch {}
          }
          if (aiLeadsR.status === "fulfilled" && aiLeadsR.value) {
            setAiLeads(aiLeadsR.value);
            try { localStorage.setItem("alm_ai_leads", JSON.stringify(aiLeadsR.value)); } catch {}
          }
          if (activityR.status   === "fulfilled") setActivityLogs(activityR.value);
          if (visitorStatsR.status === "fulfilled") setVisitorStats(visitorStatsR.value);
        });
      }

      // Sync with Supabase cloud database
      supabaseService.fetchRegions().then(supabaseRegs => {
        if (destroyed) return;
        if (supabaseRegs && supabaseRegs.length > 0) {
          const clean = sanitizeRegions(supabaseRegs);
          setRegions(clean);
          try { localStorage.setItem("alm_regions", JSON.stringify(clean)); } catch {}
        }
      }).catch(() => {});

      supabaseService.fetchPropertyTypes().then(supabaseTypes => {
        if (destroyed) return;
        if (supabaseTypes && supabaseTypes.length > 0) {
          setPropertyTypes(supabaseTypes);
          try { localStorage.setItem("alm_types", JSON.stringify(supabaseTypes)); } catch {}
        }
      }).catch(() => {});

      supabaseService.fetchSettings().then(cloudSettings => {
        if (destroyed) return;
        if (cloudSettings && Object.keys(cloudSettings).length > 0) {
          setSettings(prev => {
            const merged = { ...DEFAULT_SETTINGS, ...prev, ...cloudSettings, tiktokVideos: cloudSettings.tiktokVideos ?? prev.tiktokVideos ?? [], ads: cloudSettings.ads ?? prev.ads ?? [] };
            try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
            writeCache({
              regions: cached?.regions?.length ? cached.regions : DEFAULT_REGIONS,
              types: cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES,
              properties: cached?.properties ?? [],
              settings: merged,
            });
            return merged;
          });
        }
      }).catch(() => {});

      supabaseService.seedInitialPropertiesIfEmpty().then(() => {
        supabaseService.fetchProperties().then(supabaseProps => {
          if (destroyed) return;
          if (supabaseProps && supabaseProps.length > 0) {
            const protectedList = mergeFreshWithRecentEdits(supabaseProps);
            setProperties(protectedList);
            writeCache({
              regions: cached?.regions?.length ? cached.regions : DEFAULT_REGIONS,
              types: cached?.types?.length ? cached.types : DEFAULT_PROPERTY_TYPES,
              properties: protectedList,
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

        supabaseService.fetchActivityLogs().then(supabaseLogs => {
          if (destroyed) return;
          if (supabaseLogs && supabaseLogs.length > 0) {
            setActivityLogs(prev => {
              const mergedMap = new Map<string, ActivityLog>();
              supabaseLogs.forEach(l => mergedMap.set(l.id, l));
              prev.forEach(l => mergedMap.set(l.id, l));
              const merged = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              try { localStorage.setItem("alm_activity_logs", JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        }).catch(() => {});
      }).catch(() => {});
    });

    // Multi-Layer Realtime Live Sync Engine
    const handleSyncPayload = (data: any) => {
      if (!data) return;
      const { event, property, propertyId, user, userId } = data;

      if (event === "PROPERTY_ADD" && property) {
        recordRecentEdit(property);
        setProperties(prev => {
          const exists = prev.some(p => p.id === property.id || (p.code && p.code.toLowerCase() === property.code.toLowerCase()));
          if (exists) {
            // Update if existing has older timestamp
            const updated = prev.map(p => {
              if (p.id === property.id || (p.code && p.code.toLowerCase() === property.code.toLowerCase())) {
                const prevTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
                const inTime = property.updatedAt ? new Date(property.updatedAt).getTime() : Date.now();
                return inTime >= prevTime ? { ...p, ...property } : p;
              }
              return p;
            });
            writeCache({ regions, types: propertyTypes, properties: updated, settings });
            return updated;
          }
          const updated = [property, ...prev];
          writeCache({ regions, types: propertyTypes, properties: updated, settings });
          return updated;
        });
      } else if (event === "PROPERTY_UPDATE" && property) {
        recordRecentEdit(property);
        setProperties(prev => {
          const updated = prev.map(p => {
            const match = p.id === property.id || (p.code && p.code.toLowerCase() === property.code.toLowerCase());
            if (match) {
              const prevTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
              const inTime = property.updatedAt ? new Date(property.updatedAt).getTime() : Date.now();
              return inTime >= prevTime ? { ...p, ...property } : p;
            }
            return p;
          });
          writeCache({ regions, types: propertyTypes, properties: updated, settings });
          return updated;
        });
      } else if (event === "PROPERTY_DELETE" && propertyId) {
        clearRecentEdit(propertyId);
        const idLower = String(propertyId).toLowerCase();
        setProperties(prev => {
          const updated = prev.filter(p => (p.id || "").toLowerCase() !== idLower && (p.code || "").toLowerCase() !== idLower);
          writeCache({ regions, types: propertyTypes, properties: updated, settings });
          return updated;
        });
      } else if ((event === "USER_ADD" || event === "USER_UPDATE") && user) {
        setUsers(prev => {
          const exists = prev.some(u => u.id === user.id);
          const updated = exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
          try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if (event === "USER_DELETE" && userId) {
        setUsers(prev => {
          const updated = prev.filter(u => u.id !== userId);
          try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if ((event === "REGION_ADD" || event === "REGION_UPDATE") && data.region) {
        setRegions(prev => {
          const cleanReg = sanitizeRegions([data.region])[0];
          const exists = prev.some(r => r.id === cleanReg.id);
          const updated = exists ? prev.map(r => r.id === cleanReg.id ? cleanReg : r) : [...prev, cleanReg];
          try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if (event === "REGION_DELETE" && data.regionId) {
        setRegions(prev => {
          const updated = prev.filter(r => r.id !== data.regionId);
          try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if ((event === "TYPE_ADD" || event === "TYPE_UPDATE") && data.propertyType) {
        setPropertyTypes(prev => {
          const exists = prev.some(t => t.id === data.propertyType.id);
          const updated = exists ? prev.map(t => t.id === data.propertyType.id ? data.propertyType : t) : [...prev, data.propertyType];
          try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if (event === "TYPE_DELETE" && data.typeId) {
        setPropertyTypes(prev => {
          const updated = prev.filter(t => t.id !== data.typeId);
          try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if (event === "ACTIVITY_LOG_ADD" && data.log) {
        setActivityLogs(prev => {
          const exists = prev.some(l => l.id === data.log.id);
          if (exists) return prev;
          const updated = [data.log, ...prev].slice(0, 500);
          try { localStorage.setItem("alm_activity_logs", JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else if (event === "ACTIVITY_LOG_CLEAR") {
        setActivityLogs([]);
        try { localStorage.removeItem("alm_activity_logs"); } catch {}
      } else if (event === "SETTINGS_UPDATE" && data.settings) {
        setSettings(prev => {
          const merged = { ...DEFAULT_SETTINGS, ...prev, ...data.settings };
          try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
          writeCache({ regions, types: propertyTypes, properties, settings: merged });
          return merged;
        });
      }
    };

    // 1. Supabase Broadcast Listener (Cross-Device Worldwide WebSocket)
    if (globalBroadcastChannel) {
      globalBroadcastChannel.on("broadcast", { event: "sync_event" }, (msg) => {
        handleSyncPayload(msg.payload);
      });
    }

    // 2. Local Cross-Tab / Desktop App BroadcastChannel Listener
    let localBc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        localBc = new BroadcastChannel("alm_local_sync");
        localBc.onmessage = (e) => {
          handleSyncPayload(e.data);
        };
      } catch {}
    }

    // 3. Supabase Postgres Changes fallback listener
    let realtimeChannel: any = null;
    if (supabase) {
      realtimeChannel = supabase
        .channel("alm_realtime_db")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "properties" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newProp = rowToProperty(payload.new);
              setProperties(prev => {
                const exists = prev.some(p => p.id === newProp.id);
                const updated = exists ? prev.map(p => p.id === newProp.id ? newProp : p) : [newProp, ...prev];
                writeCache({ regions, types: propertyTypes, properties: updated, settings });
                return updated;
              });
            } else if (payload.eventType === "UPDATE") {
              const updatedProp = rowToProperty(payload.new);
              setProperties(prev => {
                const updated = prev.map(p => {
                  if (p.id === updatedProp.id) {
                    const prevTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
                    const inTime = updatedProp.updatedAt ? new Date(updatedProp.updatedAt).getTime() : Date.now();
                    return inTime >= prevTime ? updatedProp : p;
                  }
                  return p;
                });
                writeCache({ regions, types: propertyTypes, properties: updated, settings });
                return updated;
              });
            } else if (payload.eventType === "DELETE") {
              const deletedId = (payload.old as any)?.id;
              if (deletedId) {
                setProperties(prev => {
                  const updated = prev.filter(p => p.id !== deletedId);
                  writeCache({ regions, types: propertyTypes, properties: updated, settings });
                  return updated;
                });
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users" },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const u = payload.new as any;
              const updatedUser: User = {
                id: u.id,
                name: u.name,
                email: u.email,
                username: u.username || "",
                password: u.password || "",
                role: u.role || "customer",
                active: u.active ?? true,
                canClearActivityLogs: u.can_clear_activity_logs ?? false,
                joinedAt: u.joined_at || new Date().toISOString(),
              };
              setUsers(prev => {
                const exists = prev.some(user => user.id === updatedUser.id);
                const updated = exists ? prev.map(user => user.id === updatedUser.id ? updatedUser : user) : [...prev, updatedUser];
                try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
                return updated;
              });
            } else if (payload.eventType === "DELETE") {
              const deletedId = (payload.old as any)?.id;
              if (deletedId) {
                setUsers(prev => {
                  const updated = prev.filter(u => u.id !== deletedId);
                  try { localStorage.setItem("alm_users", JSON.stringify(updated)); } catch {}
                  return updated;
                });
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "inquiries" },
          () => {
            supabaseService.fetchInquiries().then(inqs => {
              if (inqs) setInquiries(inqs);
            }).catch(() => {});
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "customer_property_requests" },
          () => {
            supabaseService.fetchCustomerRequests().then(reqs => {
              if (reqs) setCustomerPropertyRequests(reqs);
            }).catch(() => {});
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "regions" },
          () => {
            supabaseService.fetchRegions().then(regs => {
              if (regs && regs.length > 0) {
                const clean = sanitizeRegions(regs);
                setRegions(clean);
                try { localStorage.setItem("alm_regions", JSON.stringify(clean)); } catch {}
              }
            }).catch(() => {});
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "property_types" },
          () => {
            supabaseService.fetchPropertyTypes().then(types => {
              if (types && types.length > 0) {
                setPropertyTypes(types);
                try { localStorage.setItem("alm_types", JSON.stringify(types)); } catch {}
              }
            }).catch(() => {});
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_settings" },
          (payload) => {
            const newRow = payload.new as any;
            if (newRow && newRow.settings_json && typeof newRow.settings_json === "object") {
              setSettings(prev => {
                const merged = { ...DEFAULT_SETTINGS, ...prev, ...newRow.settings_json };
                try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
                writeCache({ regions, types: propertyTypes, properties, settings: merged });
                return merged;
              });
            }
          }
        )
        .subscribe();
    }

    // 4. Smart Foreground & Focus & Polling Sync (Memory Shield Protected)
    const syncFreshData = () => {
      supabaseService.fetchProperties().then(freshProps => {
        if (freshProps && freshProps.length > 0) {
          setProperties(prev => {
            const protectedList = mergeFreshWithRecentEdits(freshProps);
            const prevSig = prev.map(p => `${p.id}_${p.code}_${p.price}_${p.status}_${p.title}`).join("|");
            const mergedSig = protectedList.map(p => `${p.id}_${p.code}_${p.price}_${p.status}_${p.title}`).join("|");
            if (prevSig !== mergedSig) {
              writeCache({ regions, types: propertyTypes, properties: protectedList, settings });
              return protectedList;
            }
            return prev;
          });
        }
      }).catch(() => {});

      supabaseService.fetchUsers().then(freshUsers => {
        if (freshUsers && freshUsers.length > 0) {
          setUsers(freshUsers);
          try { localStorage.setItem("alm_users", JSON.stringify(freshUsers)); } catch {}
        }
      }).catch(() => {});

      supabaseService.fetchRegions().then(freshRegs => {
        if (freshRegs && freshRegs.length > 0) {
          const clean = sanitizeRegions(freshRegs);
          setRegions(prev => {
            const prevSig = prev.map(r => `${r.id}_${r.name}_${r.active}_${r.heroImage || ""}`).join("|");
            const freshSig = clean.map(r => `${r.id}_${r.name}_${r.active}_${r.heroImage || ""}`).join("|");
            if (prevSig !== freshSig) {
              try { localStorage.setItem("alm_regions", JSON.stringify(clean)); } catch {}
              return clean;
            }
            return prev;
          });
        }
      }).catch(() => {});

      supabaseService.fetchPropertyTypes().then(freshTypes => {
        if (freshTypes && freshTypes.length > 0) {
          setPropertyTypes(prev => {
            const prevSig = prev.map(t => `${t.id}_${t.name}_${t.active}`).join("|");
            const freshSig = freshTypes.map(t => `${t.id}_${t.name}_${t.active}`).join("|");
            if (prevSig !== freshSig) {
              try { localStorage.setItem("alm_types", JSON.stringify(freshTypes)); } catch {}
              return freshTypes;
            }
            return prev;
          });
        }
      }).catch(() => {});

      supabaseService.fetchSettings().then(freshSettings => {
        if (freshSettings && Object.keys(freshSettings).length > 0) {
          setSettings(prev => {
            const freshSig = JSON.stringify(freshSettings);
            const prevSig = JSON.stringify(prev);
            if (freshSig !== prevSig) {
              const merged = { ...DEFAULT_SETTINGS, ...prev, ...freshSettings };
              try { localStorage.setItem("alm_settings", JSON.stringify(merged)); } catch {}
              writeCache({ regions, types: propertyTypes, properties, settings: merged });
              return merged;
            }
            return prev;
          });
        }
      }).catch(() => {});
    };

    window.addEventListener("focus", syncFreshData);
    const onVisChange = () => {
      if (document.visibilityState === "visible") syncFreshData();
    };
    document.addEventListener("visibilitychange", onVisChange);
    const pollInterval = setInterval(syncFreshData, 10000);

    const handleOnlineResume = () => {
      void reload();
      void processOfflineQueue(async (endpoint, opts) => {
        if (opts.method === "POST") return api.post(endpoint, opts.body ? JSON.parse(opts.body) : {});
        if (opts.method === "PUT") return api.put(endpoint, opts.body ? JSON.parse(opts.body) : {});
        if (opts.method === "DELETE") return api.delete(endpoint);
        return api.get(endpoint);
      });
    };
    window.addEventListener("online", handleOnlineResume);

    return () => {
      destroyed = true;
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
      if (localBc) {
        localBc.close();
      }
      window.removeEventListener("focus", syncFreshData);
      window.removeEventListener("online", handleOnlineResume);
      document.removeEventListener("visibilitychange", onVisChange);
      clearInterval(pollInterval);
    };
  }, []);

  const logActivity = useCallback((entry: {
    action: string;
    entityType: string;
    title: string;
    actor?: string;
  }) => {
    let currentActor = entry.actor;
    if (!currentActor) {
      try {
        const savedAuth = localStorage.getItem("alm_auth_user");
        if (savedAuth) {
          const u = JSON.parse(savedAuth);
          if (u?.name) currentActor = u.name;
        }
      } catch {}
    }
    if (!currentActor) currentActor = "الإدارة (العمودي)";

    const newLog: ActivityLog = {
      id: "act-" + genId(),
      action: entry.action,
      entityType: entry.entityType,
      title: entry.title,
      actor: currentActor,
      createdAt: new Date().toISOString(),
    };

    setActivityLogs(prev => {
      const updated = [newLog, ...prev.filter(l => l.id !== newLog.id)].slice(0, 500);
      try { localStorage.setItem("alm_activity_logs", JSON.stringify(updated)); } catch {}
      return updated;
    });

    supabaseService.saveActivityLog(newLog).catch(() => {});
    sendRealtimeSync("ACTIVITY_LOG_ADD", { log: newLog });
    api.post("/activity-logs", newLog).catch(() => {});
    return newLog;
  }, []);

  const clearActivityLogs = useCallback(async () => {
    setActivityLogs([]);
    try { localStorage.removeItem("alm_activity_logs"); } catch {}
    supabaseService.clearActivityLogs().catch(() => {});
    sendRealtimeSync("ACTIVITY_LOG_CLEAR", {});
    try {
      await api.del("/activity-logs");
      return true;
    } catch {
      return true;
    }
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
    logActivity({ action: "created", entityType: "broker", title: `إضافة وسيط عقاري جديد (${newBroker.name})` });
    toast({ title: "تمت إضافة الوسيط بنجاح" });
    return true;
  }, [toast, logActivity]);

  const updateBroker = useCallback(async (id: string, patch: Partial<Broker>) => {
    let targetName = id;
    setBrokers(prev => {
      const updated = prev.map(b => {
        if (b.id === id) {
          targetName = patch.name || b.name;
          return { ...b, ...patch };
        }
        return b;
      });
      try { localStorage.setItem("alm_brokers", JSON.stringify(updated)); } catch {}
      return updated;
    });
    logActivity({ action: "updated", entityType: "broker", title: `تعديل بيانات الوسيط (${targetName})` });
    toast({ title: "تم تحديث بيانات الوسيط ✓" });
    return true;
  }, [toast, logActivity]);

  const deleteBroker = useCallback(async (id: string) => {
    setBrokers(prev => {
      const updated = prev.filter(b => b.id !== id);
      try { localStorage.setItem("alm_brokers", JSON.stringify(updated)); } catch {}
      return updated;
    });
    logActivity({ action: "deleted", entityType: "broker", title: `حذف وسيط عقاري (${id})` });
    toast({ title: "تم حذف الوسيط" });
    return true;
  }, [toast, logActivity]);

  const updateSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try { localStorage.setItem("alm_settings", JSON.stringify(next)); } catch {}
    writeCache({
      regions,
      types: propertyTypes,
      properties,
      settings: next,
    });
    // Cloud sync to Supabase (propagates across all devices worldwide)
    await supabaseService.saveSettings(next).catch(() => {});
    // Realtime broadcast (instant cross-tab & cross-device websocket update)
    sendRealtimeSync("SETTINGS_UPDATE", { settings: next });
    logActivity({ action: "updated", entityType: "settings", title: "تحديث إعدادات المنصة والموقع" });
    try {
      await api.put("/settings", next);
      return true;
    } catch (err) {
      return true;
    }
  }, [settings, regions, propertyTypes, properties, logActivity]);

  const addRegion = async (name: string, heroImage = "") => {
    const region: Region = { id: genId(), name, active: true, heroImage };
    setRegions(p => {
      const updated = [...p, region];
      try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    await supabaseService.saveRegion(region).catch(() => {});
    sendRealtimeSync("REGION_ADD", { region });
    logActivity({ action: "created", entityType: "region", title: `إضافة منطقة جديدة (${name})` });
    try {
      await api.post("/regions", region);
      return true;
    } catch (err) {
      return true;
    }
  };

  const updateRegion = async (id: string, name: string, heroImage?: string) => {
    let targetRegion: Region | undefined;
    setRegions(p => {
      const updated = p.map(r => {
        if (r.id === id) {
          targetRegion = { ...r, name, heroImage: heroImage !== undefined ? heroImage : (r.heroImage ?? "") };
          return targetRegion;
        }
        return r;
      });
      try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    if (targetRegion) {
      await supabaseService.saveRegion(targetRegion).catch(() => {});
      sendRealtimeSync("REGION_UPDATE", { region: targetRegion });
    }
    logActivity({ action: "updated", entityType: "region", title: `تعديل المنطقة (${name})` });
    try {
      await api.patch(`/regions/${id}`, { name, heroImage: heroImage !== undefined ? heroImage : "" });
      return true;
    } catch (err) {
      return true;
    }
  };

  const deleteRegion = async (id: string) => {
    setRegions(p => {
      const updated = p.filter(r => r.id !== id);
      try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    await supabaseService.deleteRegion(id).catch(() => {});
    sendRealtimeSync("REGION_DELETE", { regionId: id });
    logActivity({ action: "deleted", entityType: "region", title: `حذف منطقة (${id})` });
    try {
      await api.del(`/regions/${id}`);
      return true;
    } catch (err) {
      return true;
    }
  };

  const toggleRegion = async (id: string) => {
    let targetRegion: Region | undefined;
    setRegions(p => {
      const updated = p.map(r => {
        if (r.id === id) {
          targetRegion = { ...r, active: !r.active };
          return targetRegion;
        }
        return r;
      });
      try { localStorage.setItem("alm_regions", JSON.stringify(updated)); } catch {}
      writeCache({ regions: updated, types: propertyTypes, properties, settings });
      return updated;
    });
    if (targetRegion) {
      await supabaseService.saveRegion(targetRegion).catch(() => {});
      sendRealtimeSync("REGION_UPDATE", { region: targetRegion });
    }
    logActivity({
      action: "status",
      entityType: "region",
      title: `تغيير حالة تفعيل المنطقة (${targetRegion?.name || id}) إلى ${targetRegion?.active ? "مفعل" : "معطل"}`,
    });
    try {
      await api.patch(`/regions/${id}`, { active: targetRegion?.active ?? true });
      return true;
    } catch (err) {
      return true;
    }
  };

  const addPropertyType = async (name: string) => {
    const t: PropertyType = { id: genId(), name, active: true };
    setPropertyTypes(p => {
      const updated = [...p, t];
      try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    supabaseService.savePropertyType(t).catch(() => {});
    sendRealtimeSync("TYPE_ADD", { propertyType: t });
    logActivity({ action: "created", entityType: "property_type", title: `إضافة نوع عقار جديد (${name})` });
    try {
      await api.post("/property-types", t);
      return true;
    } catch (err) {
      return true;
    }
  };

  const updatePropertyType = async (id: string, name: string) => {
    let targetType: PropertyType | undefined;
    setPropertyTypes(p => {
      const updated = p.map(t => {
        if (t.id === id) {
          targetType = { ...t, name };
          return targetType;
        }
        return t;
      });
      try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    if (targetType) {
      supabaseService.savePropertyType(targetType).catch(() => {});
      sendRealtimeSync("TYPE_UPDATE", { propertyType: targetType });
    }
    logActivity({ action: "updated", entityType: "property_type", title: `تعديل نوع عقار (${name})` });
    try {
      await api.patch(`/property-types/${id}`, { name });
      return true;
    } catch (err) {
      return true;
    }
  };

  const deletePropertyType = async (id: string) => {
    setPropertyTypes(p => {
      const updated = p.filter(t => t.id !== id);
      try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    supabaseService.deletePropertyType(id).catch(() => {});
    sendRealtimeSync("TYPE_DELETE", { typeId: id });
    logActivity({ action: "deleted", entityType: "property_type", title: `حذف نوع عقار (${id})` });
    try {
      await api.del(`/property-types/${id}`);
      return true;
    } catch (err) {
      return true;
    }
  };

  const togglePropertyType = async (id: string) => {
    let targetType: PropertyType | undefined;
    setPropertyTypes(p => {
      const updated = p.map(t => {
        if (t.id === id) {
          targetType = { ...t, active: !t.active };
          return targetType;
        }
        return t;
      });
      try { localStorage.setItem("alm_types", JSON.stringify(updated)); } catch {}
      writeCache({ regions, types: updated, properties, settings });
      return updated;
    });
    if (targetType) {
      supabaseService.savePropertyType(targetType).catch(() => {});
      sendRealtimeSync("TYPE_UPDATE", { propertyType: targetType });
    }
    logActivity({
      action: "status",
      entityType: "property_type",
      title: `تغيير حالة نوع العقار (${targetType?.name || id}) إلى ${targetType?.active ? "مفعل" : "معطل"}`,
    });
    try {
      await api.patch(`/property-types/${id}`, { active: targetType?.active ?? true });
      return true;
    } catch (err) {
      return true;
    }
  };

  const addProperty = async (p: Omit<Property, "id" | "createdAt" | "code"> & { code?: string }) => {
    const code = p.code?.trim() || genCode();
    const sanitizedSourcePhones = (p.sourcePhones || []).filter(ph => ph && typeof ph === "string" && ph.trim());
    const nowIso = new Date().toISOString();
    const property: Property = {
      ...p,
      code,
      sourcePhones: sanitizedSourcePhones,
      id: genId(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    recordRecentEdit(property);

    setProperties(prev => {
      const updated = [property, ...prev];
      writeCache({
        regions,
        types: propertyTypes,
        properties: updated,
        settings,
      });
      return updated;
    });

    try {
      await supabaseService.saveProperty(property);
    } catch (err) {
      console.warn("Supabase direct save error:", err);
    }

    sendRealtimeSync("PROPERTY_ADD", { property });
    logActivity({
      action: "created",
      entityType: "property",
      title: `إضافة عقار جديد (${property.code}) - ${property.title || property.unitType || "وحدة عقارية"}`,
    });

    if (!isOnline()) {
      enqueueOfflineAction({
        type: "property",
        endpoint: "/properties",
        method: "POST",
        payload: property,
      });
      toast({
        title: "تم حفظ العقار في وضع الأوفلاين 📶",
        description: `تم حفظ العقار (${property.code}) محلياً، وسيتم رفعه ومزامنته تلقائياً فور عودة الاتصال.`,
      });
      return true;
    }

    try {
      await api.post("/properties", property);
      return true;
    } catch (err) {
      if (!isOnline() || (err && typeof err === "object" && "status" in err && (err as any).status === 503)) {
        enqueueOfflineAction({
          type: "property",
          endpoint: "/properties",
          method: "POST",
          payload: property,
        });
      }
      console.warn("Server sync warning (property saved in client cache):", err);
      return true;
    }
  };

  const updateProperty = async (id: string, p: Partial<Property>) => {
    let updatedTarget: Property | null = null;
    const targetIdLower = (id || "").toLowerCase().trim();
    const nowIso = new Date().toISOString();

    setProperties(prev => {
      let found = false;
      const updated = prev.map(prop => {
        const matchId = (prop.id || "").toLowerCase().trim() === targetIdLower;
        const matchCode = (prop.code || "").toLowerCase().trim() === targetIdLower;
        if (matchId || matchCode) {
          found = true;
          updatedTarget = { ...prop, ...p, id: prop.id || id, updatedAt: nowIso };
          return updatedTarget;
        }
        return prop;
      });

      if (!found && id) {
        updatedTarget = { ...p, id, code: p.code || id, createdAt: nowIso, updatedAt: nowIso } as Property;
        updated.push(updatedTarget);
      }

      if (updatedTarget) {
        recordRecentEdit(updatedTarget);
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
      recordRecentEdit(updatedTarget);
      await supabaseService.saveProperty(updatedTarget).catch(() => {});
      sendRealtimeSync("PROPERTY_UPDATE", { property: updatedTarget });
    }

    logActivity({
      action: "updated",
      entityType: "property",
      title: `تعديل بيانات العقار (${(updatedTarget as any)?.code || id})`,
    });

    try {
      await api.patch(`/properties/${id}`, p);
      return true;
    } catch (err) {
      return true;
    }
  };

  const deleteProperty = async (id: string) => {
    const targetIdLower = (id || "").toLowerCase().trim();
    clearRecentEdit(id);
    clearRecentEdit(targetIdLower);

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
    sendRealtimeSync("PROPERTY_DELETE", { propertyId: id });
    logActivity({
      action: "deleted",
      entityType: "property",
      title: `حذف العقار (${id}) من المنصة`,
    });

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
    logActivity({
      action: "deleted",
      entityType: "property",
      title: `حذف مجمّع لـ (${ids.length}) عقارات دفعة واحدة`,
    });
    persist(api.del("/properties/bulk", { ids }));
  };

  const bulkUpdateProperties = (ids: string[], updates: Partial<Property>) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setProperties(p => p.map(x => idSet.has(x.id) ? { ...x, ...updates } : x));
    logActivity({
      action: "updated",
      entityType: "property",
      title: `تعديل مجمّع لـ (${ids.length}) عقارات`,
    });
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
    logActivity({
      action: "imported",
      entityType: "property",
      title: `استيراد بيانات عقارات (تمت إضافة ${added} وتحديث ${updated})`,
    });
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
    sendRealtimeSync("USER_ADD", { user: newUser });
    logActivity({
      action: "created",
      entityType: "user",
      title: `إضافة مستخدم جديد (${newUser.name} - ${newUser.role})`,
    });

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
      sendRealtimeSync("USER_UPDATE", { user: targetUser });
    }

    logActivity({
      action: "updated",
      entityType: "user",
      title: `تعديل بيانات المستخدم (${u.name || (targetUser as any)?.name || id})`,
    });

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
    sendRealtimeSync("USER_DELETE", { userId: id });
    logActivity({
      action: "deleted",
      entityType: "user",
      title: `حذف المستخدم (${id})`,
    });

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

    logActivity({
      action: "status",
      entityType: "user",
      title: `تغيير حالة تفعيل المستخدم (${(targetUser as any)?.name || id}) إلى ${(targetUser as any)?.active ? "مفعل" : "معطل"}`,
    });

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
    try {
      const stored = JSON.parse(localStorage.getItem("alm_inquiries") || "[]");
      localStorage.setItem("alm_inquiries", JSON.stringify([inquiry, ...stored]));
    } catch {}
    logActivity({
      action: "created",
      entityType: "inquiry",
      title: `استفسار جديد من العميل (${inquiry.name}) بخصوص ${inquiry.subject || "خدمات الشركة"}`,
      actor: inquiry.name,
    });
    persist(api.post("/inquiries", inquiry), {
      type: "inquiry",
      endpoint: "/inquiries",
      method: "POST",
      payload: inquiry,
    });
  };

  const updateInquiryStatus = (id: string, status: Inquiry["status"]) => {
    setInquiries(p => p.map(x => x.id === id ? { ...x, status } : x));
    logActivity({
      action: "status",
      entityType: "inquiry",
      title: `تحديث حالة استفسار العميل (${id}) إلى (${status})`,
    });
    persist(api.patch(`/inquiries/${id}`, { status }));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(p => p.filter(x => x.id !== id));
    logActivity({
      action: "deleted",
      entityType: "inquiry",
      title: `حذف استفسار العميل (${id})`,
    });
    persist(api.del(`/inquiries/${id}`));
  };

  const addFinishingRequest = (r: Omit<FinishingRequest, "id" | "createdAt" | "status">) => {
    const fr: FinishingRequest = { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() };
    setFinishingRequests(p => [...p, fr]);
    try {
      const stored = JSON.parse(localStorage.getItem("alm_finishing_requests") || "[]");
      localStorage.setItem("alm_finishing_requests", JSON.stringify([fr, ...stored]));
    } catch {}
    logActivity({
      action: "created",
      entityType: "finishing_request",
      title: `طلب تشطيب جديد من العميل (${fr.name}) - ${fr.finishingType || "باقة تشطيب"}`,
      actor: fr.name,
    });
    persist(api.post("/finishing-requests", fr), {
      type: "finishing_request",
      endpoint: "/finishing-requests",
      method: "POST",
      payload: fr,
    });
  };

  const updateFinishingRequestStatus = (id: string, status: FinishingRequest["status"]) => {
    setFinishingRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
    logActivity({
      action: "status",
      entityType: "finishing_request",
      title: `تحديث حالة طلب التشطيب (${id}) إلى (${status})`,
    });
    persist(api.patch(`/finishing-requests/${id}`, { status }));
  };

  const deleteFinishingRequest = (id: string) => {
    setFinishingRequests(p => p.filter(x => x.id !== id));
    logActivity({
      action: "deleted",
      entityType: "finishing_request",
      title: `حذف طلب التشطيب (${id})`,
    });
    persist(api.del(`/finishing-requests/${id}`));
  };

  const addPropertyRequest = (r: Omit<PropertyRequest, "id" | "createdAt" | "status">) => {
    const pr: PropertyRequest = { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() };
    setPropertyRequests(p => [...p, pr]);
    try {
      const stored = JSON.parse(localStorage.getItem("alm_property_requests") || "[]");
      localStorage.setItem("alm_property_requests", JSON.stringify([pr, ...stored]));
    } catch {}
    logActivity({
      action: "created",
      entityType: "property_request",
      title: `طلب إضافة عقار جديد من العميل (${pr.ownerName})`,
      actor: pr.ownerName,
    });
    persist(api.post("/property-requests", pr), {
      type: "property_request",
      endpoint: "/property-requests",
      method: "POST",
      payload: pr,
    });
  };

  const updatePropertyRequestStatus = (id: string, status: PropertyRequest["status"]) => {
    setPropertyRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
    logActivity({
      action: "status",
      entityType: "property_request",
      title: `تحديث حالة طلب إضافة عقار (${id}) إلى (${status})`,
    });
    persist(api.patch(`/property-requests/${id}`, { status }));
  };

  const deletePropertyRequest = (id: string) => {
    setPropertyRequests(p => p.filter(x => x.id !== id));
    logActivity({
      action: "deleted",
      entityType: "property_request",
      title: `حذف طلب إضافة عقار (${id})`,
    });
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
      const stored = JSON.parse(localStorage.getItem("alm_customer_requests") || "[]");
      localStorage.setItem("alm_customer_requests", JSON.stringify([item, ...stored]));
    } catch {}
    logActivity({
      action: "created",
      entityType: "customer_property_request",
      title: `طلب عقار جديد من العميل (${item.customerName})`,
      actor: item.customerName,
    });
    if (!isOnline()) {
      enqueueOfflineAction({
        type: "customer_property_request",
        endpoint: "/customer-property-requests",
        method: "POST",
        payload: request,
      });
      toast({
        title: "تم الحفظ في وضع الأوفلاين 📶",
        description: "تم حفظ طلبك محلياً وسيتم إرساله ومزامنته تلقائياً عند عودة الإنترنت.",
      });
      return true;
    }
    try {
      const saved = await api.post<CustomerPropertyRequest>("/customer-property-requests", request);
      setCustomerPropertyRequests((current) => current.map((entry) => entry.id === item.id ? saved : entry));
      return true;
    } catch (err: unknown) {
      if (!isOnline() || (err && typeof err === "object" && "status" in err && (err as any).status === 503)) {
        enqueueOfflineAction({
          type: "customer_property_request",
          endpoint: "/customer-property-requests",
          method: "POST",
          payload: request,
        });
        toast({
          title: "تم الحفظ في وضع الأوفلاين 📶",
          description: "تم حفظ طلبك محلياً وسيتم إرساله ومزامنته تلقائياً عند عودة الإنترنت.",
        });
        return true;
      }
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
    logActivity({
      action: "updated",
      entityType: "customer_property_request",
      title: `تحديث بيانات طلب العميل (${id})`,
    });
    return persist(api.patch(`/customer-property-requests/${id}`, request));
  };

  const deleteCustomerPropertyRequest = (id: string) => {
    setCustomerPropertyRequests((current) => current.filter((item) => item.id !== id));
    logActivity({
      action: "deleted",
      entityType: "customer_property_request",
      title: `حذف طلب العميل (${id})`,
    });
    persist(api.del(`/customer-property-requests/${id}`));
  };

  const addContract = async (contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "contractNumber"> & { contractNumber?: string }) => {
    try {
      const saved = await api.post<Contract>("/contracts", contract);
      setContracts((current) => [saved, ...current]);
      logActivity({
        action: "created",
        entityType: "contract",
        title: `إنشاء عقد جديد (${saved.contractNumber || "عقد"})`,
      });
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
      logActivity({
        action: "updated",
        entityType: "contract",
        title: `تعديل العقد (${saved.contractNumber || id})`,
      });
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
      logActivity({
        action: "deleted",
        entityType: "contract",
        title: `حذف العقد (${id})`,
      });
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
    logActivity({
      action: "status",
      entityType: "inquiry",
      title: `تحديث حالة عميل المستشار الذكي (${id}) إلى (${status})`,
    });
    persist(api.patch(`/ai/leads/${id}`, { status }));
  };

  const deleteAiLead = (id: string) => {
    setAiLeads(p => p.filter(x => x.id !== id));
    logActivity({
      action: "deleted",
      entityType: "inquiry",
      title: `حذف عميل المستشار الذكي (${id})`,
    });
    persist(api.del(`/ai/leads/${id}`));
  };

  const addTiktokVideo = (v: Omit<TiktokVideo, "id">) => {
    logActivity({
      action: "created",
      entityType: "tiktok",
      title: `إضافة فيديو تيك توك جديد (${v.title || "فيديو"})`,
    });
    return updateSettings({ tiktokVideos: [...(settings.tiktokVideos ?? []), { ...v, id: genId() }] });
  };

  const updateTiktokVideo = (id: string, v: Partial<Omit<TiktokVideo, "id">>) => {
    logActivity({
      action: "updated",
      entityType: "tiktok",
      title: `تعديل فيديو تيك توك (${id})`,
    });
    return updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).map(x => x.id === id ? { ...x, ...v } : x) });
  };

  const deleteTiktokVideo = (id: string) => {
    logActivity({
      action: "deleted",
      entityType: "tiktok",
      title: `حذف فيديو تيك توك (${id})`,
    });
    return updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).filter(x => x.id !== id) });
  };

  // ── إدارة الإعلانات — routes مخصصة مع activity logging ─────────────────────
  const addAd = (a: Omit<Ad, "id">) => {
    const newAd: Ad = { ...a, id: genId(), views: 0, clicks: 0 };
    setSettings(prev => ({ ...prev, ads: [...(prev.ads ?? []), newAd] }));
    logActivity({
      action: "created",
      entityType: "ad",
      title: `إضافة إعلان جديد (${newAd.title || "إعلان تسويقي"})`,
    });
    persist(api.post("/ads/manage", newAd));
  };

  const updateAd = (id: string, a: Partial<Omit<Ad, "id">>) => {
    setSettings(prev => ({
      ...prev,
      ads: (prev.ads ?? []).map(x => x.id === id ? { ...x, ...a } : x),
    }));
    logActivity({
      action: "updated",
      entityType: "ad",
      title: `تعديل إعلان (${id})`,
    });
    persist(api.patch(`/ads/manage/${id}`, a));
  };

  const deleteAd = (id: string) => {
    setSettings(prev => ({ ...prev, ads: (prev.ads ?? []).filter(x => x.id !== id) }));
    logActivity({
      action: "deleted",
      entityType: "ad",
      title: `حذف إعلان (${id})`,
    });
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

  // تتبّع المشاهدات والنقرات
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
      logActivity, clearActivityLogs,
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

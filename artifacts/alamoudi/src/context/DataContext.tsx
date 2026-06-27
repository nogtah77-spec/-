import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Region { id: string; name: string; active: boolean; }
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
  agentType: "direct" | "broker";
  images: string[];
  videoUrl: string;
  externalUrl: string;
  mapsUrl: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
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

export interface TiktokVideo {
  id: string;
  thumbnail: string;
  title: string;
  videoUrl: string;
}

export interface SiteSettings {
  companyName: string;
  companyDescription: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  tiktok: string;
  tiktokName: string;
  tiktokAvatar: string;
  facebook: string;
  instagram: string;
  mapsUrl: string;
  heroImageUrl: string;
  tiktokVideos: TiktokVideo[];
}

const DEFAULT_REGIONS: Region[] = [
  { id: "shorouk", name: "مدينة الشروق", active: true },
  { id: "madinaty", name: "مدينتي", active: true },
  { id: "badr", name: "مدينة بدر", active: true },
  { id: "wasal", name: "كمباوند وصال", active: true },
  { id: "tagamoa", name: "التجمع", active: true },
  { id: "beit_elwatan", name: "بيت الوطن", active: true },
  { id: "rehab", name: "الرحاب", active: true },
  { id: "new_capital", name: "العاصمة الإدارية الجديدة", active: true },
  { id: "nasr_city", name: "مدينة نصر", active: true },
  { id: "mohandeseen", name: "المهندسين", active: true },
  { id: "sheikh_zayed", name: "الشيخ زايد", active: true },
  { id: "oct6", name: "6 أكتوبر", active: true },
];

const DEFAULT_PROPERTY_TYPES: PropertyType[] = [
  { id: "apartment", name: "شقة", active: true },
  { id: "duplex", name: "دوبلكس", active: true },
  { id: "villa", name: "فيلا", active: true },
  { id: "penthouse", name: "بنت هاوس", active: true },
  { id: "townhouse", name: "تاون هاوس", active: true },
  { id: "twinhouse", name: "توين هاوس", active: true },
  { id: "studio", name: "أستوديو", active: true },
  { id: "shop", name: "محل", active: true },
  { id: "office", name: "مكتب إداري", active: true },
  { id: "clinic", name: "عيادة", active: true },
  { id: "medical_center", name: "مركز طبي", active: true },
  { id: "restaurant", name: "مطعم", active: true },
  { id: "cafe", name: "كافيه", active: true },
  { id: "land", name: "أرض", active: true },
  { id: "pharmacy", name: "صيدلية", active: true },
  { id: "building", name: "عمارة", active: true },
];

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "العمودي للتسويق العقاري",
  companyDescription: "شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر.",
  phone1: "+20 10 0000 0000",
  phone2: "",
  whatsapp: "+20 10 0000 0000",
  email: "info@alamoudi.com",
  tiktok: "",
  tiktokName: "العمودي للتسويق العقاري",
  tiktokAvatar: "",
  facebook: "",
  instagram: "",
  mapsUrl: "https://maps.google.com",
  heroImageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
  tiktokVideos: [],
};

interface DataContextType {
  regions: Region[];
  propertyTypes: PropertyType[];
  properties: Property[];
  users: User[];
  inquiries: Inquiry[];
  finishingRequests: FinishingRequest[];
  propertyRequests: PropertyRequest[];
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => void;
  addRegion: (name: string) => void;
  updateRegion: (id: string, name: string) => void;
  deleteRegion: (id: string) => void;
  toggleRegion: (id: string) => void;
  addPropertyType: (name: string) => void;
  updatePropertyType: (id: string, name: string) => void;
  deletePropertyType: (id: string) => void;
  togglePropertyType: (id: string) => void;
  addProperty: (p: Omit<Property, "id" | "createdAt" | "code">) => void;
  updateProperty: (id: string, p: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
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
  addTiktokVideo: (v: Omit<TiktokVideo, "id">) => void;
  updateTiktokVideo: (id: string, v: Partial<Omit<TiktokVideo, "id">>) => void;
  deleteTiktokVideo: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function load<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function genCode() { return "ALM-" + Math.floor(10000 + Math.random() * 90000); }

function migrateProperty(p: any): Property {
  return {
    code: p.code || genCode(),
    floor: p.floor ?? 0,
    finishing: p.finishing ?? "",
    view: p.view ?? "",
    featured: p.featured ?? false,
    agentType: p.agentType ?? "direct",
    images: p.images ?? [],
    videoUrl: p.videoUrl ?? "",
    externalUrl: p.externalUrl ?? "",
    mapsUrl: p.mapsUrl ?? "",
    ...p,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>(() => load("alamoudi_regions", DEFAULT_REGIONS));
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(() => load("alamoudi_property_types", DEFAULT_PROPERTY_TYPES));
  const [properties, setProperties] = useState<Property[]>(() => (load<any[]>("alamoudi_properties", [])).map(migrateProperty));
  const [users, setUsers] = useState<User[]>(() => load("alamoudi_users", []));
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => load("alamoudi_inquiries", []));
  const [finishingRequests, setFinishingRequests] = useState<FinishingRequest[]>(() => load("alamoudi_finishing_requests", []));
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>(() => load("alamoudi_property_requests", []));
  const [settings, setSettings] = useState<SiteSettings>(() => load("alamoudi_settings", DEFAULT_SETTINGS));

  useEffect(() => { save("alamoudi_regions", regions); }, [regions]);
  useEffect(() => { save("alamoudi_property_types", propertyTypes); }, [propertyTypes]);
  useEffect(() => { save("alamoudi_properties", properties); }, [properties]);
  useEffect(() => { save("alamoudi_users", users); }, [users]);
  useEffect(() => { save("alamoudi_inquiries", inquiries); }, [inquiries]);
  useEffect(() => { save("alamoudi_finishing_requests", finishingRequests); }, [finishingRequests]);
  useEffect(() => { save("alamoudi_property_requests", propertyRequests); }, [propertyRequests]);
  useEffect(() => { save("alamoudi_settings", settings); }, [settings]);

  const updateSettings = (s: Partial<SiteSettings>) => setSettings(p => ({ ...p, ...s }));

  const addRegion = (name: string) => setRegions(p => [...p, { id: genId(), name, active: true }]);
  const updateRegion = (id: string, name: string) => setRegions(p => p.map(r => r.id === id ? { ...r, name } : r));
  const deleteRegion = (id: string) => setRegions(p => p.filter(r => r.id !== id));
  const toggleRegion = (id: string) => setRegions(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r));

  const addPropertyType = (name: string) => setPropertyTypes(p => [...p, { id: genId(), name, active: true }]);
  const updatePropertyType = (id: string, name: string) => setPropertyTypes(p => p.map(t => t.id === id ? { ...t, name } : t));
  const deletePropertyType = (id: string) => setPropertyTypes(p => p.filter(t => t.id !== id));
  const togglePropertyType = (id: string) => setPropertyTypes(p => p.map(t => t.id === id ? { ...t, active: !t.active } : t));

  const addProperty = (p: Omit<Property, "id" | "createdAt" | "code">) =>
    setProperties(prev => [...prev, { ...p, id: genId(), code: genCode(), createdAt: new Date().toISOString() }]);
  const updateProperty = (id: string, p: Partial<Property>) =>
    setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, ...p } : prop));
  const deleteProperty = (id: string) => setProperties(p => p.filter(x => x.id !== id));

  const addUser = (u: Omit<User, "id" | "joinedAt">) =>
    setUsers(p => [...p, { ...u, id: genId(), joinedAt: new Date().toISOString() }]);
  const updateUser = (id: string, u: Partial<User>) =>
    setUsers(p => p.map(x => x.id === id ? { ...x, ...u } : x));
  const deleteUser = (id: string) => setUsers(p => p.filter(x => x.id !== id));
  const toggleUser = (id: string) => setUsers(p => p.map(x => x.id === id ? { ...x, active: !x.active } : x));

  const addInquiry = (i: Omit<Inquiry, "id" | "createdAt" | "status">) =>
    setInquiries(p => [...p, { ...i, id: genId(), status: "new", createdAt: new Date().toISOString() }]);
  const updateInquiryStatus = (id: string, status: Inquiry["status"]) =>
    setInquiries(p => p.map(x => x.id === id ? { ...x, status } : x));
  const deleteInquiry = (id: string) => setInquiries(p => p.filter(x => x.id !== id));

  const addFinishingRequest = (r: Omit<FinishingRequest, "id" | "createdAt" | "status">) =>
    setFinishingRequests(p => [...p, { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() }]);
  const updateFinishingRequestStatus = (id: string, status: FinishingRequest["status"]) =>
    setFinishingRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
  const deleteFinishingRequest = (id: string) => setFinishingRequests(p => p.filter(x => x.id !== id));

  const addPropertyRequest = (r: Omit<PropertyRequest, "id" | "createdAt" | "status">) =>
    setPropertyRequests(p => [...p, { ...r, id: genId(), status: "new", createdAt: new Date().toISOString() }]);
  const updatePropertyRequestStatus = (id: string, status: PropertyRequest["status"]) =>
    setPropertyRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
  const deletePropertyRequest = (id: string) => setPropertyRequests(p => p.filter(x => x.id !== id));

  const addTiktokVideo = (v: Omit<TiktokVideo, "id">) =>
    updateSettings({ tiktokVideos: [...(settings.tiktokVideos ?? []), { ...v, id: genId() }] });
  const updateTiktokVideo = (id: string, v: Partial<Omit<TiktokVideo, "id">>) =>
    updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).map(x => x.id === id ? { ...x, ...v } : x) });
  const deleteTiktokVideo = (id: string) =>
    updateSettings({ tiktokVideos: (settings.tiktokVideos ?? []).filter(x => x.id !== id) });

  return (
    <DataContext.Provider value={{
      regions, propertyTypes, properties, users, inquiries, finishingRequests, propertyRequests, settings,
      updateSettings,
      addRegion, updateRegion, deleteRegion, toggleRegion,
      addPropertyType, updatePropertyType, deletePropertyType, togglePropertyType,
      addProperty, updateProperty, deleteProperty,
      addUser, updateUser, deleteUser, toggleUser,
      addInquiry, updateInquiryStatus, deleteInquiry,
      addFinishingRequest, updateFinishingRequestStatus, deleteFinishingRequest,
      addPropertyRequest, updatePropertyRequestStatus, deletePropertyRequest,
      addTiktokVideo, updateTiktokVideo, deleteTiktokVideo,
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

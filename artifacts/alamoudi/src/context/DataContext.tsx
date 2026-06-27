import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ---- Types ----
export interface Region {
  id: string;
  name: string;
  active: boolean;
}

export interface PropertyType {
  id: string;
  name: string;
  active: boolean;
}

export type PropertyStatus = "active" | "listed" | "draft" | "sold" | "rented" | "reserved";
export type PropertyCategory = "sale" | "rent" | "furnished" | "administrative" | "medical" | "commercial";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  beds: number;
  baths: number;
  floors: number;
  typeId: string;
  regionId: string;
  category: PropertyCategory;
  status: PropertyStatus;
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

export interface SiteSettings {
  companyName: string;
  companyDescription: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  tiktok: string;
  facebook: string;
  instagram: string;
  mapsUrl: string;
  heroImageUrl: string;
}

// ---- Default seed data ----
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
  facebook: "",
  instagram: "",
  mapsUrl: "https://maps.google.com",
  heroImageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
};

// ---- Context ----
interface DataContextType {
  regions: Region[];
  propertyTypes: PropertyType[];
  properties: Property[];
  users: User[];
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => void;
  // Regions CRUD
  addRegion: (name: string) => void;
  updateRegion: (id: string, name: string) => void;
  deleteRegion: (id: string) => void;
  toggleRegion: (id: string) => void;
  // Property Types CRUD
  addPropertyType: (name: string) => void;
  updatePropertyType: (id: string, name: string) => void;
  deletePropertyType: (id: string) => void;
  togglePropertyType: (id: string) => void;
  // Properties CRUD
  addProperty: (p: Omit<Property, "id" | "createdAt">) => void;
  updateProperty: (id: string, p: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  // Users CRUD
  addUser: (u: Omit<User, "id" | "joinedAt">) => void;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>(() =>
    loadFromStorage("alamoudi_regions", DEFAULT_REGIONS)
  );
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(() =>
    loadFromStorage("alamoudi_property_types", DEFAULT_PROPERTY_TYPES)
  );
  const [properties, setProperties] = useState<Property[]>(() =>
    loadFromStorage("alamoudi_properties", [])
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage("alamoudi_users", [])
  );
  const [settings, setSettings] = useState<SiteSettings>(() =>
    loadFromStorage("alamoudi_settings", DEFAULT_SETTINGS)
  );

  useEffect(() => { saveToStorage("alamoudi_regions", regions); }, [regions]);
  useEffect(() => { saveToStorage("alamoudi_property_types", propertyTypes); }, [propertyTypes]);
  useEffect(() => { saveToStorage("alamoudi_properties", properties); }, [properties]);
  useEffect(() => { saveToStorage("alamoudi_users", users); }, [users]);
  useEffect(() => { saveToStorage("alamoudi_settings", settings); }, [settings]);

  const updateSettings = (s: Partial<SiteSettings>) =>
    setSettings(prev => ({ ...prev, ...s }));

  // Region operations
  const addRegion = (name: string) =>
    setRegions(prev => [...prev, { id: generateId(), name, active: true }]);
  const updateRegion = (id: string, name: string) =>
    setRegions(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  const deleteRegion = (id: string) =>
    setRegions(prev => prev.filter(r => r.id !== id));
  const toggleRegion = (id: string) =>
    setRegions(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));

  // PropertyType operations
  const addPropertyType = (name: string) =>
    setPropertyTypes(prev => [...prev, { id: generateId(), name, active: true }]);
  const updatePropertyType = (id: string, name: string) =>
    setPropertyTypes(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  const deletePropertyType = (id: string) =>
    setPropertyTypes(prev => prev.filter(t => t.id !== id));
  const togglePropertyType = (id: string) =>
    setPropertyTypes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));

  // Property operations
  const addProperty = (p: Omit<Property, "id" | "createdAt">) =>
    setProperties(prev => [...prev, { ...p, id: generateId(), createdAt: new Date().toISOString() }]);
  const updateProperty = (id: string, p: Partial<Property>) =>
    setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, ...p } : prop));
  const deleteProperty = (id: string) =>
    setProperties(prev => prev.filter(p => p.id !== id));

  // User operations
  const addUser = (u: Omit<User, "id" | "joinedAt">) =>
    setUsers(prev => [...prev, { ...u, id: generateId(), joinedAt: new Date().toISOString() }]);
  const updateUser = (id: string, u: Partial<User>) =>
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...u } : user));
  const deleteUser = (id: string) =>
    setUsers(prev => prev.filter(u => u.id !== id));
  const toggleUser = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));

  return (
    <DataContext.Provider value={{
      regions, propertyTypes, properties, users, settings,
      updateSettings,
      addRegion, updateRegion, deleteRegion, toggleRegion,
      addPropertyType, updatePropertyType, deletePropertyType, togglePropertyType,
      addProperty, updateProperty, deleteProperty,
      addUser, updateUser, deleteUser, toggleUser,
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

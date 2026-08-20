import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { Property, Region, PropertyType, User, Inquiry, CustomerPropertyRequest, FinishingRequest, Contract, AiLead, SiteSettings } from "@/context/DataContext";
import { SEED_PROPERTIES } from "@/data/seedProperties";

// Helper to convert Property to DB Row
export function propertyToRow(p: Property) {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    description: p.description || "",
    price: p.price || 0,
    area: p.area || 0,
    beds: p.beds || 0,
    baths: p.baths || 0,
    floors: p.floors || 1,
    floor: p.floor || 0,
    finishing: p.finishing || "",
    view: p.view || "",
    type_id: p.typeId || null,
    region_id: p.regionId || null,
    category: p.category || "residential",
    listing_type: p.listingType || "sale",
    status: p.status || "active",
    featured: Boolean(p.featured),
    agent_type: p.agentType || "direct",
    images: p.images || [],
    video_url: p.videoUrl || "",
    external_url: p.externalUrl || "",
    maps_url: p.mapsUrl || "",
    unit_type: p.unitType || "",
    sub_area: p.subArea || "",
    layout: p.layout || "",
    floor_text: p.floorText || "",
    master: p.master || "",
    location: p.location || "",
    additional_features: p.additionalFeatures || "",
    elevator: p.elevator || "",
    parking: p.parking || "",
    source: p.source || "",
    source_phones: p.sourcePhones || [],
    assigned_staff_id: p.assignedStaffId || "",
    created_at: p.createdAt || new Date().toISOString(),
  };
}

// Helper to convert DB Row to Property
export function rowToProperty(r: any): Property {
  return {
    id: r.id,
    code: r.code,
    title: r.title || "",
    description: r.description || "",
    price: Number(r.price) || 0,
    area: Number(r.area) || 0,
    beds: Number(r.beds) || 0,
    baths: Number(r.baths) || 0,
    floors: Number(r.floors) || 1,
    floor: Number(r.floor) || 0,
    finishing: r.finishing || "",
    view: r.view || "",
    typeId: r.type_id || "",
    regionId: r.region_id || "",
    category: r.category || "residential",
    listingType: r.listing_type || "sale",
    status: r.status || "active",
    featured: Boolean(r.featured),
    agentType: r.agent_type || "direct",
    images: Array.isArray(r.images) ? r.images : [],
    videoUrl: r.video_url || "",
    externalUrl: r.external_url || "",
    mapsUrl: r.maps_url || "",
    unitType: r.unit_type || "",
    subArea: r.sub_area || "",
    layout: r.layout || "",
    floorText: r.floor_text || "",
    master: r.master || "",
    location: r.location || "",
    additionalFeatures: r.additional_features || "",
    elevator: r.elevator || "",
    parking: r.parking || "",
    source: r.source || "",
    sourcePhones: Array.isArray(r.source_phones) ? r.source_phones : [],
    assignedStaffId: r.assigned_staff_id || "",
    createdAt: r.created_at || new Date().toISOString(),
  };
}

export const supabaseService = {
  // Fetch all properties
  async fetchProperties(): Promise<Property[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data.map(rowToProperty);
    } catch (e) {
      console.warn("Supabase fetch properties error:", e);
      return null;
    }
  },

  // Save / insert property
  async saveProperty(property: Property): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = propertyToRow(property);
      const { error } = await supabase.from("properties").upsert(row);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase save property error:", e);
      return false;
    }
  },

  // Seed default properties if database is empty
  async seedInitialPropertiesIfEmpty(): Promise<void> {
    if (!supabase) return;
    try {
      const { count } = await supabase.from("properties").select("*", { count: "exact", head: true });
      if (count === 0 && SEED_PROPERTIES.length > 0) {
        console.log("Seeding Supabase with initial properties...");
        const rows = SEED_PROPERTIES.map(propertyToRow);
        await supabase.from("properties").upsert(rows);
      }
    } catch (e) {
      console.warn("Supabase seed check error:", e);
    }
  },

  // Delete property
  async deleteProperty(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase delete property error:", e);
      return false;
    }
  },

  // Save Customer Request
  async saveCustomerRequest(req: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = {
        id: req.id,
        customer_name: req.customerName,
        customer_phone: req.customerPhone,
        request_type: req.requestType || "buy",
        property_category: req.propertyCategory || "residential",
        region_id: req.regionId || null,
        budget_min: req.budgetMin || 0,
        budget_max: req.budgetMax || 0,
        notes: req.notes || "",
        status: req.status || "new",
        assigned_staff_id: req.assignedStaffId || null,
        created_at: req.createdAt || new Date().toISOString(),
      };
      const { error } = await supabase.from("customer_property_requests").upsert(row);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase save customer request error:", e);
      return false;
    }
  },

  // Save Inquiry
  async saveInquiry(inq: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = {
        id: inq.id,
        property_id: inq.propertyId || null,
        property_code: inq.propertyCode || null,
        name: inq.name,
        phone: inq.phone,
        message: inq.message || "",
        status: inq.status || "new",
        created_at: inq.createdAt || new Date().toISOString(),
      };
      const { error } = await supabase.from("inquiries").upsert(row);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase save inquiry error:", e);
      return false;
    }
  },

  // Fetch Users
  async fetchUsers(): Promise<User[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("users").select("*").order("joined_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username || "",
        role: u.role || "customer",
        active: u.active ?? true,
        canClearActivityLogs: u.can_clear_activity_logs ?? false,
        joinedAt: u.joined_at || new Date().toISOString(),
      }));
    } catch (e) {
      console.warn("Supabase fetch users error:", e);
      return null;
    }
  },

  // Save / upsert User
  async saveUser(user: User): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username || user.email.split("@")[0] || user.id,
        role: user.role || "customer",
        active: user.active ?? true,
        can_clear_activity_logs: user.canClearActivityLogs ?? false,
        joined_at: user.joinedAt || new Date().toISOString(),
      };
      const { error } = await supabase.from("users").upsert(row);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase save user error:", e);
      return false;
    }
  },

  // Delete User
  async deleteUser(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Supabase delete user error:", e);
      return false;
    }
  },
};

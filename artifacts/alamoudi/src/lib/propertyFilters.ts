import type { Property, PropertyType, Region } from "@/context/DataContext";

export type ListingCategory = "all" | "sale" | "rent" | "furnished";
export type PropertySector = "all" | "residential" | "commercial" | "administrative" | "medical";
export type SortOption = "newest" | "priceAsc" | "priceDesc" | "areaDesc";
export type ViewMode = "grid" | "list";

export interface PropertyFilterState {
  searchText: string;
  category: ListingCategory;
  sector: PropertySector;
  regionId: string;
  typeId: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  beds: string;
  baths: string;
  location: string;
  finishing: string;
  floor: string;
  elevator: string;
  sort: SortOption;
  viewMode: ViewMode;
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilterState = {
  searchText: "",
  category: "all",
  sector: "all",
  regionId: "",
  typeId: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  beds: "",
  baths: "",
  location: "",
  finishing: "",
  floor: "",
  elevator: "",
  sort: "newest",
  viewMode: "grid",
};

export const SECTOR_OPTIONS: Array<{ value: PropertySector; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "residential", label: "سكني" },
  { value: "commercial", label: "تجاري" },
  { value: "administrative", label: "إداري" },
  { value: "medical", label: "طبي" },
];

export const CATEGORY_OPTIONS: Array<{ value: ListingCategory; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "sale", label: "للبيع" },
  { value: "rent", label: "للإيجار" },
  { value: "furnished", label: "مفروش" },
];

const SECTOR_TYPE_GROUPS: Record<Exclude<PropertySector, "all" | "residential">, string[]> = {
  commercial: ["shop", "restaurant", "cafe"],
  administrative: ["office"],
  medical: ["clinic", "medical_center", "pharmacy"],
};

const normalise = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const normaliseFinishing = (value: unknown) => normalise(value).replace(/\s+/g, "");
const numberValue = (value: string) => (value.trim() ? Number(value) : null);

function matchesSector(property: Property, sector: PropertySector): boolean {
  if (sector === "all") return true;
  if (sector === "residential") {
    return !Object.values(SECTOR_TYPE_GROUPS).some((ids) => ids.includes(property.typeId));
  }
  return SECTOR_TYPE_GROUPS[sector].includes(property.typeId);
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilterState,
  regions: Region[],
  propertyTypes: PropertyType[],
): Property[] {
  const q = normalise(filters.searchText);
  const minPrice = numberValue(filters.minPrice);
  const maxPrice = numberValue(filters.maxPrice);
  const minArea = numberValue(filters.minArea);
  const maxArea = numberValue(filters.maxArea);
  const beds = numberValue(filters.beds);
  const baths = numberValue(filters.baths);
  const typeNames = new Map(propertyTypes.map((type) => [type.id, type.name]));
  const regionNames = new Map(regions.map((region) => [region.id, region.name]));

  const filtered = properties.filter((property) => {
    if (filters.regionId && property.regionId !== filters.regionId) return false;
    if (filters.category !== "all" && property.category !== filters.category) return false;
    if (!matchesSector(property, filters.sector)) return false;
    if (filters.typeId && property.typeId !== filters.typeId) return false;
    if (minPrice !== null && property.price < minPrice) return false;
    if (maxPrice !== null && property.price > maxPrice) return false;
    if (minArea !== null && property.area < minArea) return false;
    if (maxArea !== null && property.area > maxArea) return false;
    if (beds !== null && property.beds < beds) return false;
    if (baths !== null && property.baths < baths) return false;
    if (filters.finishing && normaliseFinishing(property.finishing) !== normaliseFinishing(filters.finishing)) return false;
    if (filters.floor && ![String(property.floor), property.floorText ?? ""].some((value) => normalise(value).includes(normalise(filters.floor)))) return false;
    if (filters.elevator && normalise(property.elevator) !== normalise(filters.elevator)) return false;
    if (filters.location) {
      const location = normalise(filters.location);
      const searchableLocation = normalise([property.location, property.subArea, property.view].join(" "));
      if (!searchableLocation.includes(location)) return false;
    }
    if (q) {
      const haystack = normalise([
        property.title,
        property.code,
        property.description,
        property.location,
        property.subArea,
        property.finishing,
        property.view,
        property.unitType,
        regionNames.get(property.regionId),
        typeNames.get(property.typeId),
      ].join(" "));
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "priceAsc") return a.price - b.price;
    if (filters.sort === "priceDesc") return b.price - a.price;
    if (filters.sort === "areaDesc") return b.area - a.area;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export function hasActivePropertyFilters(filters: PropertyFilterState): boolean {
  return Boolean(
    filters.searchText.trim() ||
    filters.regionId ||
    filters.typeId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea ||
    filters.beds ||
    filters.baths ||
    filters.location ||
    filters.finishing ||
    filters.floor ||
    filters.elevator ||
    filters.category !== "all" ||
    filters.sector !== "all",
  );
}
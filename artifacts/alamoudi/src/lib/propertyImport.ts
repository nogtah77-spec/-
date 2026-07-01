import * as XLSX from "xlsx";
import type { PropertyCategory, PropertyStatus } from "@/context/DataContext";

export interface ParsedProperty {
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
  unitType?: string;
  subArea?: string;
  layout?: string;
  master?: string;
  elevator?: string;
  floorText?: string;
  location?: string;
  source?: string;
}

export interface ParseResult {
  items: ParsedProperty[];
  sheets: { name: string; count: number }[];
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function arabicToWestern(input: string): string {
  return String(input ?? "")
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/٬/g, "");
}

export function cleanCell(v: unknown): string {
  const s = String(v ?? "").trim();
  if (s === "—" || s === "-" || s === "–" || s === "_") return "";
  return s;
}

export function parseArea(raw: unknown): number {
  const s = arabicToWestern(cleanCell(raw));
  const m = s.match(/[\d.]+/);
  return m ? Math.round(parseFloat(m[0])) : 0;
}

export function parsePrice(raw: unknown): number {
  const cleaned = arabicToWestern(cleanCell(raw)).replace(/[,،]/g, "").trim();
  if (!cleaned) return 0;
  // When several pricing options are listed (e.g. "5 مليون كاش | 5.5 مليون 6 شهور",
  // "50 ألف طويل | 55 ألف قصير"), use only the first/primary option.
  const segment = cleaned.split(/[|\n]/)[0];
  // Sum every amount within the segment, e.g. "3 مليون و 600 ألف" = 3,600,000.
  let total = 0;
  let hasUnit = false;
  for (const m of segment.matchAll(/([\d.]+)\s*مليون/g)) {
    const v = parseFloat(m[1]);
    if (!Number.isNaN(v)) {
      total += v * 1_000_000;
      hasUnit = true;
    }
  }
  for (const m of segment.matchAll(/([\d.]+)\s*(?:ألف|الف)/g)) {
    const v = parseFloat(m[1]);
    if (!Number.isNaN(v)) {
      total += v * 1000;
      hasUnit = true;
    }
  }
  if (hasUnit) return Math.round(total);
  // No unit word (e.g. "1500 / يوم" or a plain number): take the first numeric run.
  const m = segment.match(/[\d.]+/);
  if (!m) return 0;
  let token = m[0];
  // Grouped thousands separators like "3.600.000" -> strip the dots.
  if (/^\d{1,3}(\.\d{3})+$/.test(token)) token = token.replace(/\./g, "");
  const num = parseFloat(token);
  return Number.isNaN(num) ? 0 : Math.round(num);
}

export function parseLayout(raw: unknown): { beds: number; baths: number } {
  const s = arabicToWestern(cleanCell(raw));
  const bedsM = s.match(/(\d+)\s*غر/);
  const bathsM = s.match(/(\d+)\s*حمام/);
  return {
    beds: bedsM ? parseInt(bedsM[1], 10) : 0,
    baths: bathsM ? parseInt(bathsM[1], 10) : 0,
  };
}

function parseFloorNumber(raw: unknown): number {
  const s = arabicToWestern(cleanCell(raw));
  if (/أرضي|ارضي/.test(s)) return 0;
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function sourceToAgentType(source: string): "direct" | "broker" {
  const s = source.trim().toLowerCase();
  if (!s) return "direct";
  // Explicit "direct owner" wording wins.
  if (/(مباشر|مالك|صاحب|direct|owner)/.test(s)) return "direct";
  // Any broker/agent/office wording (Arabic or English) => broker.
  if (/(بروكر|سمسار|وسيط|مكتب|شركة|broker|agent|agency|office)/.test(s)) return "broker";
  return "direct";
}

interface SheetMeta {
  regionId: string;
  regionName: string;
  category: PropertyCategory;
}

export function sheetMeta(sheetName: string): SheetMeta {
  const n = sheetName;
  let regionId = "";
  let regionName = "";
  if (/شروق/.test(n)) {
    regionId = "shorouk";
    regionName = "مدينة الشروق";
  } else if (/مدينتي/.test(n)) {
    regionId = "madinaty";
    regionName = "مدينتي";
  } else if (/وصال/.test(n)) {
    regionId = "wasal";
    regionName = "كمباوند وصال";
  } else if (/بدر/.test(n)) {
    regionId = "badr";
    regionName = "مدينة بدر";
  } else if (/نصر/.test(n)) {
    regionId = "nasr_city";
    regionName = "مدينة نصر";
  } else {
    regionId = n.trim().replace(/\s*\(.*\)\s*/, "").replace(/\s+/g, "_") || "other";
    regionName = n.replace(/\s*\(.*\)\s*/, "").trim();
  }

  let category: PropertyCategory = "sale";
  if (/إيجار|ايجار/.test(n)) category = "rent";
  else if (/مفروش/.test(n)) category = "furnished";
  else if (/بيع/.test(n)) category = "sale";

  return { regionId, regionName, category };
}

const HEADER_FIELD: Record<string, string> = {
  "النوع": "unitType",
  "الكود": "code",
  "المنطقة": "subArea",
  "المساحة": "area",
  "الدور": "floorText",
  "التوزيع": "layout",
  "ماستر": "master",
  "التشطيب": "finishing",
  "أسانسير": "elevator",
  "اسانسير": "elevator",
  "الفيو": "view",
  "السعر": "price",
  "المصدر": "source",
  "الموقع": "location",
};

const CATEGORY_LABEL: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  furnished: "مفروش",
};

function buildTitle(p: {
  area: number;
  regionName: string;
  subArea?: string;
  category: PropertyCategory;
}): string {
  const parts: string[] = ["شقة"];
  if (p.area) parts.push(`${p.area}م²`);
  const loc = p.subArea && p.subArea !== p.regionName ? `${p.regionName} - ${p.subArea}` : p.regionName;
  return `${parts.join(" ")} (${CATEGORY_LABEL[p.category]}) - ${loc}`;
}

function buildDescription(parts: (string | undefined)[]): string {
  return parts.map((x) => (x ?? "").trim()).filter(Boolean).join("، ");
}

function rowToProperty(
  fieldByIndex: Record<number, string>,
  row: unknown[],
  meta: SheetMeta,
): ParsedProperty | null {
  const get = (field: string): string => {
    const idx = Object.keys(fieldByIndex).find((k) => fieldByIndex[Number(k)] === field);
    return idx !== undefined ? cleanCell(row[Number(idx)]) : "";
  };

  const unitType = get("unitType");
  const code = get("code");
  const subArea = get("subArea");
  const areaRaw = get("area");
  const floorText = get("floorText");
  const layoutRaw = get("layout");
  const master = get("master");
  const finishing = get("finishing");
  const elevator = get("elevator");
  const view = get("view");
  const priceRaw = get("price");
  const source = get("source");
  const location = get("location");

  const hasData = [unitType, code, subArea, areaRaw, layoutRaw, priceRaw].some(Boolean);
  if (!hasData) return null;

  const area = parseArea(areaRaw);
  const { beds, baths } = parseLayout(layoutRaw);
  const price = parsePrice(priceRaw);
  const layout = arabicToWestern(layoutRaw);

  return {
    code: code || "",
    title: buildTitle({ area, regionName: meta.regionName, subArea, category: meta.category }),
    description: buildDescription([
      unitType ? `النوع: ${unitType}` : "",
      layout || "",
      finishing ? `التشطيب: ${finishing}` : "",
      view ? `الفيو: ${view}` : "",
    ]),
    price,
    area,
    beds,
    baths,
    floors: 0,
    floor: parseFloorNumber(floorText),
    finishing,
    view,
    typeId: "apartment",
    regionId: meta.regionId,
    category: meta.category,
    status: "active",
    featured: false,
    agentType: sourceToAgentType(source),
    images: [],
    videoUrl: "",
    externalUrl: "",
    mapsUrl: "",
    unitType,
    subArea,
    layout,
    master,
    elevator,
    floorText: arabicToWestern(floorText),
    location,
    source,
  };
}

function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const cells = rows[i].map((c) => cleanCell(c));
    if (cells.includes("النوع") && cells.includes("الكود")) return i;
  }
  return -1;
}

function isNumberingRow(row: unknown[]): boolean {
  const cells = row.map((c) => cleanCell(c)).filter(Boolean);
  if (cells.length === 0) return true;
  return cells.every((c) => c === "#" || /^\d+$/.test(arabicToWestern(c)));
}

export function parseSheet(rows: unknown[][], sheetName: string): ParsedProperty[] {
  const headerIdx = findHeaderRow(rows);
  if (headerIdx === -1) return [];
  const meta = sheetMeta(sheetName);
  const headerRow = rows[headerIdx].map((c) => cleanCell(c));
  const fieldByIndex: Record<number, string> = {};
  headerRow.forEach((h, i) => {
    const field = HEADER_FIELD[h];
    if (field) fieldByIndex[i] = field;
  });

  const out: ParsedProperty[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (isNumberingRow(row)) continue;
    const labels = row.map((c) => cleanCell(c));
    if (labels.includes("النوع") && labels.includes("الكود")) continue;
    const item = rowToProperty(fieldByIndex, row, meta);
    if (item) out.push(item);
  }
  return out;
}

export function parseWorkbookBytes(bytes: Uint8Array): ParseResult {
  const wb = XLSX.read(bytes, { type: "array" });
  const items: ParsedProperty[] = [];
  const sheets: { name: string; count: number }[] = [];
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], {
      header: 1,
      defval: "",
      raw: false,
    });
    const parsed = parseSheet(rows, name);
    if (parsed.length > 0) {
      items.push(...parsed);
      sheets.push({ name, count: parsed.length });
    }
  }
  return { items, sheets };
}

function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function splitDelimited(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

interface RegionLite {
  id: string;
  name: string;
}

const STATUS_VALUES = new Set([
  "active",
  "listed",
  "draft",
  "sold",
  "rented",
  "reserved",
]);

export function parseDelimitedText(
  text: string,
  regions: RegionLite[],
  types: RegionLite[] = [],
): ParseResult {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { items: [], sheets: [] };
  const delim = detectDelimiter(lines[0]);
  const headers = splitDelimited(lines[0], delim);

  const regionByName = new Map(regions.map((r) => [r.name.trim(), r.id]));
  const typeByName = new Map(types.map((t) => [t.name.trim(), t.id]));
  const typeIds = new Set(types.map((t) => t.id));
  const catByLabel: Record<string, PropertyCategory> = {
    "للبيع": "sale",
    "بيع": "sale",
    sale: "sale",
    "للإيجار": "rent",
    "إيجار": "rent",
    rent: "rent",
    "مفروش": "furnished",
    furnished: "furnished",
    "إداري": "administrative",
    administrative: "administrative",
    "طبي": "medical",
    medical: "medical",
    "تجاري": "commercial",
    commercial: "commercial",
  };

  const pick = (cells: string[], names: string[]): string => {
    for (const n of names) {
      const idx = headers.indexOf(n);
      if (idx !== -1) return cleanCell(cells[idx]);
    }
    return "";
  };

  const items: ParsedProperty[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitDelimited(lines[i], delim);
    const title = pick(cells, ["العنوان", "title"]);
    const layoutRaw = pick(cells, ["التوزيع", "layout"]);
    const { beds: lb, baths: lba } = parseLayout(layoutRaw);
    const bedsRaw = pick(cells, ["غرف_النوم", "الغرف", "beds"]);
    const bathsRaw = pick(cells, ["الحمامات", "baths"]);
    const regionName = pick(cells, ["المنطقة", "region"]);
    const catRaw = pick(cells, ["الفئة", "category"]);
    const source = pick(cells, ["المصدر", "source"]);
    const code = pick(cells, ["الكود", "code"]);
    const finishing = pick(cells, ["التشطيب", "finishing"]);
    const view = pick(cells, ["الفيو", "view"]);
    const typeRaw = pick(cells, ["النوع", "type", "unitType"]);
    const statusRaw = pick(cells, ["الحالة", "status"]).trim().toLowerCase();
    const featuredRaw = pick(cells, ["مميز", "featured"]).trim();
    const agentRaw = pick(cells, ["نوع_العرض", "agentType"]).trim().toLowerCase();

    if (!title && !code && !pick(cells, ["السعر", "price"])) continue;

    const regionId = regionByName.get(regionName.trim()) || "";
    const category = catByLabel[catRaw.trim()] || "sale";
    const typeKey = typeRaw.trim();
    const typeId = typeByName.get(typeKey) || (typeIds.has(typeKey) ? typeKey : "apartment");
    const status = (STATUS_VALUES.has(statusRaw) ? statusRaw : "active") as PropertyStatus;
    const featured = /^(نعم|true|1|yes)$/i.test(featuredRaw);
    const agentType: "direct" | "broker" =
      agentRaw === "broker" || agentRaw === "بروكر"
        ? "broker"
        : agentRaw === "direct" || agentRaw === "مباشر"
          ? "direct"
          : sourceToAgentType(source);

    items.push({
      code: code || "",
      title: title || buildTitle({ area: parseArea(pick(cells, ["المساحة", "area"])), regionName, category }),
      description: pick(cells, ["الوصف", "description"]),
      price: parsePrice(pick(cells, ["السعر", "price"])),
      area: parseArea(pick(cells, ["المساحة", "area"])),
      beds: bedsRaw ? parseInt(arabicToWestern(bedsRaw), 10) || 0 : lb,
      baths: bathsRaw ? parseInt(arabicToWestern(bathsRaw), 10) || 0 : lba,
      floors: 0,
      floor: parseFloorNumber(pick(cells, ["الدور", "floor"])),
      finishing,
      view,
      typeId,
      regionId,
      category,
      status,
      featured,
      agentType,
      images: [],
      videoUrl: pick(cells, ["رابط_الفيديو", "الفيديو", "videoUrl"]),
      externalUrl: pick(cells, ["رابط_خارجي", "externalUrl"]),
      mapsUrl: pick(cells, ["رابط_الخريطة", "الخريطة", "mapsUrl"]),
      unitType: pick(cells, ["النوع", "unitType"]),
      subArea: pick(cells, ["المنطقة الفرعية", "subArea"]),
      layout: arabicToWestern(layoutRaw),
      master: pick(cells, ["ماستر", "master"]),
      elevator: pick(cells, ["أسانسير", "اسانسير", "elevator"]),
      floorText: arabicToWestern(pick(cells, ["الدور", "floor"])),
      location: pick(cells, ["الموقع", "location"]),
      source,
    });
  }
  return { items, sheets: [{ name: "ملف", count: items.length }] };
}

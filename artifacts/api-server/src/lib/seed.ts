import { eq, and } from "drizzle-orm";
import {
  db,
  pool,
  regionsTable,
  propertyTypesTable,
  propertiesTable,
  usersTable,
  settingsTable,
} from "@workspace/db";
import { SEED_PROPERTIES } from "../data/seedProperties";
import { hashPassword } from "./auth";
import { logger } from "./logger";

const DEFAULT_REGIONS = [
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

const DEFAULT_PROPERTY_TYPES = [
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

const DEFAULT_SETTINGS = {
  companyName: "العمودي للتسويق العقاري",
  companyDescription:
    "شريكك الموثوق في عالم العقارات الفاخرة. نقدم لك أفضل الفرص الاستثمارية في مصر.",
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
  heroImageUrl:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
  tiktokVideos: [],
};

async function ensureSessionTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL,
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`,
  );
}

export async function seedDatabase(): Promise<void> {
  await ensureSessionTable();

  const existingRegions = await db.select({ id: regionsTable.id }).from(regionsTable).limit(1);
  if (existingRegions.length === 0) {
    await db.insert(regionsTable).values(DEFAULT_REGIONS);
    logger.info("Seeded default regions");
  }

  const existingTypes = await db
    .select({ id: propertyTypesTable.id })
    .from(propertyTypesTable)
    .limit(1);
  if (existingTypes.length === 0) {
    await db.insert(propertyTypesTable).values(DEFAULT_PROPERTY_TYPES);
    logger.info("Seeded default property types");
  }

  const existingProps = await db
    .select({ id: propertiesTable.id })
    .from(propertiesTable)
    .limit(1);
  if (existingProps.length === 0 && SEED_PROPERTIES.length > 0) {
    await db.insert(propertiesTable).values(SEED_PROPERTIES);
    logger.info({ count: SEED_PROPERTIES.length }, "Seeded properties");
  }

  const admin = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.role, "admin"), eq(usersTable.active, true)))
    .limit(1);
  if (admin.length === 0) {
    const adminUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";
    await db
      .insert(usersTable)
      .values({
        id: "admin-root",
        name: "مدير النظام",
        email: "admin@alamoudi.com",
        username: adminUsername,
        passwordHash: await hashPassword(adminPassword),
        role: "admin",
        active: true,
        joinedAt: new Date("2026-01-01").toISOString(),
      })
      .onConflictDoNothing();
    logger.info("Seeded default admin user");
  }

  const existingSettings = await db
    .select({ id: settingsTable.id })
    .from(settingsTable)
    .limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settingsTable).values({ id: "main", data: DEFAULT_SETTINGS });
    logger.info("Seeded default settings");
  }
}

import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, customerPropertyRequestsTable } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { actorFromReq, logActivity } from "../lib/activityLog";

const router: IRouter = Router();

const editableFields = [
  "customerName",
  "phone",
  "whatsapp",
  "email",
  "requestType",
  "transactionType",
  "preferredAreas",
  "budgetMin",
  "budgetMax",
  "bedrooms",
  "bathrooms",
  "areaMin",
  "areaMax",
  "finishing",
  "furnished",
  "paymentMethod",
  "requiredFeatures",
  "details",
  "notes",
  "source",
  "followUpDate",
  "assignedStaffId",
  "viewingDate",
] as const;

const textFields = Object.fromEntries(editableFields.map((field) => [field, z.string().optional()])) as Record<
  (typeof editableFields)[number],
  z.ZodOptional<z.ZodString>
>;

const requestBodySchema = z.object(textFields)
  .refine((value) => Boolean(value.customerName?.trim()), {
    message: "اسم العميل مطلوب",
    path: ["customerName"],
  })
  .refine((value) => Boolean(value.phone?.trim()), {
    message: "رقم الهاتف مطلوب",
    path: ["phone"],
  });

const updateBodySchema = z.object({
  ...textFields,
  status: z.enum(["new", "reviewed", "replied", "closed"]).optional(),
});

router.get("/customer-property-requests", requireStaff, async (_req, res): Promise<void> => {
  const rows = await db.select().from(customerPropertyRequestsTable);
  res.json(rows);
});

router.post("/customer-property-requests", requireStaff, async (req, res): Promise<void> => {
  const parsed = requestBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(customerPropertyRequestsTable).values({
    id: randomUUID(),
    ...parsed.data,
    status: "new",
    createdAt: new Date().toISOString(),
  }).returning();

  await logActivity({
    action: "created",
    entityType: "customer_property_request",
    title: `تم تسجيل طلب عقاري للعميل ${row.customerName}`,
    actor: actorFromReq(req),
  });
  res.status(201).json(row);
});

router.patch("/customer-property-requests/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = updateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(customerPropertyRequestsTable)
    .set(parsed.data)
    .where(eq(customerPropertyRequestsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }

  await logActivity({
    action: parsed.data.status ? "status" : "updated",
    entityType: "customer_property_request",
    title: `تم تحديث طلب العميل ${row.customerName}`,
    actor: actorFromReq(req),
  });
  res.json(row);
});

router.delete("/customer-property-requests/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [existing] = await db
    .select({ customerName: customerPropertyRequestsTable.customerName })
    .from(customerPropertyRequestsTable)
    .where(eq(customerPropertyRequestsTable.id, id))
    .limit(1);
  await db.delete(customerPropertyRequestsTable).where(eq(customerPropertyRequestsTable.id, id));
  if (existing) {
    await logActivity({
      action: "deleted",
      entityType: "customer_property_request",
      title: `تم حذف طلب العميل ${existing.customerName}`,
      actor: actorFromReq(req),
    });
  }
  res.sendStatus(204);
});

export default router;
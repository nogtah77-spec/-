import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, activityLogsTable } from "@workspace/db";
import { requireStaff } from "../lib/auth";

const router: IRouter = Router();

router.get("/activity-logs", requireStaff, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(500);
  res.json(rows);
});

export default router;

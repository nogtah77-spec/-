import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tiktokRouter from "./tiktok";
import authRouter from "./auth";
import regionsRouter from "./regions";
import propertyTypesRouter from "./propertyTypes";
import propertiesRouter from "./properties";
import usersRouter from "./users";
import inquiriesRouter from "./inquiries";
import finishingRequestsRouter from "./finishingRequests";
import propertyRequestsRouter from "./propertyRequests";
import aiConsultantRouter from "./aiConsultant";
import settingsRouter from "./settings";
import activityLogsRouter from "./activityLogs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tiktokRouter);
router.use(authRouter);
router.use(regionsRouter);
router.use(propertyTypesRouter);
router.use(propertiesRouter);
router.use(usersRouter);
router.use(inquiriesRouter);
router.use(finishingRequestsRouter);
router.use(propertyRequestsRouter);
router.use(aiConsultantRouter);
router.use(settingsRouter);
router.use(activityLogsRouter);

export default router;

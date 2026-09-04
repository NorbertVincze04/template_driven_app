import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const appointmentRouter = Router();

appointmentRouter.get("/mine", tenantMiddleware, authMiddleware, (req, res) =>
  AppointmentController.listMine(req, res),
);
appointmentRouter.patch(
  "/mine/:id",
  tenantMiddleware,
  authMiddleware,
  (req, res) => AppointmentController.updateMine(req, res),
);
appointmentRouter.delete(
  "/mine/:id",
  tenantMiddleware,
  authMiddleware,
  (req, res) => AppointmentController.deleteMine(req, res),
);
appointmentRouter.post(
  "/mine/:id/cancel-request",
  tenantMiddleware,
  authMiddleware,
  (req, res) => AppointmentController.requestCancel(req, res),
);
appointmentRouter.post(
  "/mine/:id/reschedule-request",
  tenantMiddleware,
  authMiddleware,
  (req, res) => AppointmentController.requestReschedule(req, res),
);
appointmentRouter.patch(
  "/requests/:id",
  tenantMiddleware,
  authMiddleware,
  (req, res) => AppointmentController.resolveRequest(req, res),
);

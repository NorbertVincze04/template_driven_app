import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const appointmentRouter = Router();

appointmentRouter.get("/mine", tenantMiddleware, authMiddleware, (req, res) =>
  AppointmentController.listMine(req, res),
);

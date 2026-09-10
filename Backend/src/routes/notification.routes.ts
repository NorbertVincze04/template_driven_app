import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const notificationRouter = Router();
notificationRouter.use(tenantMiddleware, authMiddleware);

notificationRouter.get("/", (req, res) =>
  NotificationController.list(req, res),
);
notificationRouter.patch("/read-all", (req, res) =>
  NotificationController.markAllRead(req, res),
);
notificationRouter.patch("/:id/read", (req, res) =>
  NotificationController.markRead(req, res),
);
notificationRouter.delete("/:id", (req, res) =>
  NotificationController.delete(req, res),
);

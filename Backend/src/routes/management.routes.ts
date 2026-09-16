import { Router } from "express";
import { ManagementController } from "../controllers/ManagementController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const managementRouter = Router();
managementRouter.use(tenantMiddleware, authMiddleware);
managementRouter.get("/analytics", (req, res) =>
  ManagementController.analytics(req, res),
);
managementRouter.get("/users", (req, res) =>
  ManagementController.listUsers(req, res),
);
managementRouter.patch("/users/:userId/barber-role", (req, res) =>
  ManagementController.setBarberRole(req, res),
);
managementRouter.patch("/users/:userId/note", (req, res) =>
  ManagementController.updateNote(req, res),
);

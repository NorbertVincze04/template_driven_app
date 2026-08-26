import { Router } from "express";
import { PublicController } from "../controllers/PublicController.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

export const publicRouter = Router();
publicRouter.use(tenantMiddleware);
publicRouter.get("/barbers", (req, res) =>
  PublicController.listBarbers(req, res),
);
publicRouter.get("/barbers/:barberId", (req, res) =>
  PublicController.getBarber(req, res),
);
publicRouter.get("/services", (req, res) =>
  PublicController.listServices(req, res),
);
publicRouter.get("/availability", (req, res) =>
  PublicController.availability(req, res),
);
publicRouter.post("/appointments", (req, res) =>
  PublicController.createGuestAppointment(req, res),
);
publicRouter.post("/appointments/account", authMiddleware, (req, res) =>
  PublicController.createAccountAppointment(req, res),
);
publicRouter.get("/schedule", authMiddleware, (req, res) =>
  PublicController.getSchedule(req, res),
);
publicRouter.put("/schedule", authMiddleware, (req, res) =>
  PublicController.saveSchedule(req, res),
);
publicRouter.post("/schedule/blocked", authMiddleware, (req, res) =>
  PublicController.blockTime(req, res),
);
publicRouter.delete("/schedule/blocked/:id", authMiddleware, (req, res) =>
  PublicController.unblockTime(req, res),
);
publicRouter.post("/services", authMiddleware, (req, res) =>
  PublicController.createService(req, res),
);
publicRouter.get("/services/mine", authMiddleware, (req, res) =>
  PublicController.listMyServices(req, res),
);

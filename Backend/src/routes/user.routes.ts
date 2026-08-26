import { Router } from "express";
import { UserController } from "../controllers/UserController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const userRouter = Router();

userRouter.patch("/me", tenantMiddleware, authMiddleware, (req, res) =>
  UserController.updateProfile(req, res),
);

import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { authRateLimiter } from "../middleware/rateLimit.middleware.ts";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", tenantMiddleware, authRateLimiter, (req, res) =>
  AuthController.register(req, res),
);

authRouter.post("/login", tenantMiddleware, authRateLimiter, (req, res) =>
  AuthController.login(req, res),
);

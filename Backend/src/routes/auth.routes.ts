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

authRouter.post(
  "/forgot-password",
  tenantMiddleware,
  authRateLimiter,
  (req, res) => AuthController.forgotPassword(req, res),
);

authRouter.post(
  "/verify-reset-code",
  tenantMiddleware,
  authRateLimiter,
  (req, res) => AuthController.verifyResetCode(req, res),
);

authRouter.post(
  "/reset-password",
  tenantMiddleware,
  authRateLimiter,
  (req, res) => AuthController.resetPassword(req, res),
);

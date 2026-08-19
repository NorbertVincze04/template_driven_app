import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { authRateLimiter } from "../middleware/rateLimit.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, (req, res) =>
  AuthController.register(req, res),
);

authRouter.post("/login", authRateLimiter, (req, res) =>
  AuthController.login(req, res),
);

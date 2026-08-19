import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService.ts";
import {
  validateLoginRequest,
  validateRegisterRequest,
  type LoginRequest,
  type RegisterRequest,
} from "../validators/auth.validator.ts";

export class AuthController {
  static async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateRegisterRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { fullName, email, password, secretKey } = req.body;

      const user = await AuthService.registerUser(fullName, email, password);

      return res.json({
        success: true,
        payload: user,
      });
    } catch (error: any) {
      console.error("Register failed:", error);

      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Register failed.",
      });
    }
  }

  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateLoginRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { email, password } = req.body;

      const result = await AuthService.loginUser(email, password);

      return res.json({
        success: true,
        payload: result,
      });
    } catch (error: any) {
      console.error("Login failed:", error);

      return res.status(401).json({
        success: false,
        message: error.message || "Login failed.",
      });
    }
  }
}

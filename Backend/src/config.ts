import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

// load settings from .env file
dotenv.config();

// configure app
export const PORT = Number(process.env.PORT || 3000);
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
export const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured.");
}
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];

// SMTP is optional: when unset, outgoing mail (e.g. password reset codes) is
// logged to the console instead of sent, so local development works without setup.
export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const SMTP_FROM = process.env.SMTP_FROM || "no-reply@example.com";
export const SMTP_SECURE = process.env.SMTP_SECURE === "true";

import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/user.types.ts";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config.ts";

// jwt token used for authentication and authorization

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      shopId: user.shopId,
      shopSlug: user.shopSlug,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }

    const payload = decoded as Partial<UserPayload>;
    if (
      typeof payload.id !== "string" ||
      typeof payload.shopId !== "string" ||
      typeof payload.shopSlug !== "string" ||
      typeof payload.fullName !== "string" ||
      typeof payload.email !== "string" ||
      !["ADMIN", "BARBER", "CUSTOMER"].includes(payload.role ?? "")
    ) {
      return null;
    }

    return payload as UserPayload;
  } catch (error) {
    return null;
  }
}

import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/user.types.ts";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config.ts";

// jwt token used for authentication and authorization

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      type: user.type,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

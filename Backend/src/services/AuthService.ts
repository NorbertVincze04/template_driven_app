import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.ts";
import { generateToken } from "../utils/jwt.utils.ts";
import type { UserPayload } from "../types/user.types.ts";

export class AuthService {
  static async registerUser(
    fullName: string,
    email: string,
    password: string,
  ): Promise<{ id: number; fullName: string; email: string; type: string }> {
    const existingUser = await UserRepository.existsByEmail(email);
    if (existingUser) {
      throw new Error("An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10); // 2^n rounds of hashing, 10 is standard

    const user = await UserRepository.create(
      fullName,
      email,
      passwordHash,
      "user",
    );

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
    };
  }

  static async loginUser(
    email: string,
    password: string,
  ): Promise<{
    id: number;
    fullName: string;
    email: string;
    type: string;
    token: string;
  }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email or password is incorrect.");
    }

    const userPayload: UserPayload = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
    };

    const token = generateToken(userPayload);

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
      token,
    };
  }
}

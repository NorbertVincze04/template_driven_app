import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.ts";
import { generateToken } from "../utils/jwt.utils.ts";
import type { UserPayload } from "../types/user.types.ts";
import type { ShopRecord } from "../types/tenant.types.ts";

export class AuthService {
  static async registerUser(
    fullName: string,
    email: string,
    password: string,
    shop: ShopRecord,
  ): Promise<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    shopId: string;
    shopSlug: string;
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserRepository.existsByEmail(
      shop.id,
      normalizedEmail,
    );
    if (existingUser) {
      throw new Error("An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10); // 2^n rounds of hashing, 10 is standard

    const user = await UserRepository.create(
      fullName,
      normalizedEmail,
      passwordHash,
      shop.id,
    );

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      shopId: shop.id,
      shopSlug: shop.slug,
    };
  }

  static async loginUser(
    email: string,
    password: string,
    shop: ShopRecord,
  ): Promise<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    shopId: string;
    shopSlug: string;
    token: string;
  }> {
    const user = await UserRepository.findByEmail(
      shop.id,
      email.trim().toLowerCase(),
    );
    if (!user) {
      throw new Error("Email or password is incorrect.");
    }

    const userPayload: UserPayload = {
      id: user.id,
      shopId: user.shop_id,
      shopSlug: user.shop_slug,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(userPayload);

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      shopId: user.shop_id,
      shopSlug: user.shop_slug,
      token,
    };
  }
}

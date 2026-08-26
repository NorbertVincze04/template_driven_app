import type { UserRecord } from "../types/user.types.ts";
import { pool } from "../db.ts";

export class UserRepository {
  static async findByEmail(
    shopId: string,
    email: string,
  ): Promise<UserRecord | null> {
    const { rows } = await pool.query<UserRecord>(
      `
            SELECT u.id, u.shop_id, s.slug AS shop_slug, u.full_name,
              u.email, u.phone_number, u.profile_image_url,
              u.profile_image_position_x, u.profile_image_position_y,
              u.password_hash, u.role
            FROM users u
            INNER JOIN shops s ON s.id = u.shop_id
            WHERE u.shop_id = $1 AND u.email = $2 AND u.is_active = TRUE
      `,
      [shopId, email],
    );

    return rows[0] || null;
  }

  static async create(
    fullName: string,
    email: string,
    passwordHash: string,
    shopId: string,
    role: "ADMIN" | "BARBER" | "CUSTOMER" = "CUSTOMER",
    phoneNumber: string | null = null,
  ): Promise<UserRecord> {
    const { rows } = await pool.query<UserRecord>(
      `
      INSERT INTO users
        (shop_id, full_name, email, password_hash, role, phone_number)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id, shop_id, full_name, email, phone_number, profile_image_url,
        password_hash, role
      `,
      [shopId, fullName, email, passwordHash, role, phoneNumber],
    );

    return rows[0];
  }

  static async updateProfile(
    userId: string,
    shopId: string,
    fullName: string,
    email: string,
    phoneNumber: string | null,
    profileImageUrl: string | null,
    profileImagePositionX: number,
    profileImagePositionY: number,
  ): Promise<UserRecord> {
    const { rows } = await pool.query<UserRecord>(
      `
      UPDATE users
      SET full_name = $3, email = $4, phone_number = $5,
          profile_image_url = $6, profile_image_position_x = $7,
          profile_image_position_y = $8, updated_at = NOW()
      WHERE id = $1 AND shop_id = $2 AND is_active = TRUE
      RETURNING id, shop_id, full_name, email, phone_number, profile_image_url,
        profile_image_position_x, profile_image_position_y, password_hash, role
      `,
      [
        userId,
        shopId,
        fullName,
        email,
        phoneNumber,
        profileImageUrl,
        profileImagePositionX,
        profileImagePositionY,
      ],
    );

    if (!rows[0]) {
      throw new Error("User profile was not found.");
    }

    return rows[0];
  }

  // used when registering a new user
  static async existsByEmail(shopId: string, email: string): Promise<boolean> {
    const { rows } = await pool.query(
      `
      SELECT id FROM users
      WHERE shop_id = $1 AND email = $2
      `,
      [shopId, email],
    );

    return rows.length > 0;
  }
}

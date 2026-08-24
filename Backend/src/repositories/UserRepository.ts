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
              u.email, u.password_hash, u.role
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
  ): Promise<UserRecord> {
    const { rows } = await pool.query<UserRecord>(
      `
      INSERT INTO users
        (shop_id, full_name, email, password_hash, role)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id, shop_id, full_name, email, password_hash, role
      `,
      [shopId, fullName, email, passwordHash, role],
    );

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

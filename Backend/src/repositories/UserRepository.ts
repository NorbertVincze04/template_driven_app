import type { UserRecord } from "../types/user.types.ts";
import { pool } from "../db.ts";

export class UserRepository {
  static async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await pool.query<UserRecord>(
      `
      SELECT id, full_name, email, password_hash, type
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    return rows[0] || null;
  }

  static async create(
    fullName: string,
    email: string,
    passwordHash: string,
    type: "admin" | "user" = "user",
  ): Promise<UserRecord> {
    const { rows } = await pool.query<UserRecord>(
      `
      INSERT INTO users
        (full_name, email, password_hash, type)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, full_name, email, password_hash, type
      `,
      [fullName, email, passwordHash, type],
    );

    return rows[0];
  }

  // used when registering a new user
  static async existsByEmail(email: string): Promise<boolean> {
    const { rows } = await pool.query(
      `
      SELECT id FROM users
      WHERE email = $1
      `,
      [email],
    );

    return rows.length > 0;
  }
}

import { pool } from "../db.ts";
import type { ShopRecord } from "../types/tenant.types.ts";

export class ShopRepository {
  static async findActiveBySlug(slug: string): Promise<ShopRecord | null> {
    const { rows } = await pool.query<ShopRecord>(
      `
      SELECT id, slug, name, is_active
      FROM shops
      WHERE slug = $1 AND is_active = TRUE
      `,
      [slug],
    );

    return rows[0] ?? null;
  }
}

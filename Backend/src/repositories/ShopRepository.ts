import { pool } from "../db.ts";
import type { ShopRecord } from "../types/tenant.types.ts";

export class ShopRepository {
  static async findActiveBySlug(slug: string): Promise<ShopRecord | null> {
    const { rows } = await pool.query<ShopRecord>(
      `
      SELECT id, slug, name, is_active, config
      FROM shops
      WHERE slug = $1 AND is_active = TRUE
      `,
      [slug],
    );

    return rows[0] ?? null;
  }

  static async findActiveByDomain(domain: string): Promise<ShopRecord | null> {
    const { rows } = await pool.query<ShopRecord>(
      `
      SELECT s.id, s.slug, s.name, s.is_active, s.config
      FROM shops s
      INNER JOIN shop_domains d ON d.shop_id = s.id
      WHERE d.domain = $1 AND s.is_active = TRUE
      `,
      [domain],
    );

    return rows[0] ?? null;
  }
}

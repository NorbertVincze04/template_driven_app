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

  static async updatePricing(
    shopId: string,
    pricing: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { rows } = await pool.query<{ config: Record<string, unknown> }>(
      `UPDATE shops
       SET config = jsonb_set(config, '{pricing}', $2::jsonb, true), updated_at = NOW()
       WHERE id = $1 AND is_active = TRUE
       RETURNING config`,
      [shopId, JSON.stringify(pricing)],
    );
    return rows[0]?.config ?? {};
  }

  static async updateContent(
    shopId: string,
    content: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { rows } = await pool.query<{ config: Record<string, unknown> }>(
      `UPDATE shops
       SET config = config
         || jsonb_build_object(
              'heroSection', COALESCE(config->'heroSection', '{}'::jsonb) || COALESCE($2::jsonb->'heroSection', '{}'::jsonb),
              'aboutUs', COALESCE(config->'aboutUs', '{}'::jsonb) || COALESCE($2::jsonb->'aboutUs', '{}'::jsonb),
              'contactDetails', COALESCE(config->'contactDetails', '{}'::jsonb) || COALESCE($2::jsonb->'contactDetails', '{}'::jsonb),
              'pricing', COALESCE(config->'pricing', '{}'::jsonb) || COALESCE($2::jsonb->'pricing', '{}'::jsonb)
            ),
         updated_at = NOW()
       WHERE id = $1 AND is_active = TRUE
       RETURNING config`,
      [shopId, JSON.stringify(content)],
    );
    return rows[0]?.config ?? {};
  }
}

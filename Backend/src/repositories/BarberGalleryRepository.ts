import { pool } from "../db.ts";

export interface BarberGalleryPhotoRecord {
  id: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  caption: string | null;
  displayOrder: number;
  createdAt: string;
}

export class BarberGalleryRepository {
  static async listForBarber(
    shopId: string,
    barberId: string,
  ): Promise<BarberGalleryPhotoRecord[]> {
    const { rows } = await pool.query<BarberGalleryPhotoRecord>(
      `SELECT id, image_url AS "imageUrl", caption,
          image_position_x AS "imagePositionX",
          image_position_y AS "imagePositionY",
          display_order AS "displayOrder", created_at AS "createdAt"
       FROM barber_gallery_photos
       WHERE shop_id = $1 AND barber_id = $2
       ORDER BY display_order ASC, created_at DESC`,
      [shopId, barberId],
    );
    return rows;
  }

  static async countForBarber(
    shopId: string,
    barberId: string,
  ): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM barber_gallery_photos
       WHERE shop_id = $1 AND barber_id = $2`,
      [shopId, barberId],
    );
    return Number(rows[0]?.count ?? 0);
  }

  static async create(
    shopId: string,
    barberId: string,
    imageUrl: string,
    imagePositionX: number,
    imagePositionY: number,
    caption: string | null,
  ): Promise<BarberGalleryPhotoRecord> {
    const displayOrder = await this.countForBarber(shopId, barberId);
    const { rows } = await pool.query<BarberGalleryPhotoRecord>(
      `INSERT INTO barber_gallery_photos
          (shop_id, barber_id, image_url, image_position_x, image_position_y, caption, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, image_url AS "imageUrl", caption,
          image_position_x AS "imagePositionX",
          image_position_y AS "imagePositionY",
          display_order AS "displayOrder", created_at AS "createdAt"`,
      [
        shopId,
        barberId,
        imageUrl,
        imagePositionX,
        imagePositionY,
        caption,
        displayOrder,
      ],
    );
    return rows[0];
  }

  static async deleteMine(
    shopId: string,
    barberId: string,
    photoId: string,
  ): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM barber_gallery_photos
       WHERE id = $1 AND shop_id = $2 AND barber_id = $3`,
      [photoId, shopId, barberId],
    );
    return result.rowCount === 1;
  }
}

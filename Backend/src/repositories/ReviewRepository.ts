import { pool } from "../db.ts";

export interface ClientReview {
  id: string;
  authorName: string;
  authorRole: string | null;
  rating: number;
  comment: string;
  date: string;
}

export class ReviewRepository {
  static async list(shopId: string): Promise<ClientReview[]> {
    const { rows } = await pool.query<ClientReview>(
      `SELECT id, author_name AS "authorName", author_role AS "authorRole",
          rating, comment, created_at::date::text AS date
       FROM client_reviews
       WHERE shop_id = $1
       ORDER BY created_at DESC`,
      [shopId],
    );
    return rows;
  }

  static async create(
    shopId: string,
    authorName: string,
    authorRole: string | null,
    rating: number,
    comment: string,
  ): Promise<ClientReview> {
    const { rows } = await pool.query<ClientReview>(
      `INSERT INTO client_reviews (shop_id, author_name, author_role, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, author_name AS "authorName", author_role AS "authorRole",
         rating, comment, created_at::date::text AS date`,
      [shopId, authorName, authorRole, rating, comment],
    );
    return rows[0];
  }
}

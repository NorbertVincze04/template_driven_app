import { pool } from "../db.ts";
import type {
  NotificationRecord,
  NotificationType,
} from "../types/notification.types.ts";

export class NotificationRepository {
  static async create(
    shopId: string,
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    link: string | null = null,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO notifications (shop_id, recipient_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [shopId, recipientId, type, title, message, link],
    );
  }

  // Recipients for shop-wide events (e.g. a new review) rather than a single user.
  static async findStaffRecipientIds(shopId: string): Promise<string[]> {
    const { rows } = await pool.query<{ id: string }>(
      `SELECT id FROM users
       WHERE shop_id = $1 AND role IN ('ADMIN', 'BARBER') AND is_active = TRUE`,
      [shopId],
    );
    return rows.map((row) => row.id);
  }

  static async listForUser(
    shopId: string,
    userId: string,
    limit = 30,
  ): Promise<NotificationRecord[]> {
    // Read notifications are only useful for a few days; prune them lazily.
    await pool.query(
      `DELETE FROM notifications
       WHERE shop_id = $1 AND recipient_id = $2
         AND is_read = TRUE AND read_at < NOW() - INTERVAL '3 days'`,
      [shopId, userId],
    );
    const { rows } = await pool.query<NotificationRecord>(
      `SELECT id, type, title, message, link, is_read AS "isRead",
          created_at AS "createdAt"
       FROM notifications
       WHERE shop_id = $1 AND recipient_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [shopId, userId, limit],
    );
    return rows;
  }

  static async markRead(
    shopId: string,
    userId: string,
    id: string,
  ): Promise<boolean> {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND shop_id = $2 AND recipient_id = $3`,
      [id, shopId, userId],
    );
    return result.rowCount === 1;
  }

  static async markAllRead(shopId: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE shop_id = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [shopId, userId],
    );
  }

  static async deleteForUser(
    shopId: string,
    userId: string,
    id: string,
  ): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND shop_id = $2 AND recipient_id = $3`,
      [id, shopId, userId],
    );
    return result.rowCount === 1;
  }
}

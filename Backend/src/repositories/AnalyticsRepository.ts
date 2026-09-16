import { pool } from "../db.ts";

export interface OwnerAnalytics {
  totalBookings: number;
  peakBookedHours: Array<{ hour: string; bookings: number }>;
  mostPopularService: { name: string; bookings: number } | null;
  retention: {
    returningCustomers: number;
    totalCustomers: number;
    rate: number;
  };
  topBarbers: Array<{
    id: string;
    name: string;
    completedAppointments: number;
    rating: number | null;
    ratingCount: number;
  }>;
}

export class AnalyticsRepository {
  static async getOwnerAnalytics(shopId: string): Promise<OwnerAnalytics> {
    const [total, hours, services, retention, barbers] = await Promise.all([
      pool.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM appointments
         WHERE shop_id = $1 AND status <> 'CANCELLED'`,
        [shopId],
      ),
      pool.query<{ hour: string; bookings: string }>(
        `SELECT to_char(appointment_time, 'HH24:00') AS hour, COUNT(*)::text AS bookings
         FROM appointments
         WHERE shop_id = $1 AND status <> 'CANCELLED'
         GROUP BY to_char(appointment_time, 'HH24:00')
         ORDER BY COUNT(*) DESC, hour
         LIMIT 6`,
        [shopId],
      ),
      pool.query<{ name: string; bookings: string }>(
        `SELECT s.name, COUNT(*)::text AS bookings
         FROM appointments a
         INNER JOIN services s ON s.id = a.service_id AND s.shop_id = a.shop_id
         WHERE a.shop_id = $1 AND a.status <> 'CANCELLED'
         GROUP BY s.id, s.name
         ORDER BY COUNT(*) DESC, s.name
         LIMIT 1`,
        [shopId],
      ),
      pool.query<{ returningCustomers: string; totalCustomers: string }>(
        `WITH completed AS (
          SELECT customer_id, COUNT(*) AS visits
          FROM appointments
          WHERE shop_id = $1 AND status = 'COMPLETED' AND customer_id IS NOT NULL
          GROUP BY customer_id
        )
        SELECT COUNT(*) FILTER (WHERE visits > 1)::text AS "returningCustomers",
          COUNT(*)::text AS "totalCustomers"
        FROM completed`,
        [shopId],
      ),
      pool.query<{
        id: string;
        name: string;
        completedAppointments: string;
        rating: string | null;
        ratingCount: string;
      }>(
        `SELECT u.id, u.full_name AS name,
          COUNT(a.id)::text AS "completedAppointments",
          (SELECT ROUND(AVG(r.rating)::numeric, 1)::text FROM barber_ratings r
           WHERE r.shop_id = u.shop_id AND r.barber_id = u.id) AS rating,
          (SELECT COUNT(*)::text FROM barber_ratings r
           WHERE r.shop_id = u.shop_id AND r.barber_id = u.id) AS "ratingCount"
         FROM users u
         LEFT JOIN appointments a ON a.barber_id = u.id
           AND a.shop_id = u.shop_id AND a.status = 'COMPLETED'
         WHERE u.shop_id = $1 AND 'BARBER' = ANY(u.roles) AND u.is_active = TRUE
         GROUP BY u.id, u.full_name, u.shop_id
         ORDER BY COUNT(a.id) DESC, u.full_name
         LIMIT 5`,
        [shopId],
      ),
    ]);

    const totalCustomers = Number(retention.rows[0]?.totalCustomers ?? 0);
    const returningCustomers = Number(
      retention.rows[0]?.returningCustomers ?? 0,
    );

    return {
      totalBookings: Number(total.rows[0]?.total ?? 0),
      peakBookedHours: hours.rows.map((row) => ({
        hour: row.hour,
        bookings: Number(row.bookings),
      })),
      mostPopularService: services.rows[0]
        ? {
            name: services.rows[0].name,
            bookings: Number(services.rows[0].bookings),
          }
        : null,
      retention: {
        returningCustomers,
        totalCustomers,
        rate: totalCustomers
          ? Math.round((returningCustomers / totalCustomers) * 100)
          : 0,
      },
      topBarbers: barbers.rows.map((row) => ({
        id: row.id,
        name: row.name,
        completedAppointments: Number(row.completedAppointments),
        rating: row.rating === null ? null : Number(row.rating),
        ratingCount: Number(row.ratingCount),
      })),
    };
  }
}

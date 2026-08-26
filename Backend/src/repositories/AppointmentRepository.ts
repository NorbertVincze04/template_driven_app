import { pool } from "../db.ts";

export interface AppointmentRecord {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_name: string;
  customer_name: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
}

export class AppointmentRepository {
  static async findForCustomer(
    customerId: string,
    shopId: string,
  ): Promise<AppointmentRecord[]> {
    const { rows } = await pool.query<AppointmentRecord>(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
        s.name AS service_name, u.full_name AS customer_name,
        a.guest_name, a.guest_email, a.guest_phone
      FROM appointments a
      INNER JOIN services s ON s.id = a.service_id AND s.shop_id = a.shop_id
      LEFT JOIN users u ON u.id = a.customer_id
      WHERE a.customer_id = $1 AND a.shop_id = $2
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `,
      [customerId, shopId],
    );
    return rows;
  }

  static async findForBarber(
    barberId: string,
    shopId: string,
  ): Promise<AppointmentRecord[]> {
    const { rows } = await pool.query<AppointmentRecord>(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
        s.name AS service_name, u.full_name AS customer_name,
        a.guest_name, a.guest_email, a.guest_phone
      FROM appointments a
      INNER JOIN services s ON s.id = a.service_id AND s.shop_id = a.shop_id
      LEFT JOIN users u ON u.id = a.customer_id
      WHERE a.barber_id = $1 AND a.shop_id = $2
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `,
      [barberId, shopId],
    );
    return rows;
  }

  static async updateForBarber(
    id: string,
    barberId: string,
    shopId: string,
    status: string,
  ): Promise<AppointmentRecord | null> {
    const { rows } = await pool.query<AppointmentRecord>(
      `
      UPDATE appointments a
      SET status = $4, updated_at = NOW()
      WHERE a.id = $1 AND a.barber_id = $2 AND a.shop_id = $3
      RETURNING a.id, a.appointment_date, a.appointment_time, a.status,
        (SELECT s.name FROM services s WHERE s.id = a.service_id) AS service_name,
        (SELECT u.full_name FROM users u WHERE u.id = a.customer_id) AS customer_name,
        a.guest_name, a.guest_email, a.guest_phone
      `,
      [id, barberId, shopId, status],
    );
    return rows[0] ?? null;
  }

  static async deleteForBarber(
    id: string,
    barberId: string,
    shopId: string,
  ): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 AND barber_id = $2 AND shop_id = $3`,
      [id, barberId, shopId],
    );
    return result.rowCount === 1;
  }
}

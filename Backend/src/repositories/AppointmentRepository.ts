import { pool } from "../db.ts";

export interface AppointmentRecord {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_name: string;
}

export class AppointmentRepository {
  static async findForCustomer(
    customerId: string,
    shopId: string,
  ): Promise<AppointmentRecord[]> {
    const { rows } = await pool.query<AppointmentRecord>(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
        s.name AS service_name
      FROM appointments a
      INNER JOIN services s ON s.id = a.service_id AND s.shop_id = a.shop_id
      WHERE a.customer_id = $1 AND a.shop_id = $2
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `,
      [customerId, shopId],
    );
    return rows;
  }
}

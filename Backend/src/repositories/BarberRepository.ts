import { pool } from "../db.ts";

const BOOKING_TIME_ZONE = "Europe/Bucharest";

function normalizeTime(time: string): string {
  return time.split(":").slice(0, 2).join(":");
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function bucharestTimeToUtc(date: string, time: string): Date {
  const wallClock = new Date(`${date}T${normalizeTime(time)}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(wallClock);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );
  const offset =
    Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    ) - wallClock.getTime();
  return new Date(wallClock.getTime() - offset);
}

function formatBucharestTime(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value);
}

export interface BarberProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  profileImagePositionX: number;
  profileImagePositionY: number;
}

export interface ServiceRecord {
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
}

export class BarberRepository {
  static async createService(
    shopId: string,
    barberId: string,
    name: string,
    durationMinutes: number,
    price: number,
  ) {
    const barber = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND shop_id = $2 AND role = 'BARBER' AND is_active = TRUE`,
      [barberId, shopId],
    );
    if (!barber.rowCount) throw new Error("Barber not found.");
    const { rows } = await pool.query(
      `INSERT INTO services (shop_id, barber_id, name, duration_minutes, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, duration_minutes AS "durationMinutes", price::text`,
      [shopId, barberId, name.trim(), durationMinutes, price],
    );
    return rows[0];
  }

  static async saveWorkingHours(
    shopId: string,
    barberId: string,
    hours: Array<{
      weekday: number;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }>,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const hour of hours) {
        await client.query(
          `INSERT INTO barber_working_hours (shop_id, barber_id, weekday, start_time, end_time, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (barber_id, weekday) DO UPDATE SET start_time = $4, end_time = $5, is_active = $6`,
          [
            shopId,
            barberId,
            hour.weekday,
            hour.startTime,
            hour.endTime,
            hour.isActive ?? true,
          ],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getWorkingHours(shopId: string, barberId: string) {
    const { rows } = await pool.query(
      `SELECT weekday, start_time::text AS "startTime", end_time::text AS "endTime", is_active AS "isActive"
       FROM barber_working_hours WHERE shop_id = $1 AND barber_id = $2 ORDER BY weekday`,
      [shopId, barberId],
    );
    return rows;
  }

  static async addBlockedPeriod(
    shopId: string,
    barberId: string,
    startsAt: string,
    endsAt: string,
    reason?: string,
  ) {
    const { rows } = await pool.query(
      `INSERT INTO barber_blocked_periods (shop_id, barber_id, starts_at, ends_at, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, starts_at AS "startsAt", ends_at AS "endsAt", reason`,
      [shopId, barberId, startsAt, endsAt, reason ?? null],
    );
    return rows[0];
  }

  static async listBlockedPeriods(shopId: string, barberId: string) {
    const { rows } = await pool.query(
      `SELECT id, starts_at AS "startsAt", ends_at AS "endsAt", reason
       FROM barber_blocked_periods WHERE shop_id = $1 AND barber_id = $2 ORDER BY starts_at`,
      [shopId, barberId],
    );
    return rows;
  }

  static async deleteBlockedPeriod(
    shopId: string,
    barberId: string,
    id: string,
  ) {
    await pool.query(
      `DELETE FROM barber_blocked_periods WHERE id = $1 AND shop_id = $2 AND barber_id = $3`,
      [id, shopId, barberId],
    );
  }

  static async list(shopId: string): Promise<BarberProfile[]> {
    const { rows } = await pool.query(
      `SELECT id, full_name AS name, email, phone_number AS "phoneNumber",
        profile_image_url AS "profileImageUrl", profile_image_position_x AS "profileImagePositionX", profile_image_position_y AS "profileImagePositionY"
       FROM users WHERE shop_id = $1 AND role = 'BARBER' AND is_active = TRUE
       ORDER BY full_name`,
      [shopId],
    );
    return rows;
  }

  static async find(
    shopId: string,
    barberId: string,
  ): Promise<BarberProfile | null> {
    const { rows } = await pool.query(
      `SELECT id, full_name AS name, email, phone_number AS "phoneNumber",
        profile_image_url AS "profileImageUrl", profile_image_position_x AS "profileImagePositionX", profile_image_position_y AS "profileImagePositionY"
       FROM users WHERE id = $1 AND shop_id = $2 AND role = 'BARBER' AND is_active = TRUE`,
      [barberId, shopId],
    );
    return rows[0] ?? null;
  }

  static async listServices(
    shopId: string,
    barberId?: string,
  ): Promise<ServiceRecord[]> {
    const { rows } = await pool.query(
      `SELECT id, name, duration_minutes AS "durationMinutes", price::text
      FROM services
      WHERE shop_id = $1 AND ($2::uuid IS NULL OR barber_id = $2 OR barber_id IS NULL)
      ORDER BY name`,
      [shopId, barberId ?? null],
    );
    return rows;
  }

  static async availability(
    shopId: string,
    barberId: string,
    serviceId: string,
    date: string,
  ) {
    const barber = await this.find(shopId, barberId);
    if (!barber) return null;

    const serviceResult = await pool.query<ServiceRecord>(
      `SELECT id, name, duration_minutes AS "durationMinutes", price::text
      FROM services
      WHERE id = $1 AND shop_id = $2 AND (barber_id = $3 OR barber_id IS NULL)`,
      [serviceId, shopId, barberId],
    );
    const service = serviceResult.rows[0];
    if (!service) return null;

    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const hoursResult = await pool.query(
      `SELECT start_time::text, end_time::text FROM barber_working_hours
       WHERE shop_id = $1 AND barber_id = $2 AND weekday = $3 AND is_active = TRUE`,
      [shopId, barberId, weekday],
    );
    if (!hoursResult.rows[0]) return { barber, service, slots: [] };

    const blocksResult = await pool.query(
      `SELECT starts_at, ends_at FROM barber_blocked_periods
       WHERE shop_id = $1 AND barber_id = $2
         AND starts_at < (($3::date + INTERVAL '1 day') AT TIME ZONE '${BOOKING_TIME_ZONE}')
         AND ends_at > ($3::date AT TIME ZONE '${BOOKING_TIME_ZONE}')`,
      [shopId, barberId, date],
    );
    const appointmentsResult = await pool.query(
      `SELECT starts_at, ends_at FROM appointments
       WHERE shop_id = $1 AND barber_id = $2 AND status <> 'CANCELLED'
         AND starts_at < (($3::date + INTERVAL '1 day') AT TIME ZONE '${BOOKING_TIME_ZONE}')
         AND ends_at > ($3::date AT TIME ZONE '${BOOKING_TIME_ZONE}')`,
      [shopId, barberId, date],
    );

    const hours = hoursResult.rows[0];
    const dayStart = bucharestTimeToUtc(date, hours.start_time).getTime();
    const dayEnd = bucharestTimeToUtc(date, hours.end_time).getTime();
    const now = Date.now();
    const occupied = [...blocksResult.rows, ...appointmentsResult.rows];
    const slots: string[] = [];
    for (
      let start = dayStart;
      start + service.durationMinutes * 60000 <= dayEnd;
      start += 30 * 60000
    ) {
      const end = start + service.durationMinutes * 60000;
      if (
        start > now &&
        !occupied.some(
          (item) =>
            start < new Date(item.ends_at).getTime() &&
            end > new Date(item.starts_at).getTime(),
        )
      ) {
        slots.push(formatBucharestTime(new Date(start)));
      }
    }
    return { barber, service, slots };
  }

  static async createAppointment(input: {
    shopId: string;
    barberId: string;
    serviceId: string;
    date: string;
    time: string;
    customerId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const serviceResult = await client.query<ServiceRecord>(
        `SELECT id, name, duration_minutes AS "durationMinutes", price::text
         FROM services
         WHERE id = $1 AND shop_id = $2 AND (barber_id = $3 OR barber_id IS NULL)`,
        [input.serviceId, input.shopId, input.barberId],
      );
      const service = serviceResult.rows[0];
      if (!service) throw new Error("Service not found.");
      const barberResult = await client.query(
        `SELECT id FROM users WHERE id = $1 AND shop_id = $2 AND role = 'BARBER' AND is_active = TRUE`,
        [input.barberId, input.shopId],
      );
      if (!barberResult.rowCount) throw new Error("Barber not found.");

      const startsAt = bucharestTimeToUtc(input.date, input.time).toISOString();
      const endsAt = new Date(
        new Date(startsAt).getTime() + service.durationMinutes * 60000,
      ).toISOString();
      const weekday = new Date(`${input.date}T12:00:00Z`).getUTCDay();
      const hoursResult = await client.query(
        `SELECT start_time::text, end_time::text FROM barber_working_hours
         WHERE shop_id = $1 AND barber_id = $2 AND weekday = $3 AND is_active = TRUE`,
        [input.shopId, input.barberId, weekday],
      );
      const hours = hoursResult.rows[0];
      if (
        !hours ||
        timeToMinutes(input.time) < timeToMinutes(hours.start_time) ||
        timeToMinutes(formatBucharestTime(new Date(endsAt))) >
          timeToMinutes(hours.end_time)
      ) {
        throw new Error("This time is outside the barber's working hours.");
      }
      const blockedResult = await client.query(
        `SELECT 1 FROM barber_blocked_periods
         WHERE shop_id = $1 AND barber_id = $2 AND starts_at < $4 AND ends_at > $3 LIMIT 1`,
        [input.shopId, input.barberId, startsAt, endsAt],
      );
      if (blockedResult.rowCount)
        throw new Error("This time is blocked by the barber.");
      const result = await client.query(
        `INSERT INTO appointments
          (shop_id, customer_id, service_id, barber_id, appointment_date, appointment_time,
           starts_at, ends_at, guest_name, guest_email, guest_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, appointment_date AS date, appointment_time AS time, status`,
        [
          input.shopId,
          input.customerId ?? null,
          input.serviceId,
          input.barberId,
          input.date,
          input.time,
          startsAt,
          endsAt,
          input.guestName ?? null,
          input.guestEmail ?? null,
          input.guestPhone ?? null,
        ],
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23P01") {
        throw new Error("This time is no longer available.");
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

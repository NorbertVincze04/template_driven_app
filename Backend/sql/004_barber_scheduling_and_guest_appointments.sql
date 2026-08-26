ALTER TABLE services
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0
    CHECK (price >= 0);

ALTER TABLE appointments
  ALTER COLUMN customer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS barber_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS guest_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS barber_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (barber_id, weekday),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS barber_blocked_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255),
  CHECK (starts_at < ends_at)
);

CREATE INDEX IF NOT EXISTS barber_hours_shop_idx
  ON barber_working_hours(shop_id, barber_id, weekday);
CREATE INDEX IF NOT EXISTS barber_blocks_shop_idx
  ON barber_blocked_periods(shop_id, barber_id, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS appointments_barber_idx
  ON appointments(shop_id, barber_id, appointment_date, appointment_time);

CREATE EXTENSION IF NOT EXISTS btree_gist;

UPDATE appointments a
SET starts_at = (a.appointment_date + a.appointment_time) AT TIME ZONE 'Europe/Bucharest',
    ends_at = (a.appointment_date + a.appointment_time + make_interval(mins => s.duration_minutes)) AT TIME ZONE 'Europe/Bucharest'
FROM services s
WHERE s.id = a.service_id AND a.starts_at IS NULL;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_booking_identity_check
  CHECK (customer_id IS NOT NULL OR guest_name IS NOT NULL);

ALTER TABLE appointments
  ADD CONSTRAINT appointments_barber_time_check
  CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at);

ALTER TABLE appointments
  ADD CONSTRAINT appointments_no_barber_overlap
  EXCLUDE USING gist (
    shop_id WITH =,
    barber_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'CANCELLED' AND barber_id IS NOT NULL AND starts_at IS NOT NULL AND ends_at IS NOT NULL);
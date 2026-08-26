ALTER TABLE services
  ADD COLUMN IF NOT EXISTS barber_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS services_barber_idx ON services(shop_id, barber_id);
-- Services created before barber-specific services were introduced have a
-- NULL barber_id and remain available to every barber in their shop.
CREATE INDEX IF NOT EXISTS services_shared_idx
  ON services(shop_id)
  WHERE barber_id IS NULL;
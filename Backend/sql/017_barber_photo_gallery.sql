-- Stores barber-owned gallery photos. Images currently follow the existing
-- profile-image approach: resized client-side data URLs stored in PostgreSQL.
CREATE TABLE IF NOT EXISTS barber_gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_position_x INTEGER NOT NULL DEFAULT 50,
  image_position_y INTEGER NOT NULL DEFAULT 50,
  caption VARCHAR(160),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS barber_gallery_photos_barber_idx
  ON barber_gallery_photos(shop_id, barber_id, display_order, created_at DESC);
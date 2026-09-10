-- Lets customers rate a barber after a completed appointment. A customer has
-- at most one active rating per barber: creating a new one while the
-- previous is still within its 3-month cooldown is rejected by the app
-- layer, while deleting the existing rating clears the way immediately.
CREATE TABLE IF NOT EXISTS barber_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR(2000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (barber_id, customer_id)
);

CREATE INDEX IF NOT EXISTS barber_ratings_barber_idx
  ON barber_ratings(shop_id, barber_id);

-- Lets notifications reference a related entity (e.g. the barber a
-- "leave a rating" reminder is about) so weekly reminders can be deduped.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id UUID;

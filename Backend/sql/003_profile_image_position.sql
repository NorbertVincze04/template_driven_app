ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_image_position_x INTEGER NOT NULL DEFAULT 50
    CHECK (profile_image_position_x BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS profile_image_position_y INTEGER NOT NULL DEFAULT 50
    CHECK (profile_image_position_y BETWEEN 0 AND 100);

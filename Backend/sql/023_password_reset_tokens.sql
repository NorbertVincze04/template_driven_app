-- Splits password reset into a verify step (code) followed by a reset step
-- (one-time token), so the code itself is never resent with the new password.
ALTER TABLE password_reset_codes
  ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reset_token_used_at TIMESTAMPTZ;

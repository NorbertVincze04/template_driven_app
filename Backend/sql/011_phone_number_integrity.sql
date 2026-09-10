ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_phone_number_format_check;

ALTER TABLE users
  ADD CONSTRAINT users_phone_number_format_check
  CHECK (
    phone_number IS NULL
    OR phone_number ~ '^0[237][0-9]{8}$'
  );

ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;
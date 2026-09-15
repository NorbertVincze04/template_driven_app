ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('OWNER', 'ADMIN', 'BARBER', 'CUSTOMER'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS roles TEXT[] NOT NULL DEFAULT ARRAY['CUSTOMER'];

UPDATE users
SET roles = ARRAY[role]
WHERE roles = ARRAY['CUSTOMER'] AND role <> 'CUSTOMER';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_roles_check;

ALTER TABLE users ADD CONSTRAINT users_roles_check
  CHECK (
    array_length(roles, 1) >= 1
    AND roles <@ ARRAY['OWNER', 'ADMIN', 'BARBER', 'CUSTOMER']::TEXT[]
  );
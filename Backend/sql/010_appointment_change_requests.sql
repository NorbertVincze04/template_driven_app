-- Lets customers request a cancellation or reschedule instead of changing
-- their appointment directly; barbers approve/reject the request.
CREATE TABLE IF NOT EXISTS appointment_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('CANCEL', 'RESCHEDULE')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requested_date DATE,
  requested_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CHECK (type <> 'RESCHEDULE' OR (requested_date IS NOT NULL AND requested_time IS NOT NULL))
);

-- Only one open request per appointment at a time.
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_request_per_appointment
  ON appointment_change_requests(appointment_id) WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS appointment_change_requests_shop_idx
  ON appointment_change_requests(shop_id, appointment_id);

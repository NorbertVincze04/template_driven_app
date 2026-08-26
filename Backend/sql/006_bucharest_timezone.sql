-- Store appointment instants using the Romanian local booking time.
UPDATE appointments a
SET starts_at = (a.appointment_date + a.appointment_time) AT TIME ZONE 'Europe/Bucharest',
    ends_at = (a.appointment_date + a.appointment_time + make_interval(mins => s.duration_minutes)) AT TIME ZONE 'Europe/Bucharest'
FROM services s
WHERE s.id = a.service_id
  AND a.appointment_date IS NOT NULL
  AND a.appointment_time IS NOT NULL;

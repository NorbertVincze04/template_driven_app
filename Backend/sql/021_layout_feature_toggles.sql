-- Add new per-tenant feature toggles (quick-rebook modal, header notifications
-- bell, and booking-page guest booking/ratings/gallery) to any shop that
-- already has a layout config, defaulting all of them to enabled so existing
-- behavior is unchanged. Keeps shops.config in sync with
-- Frontend/public/tenants/default.json.
UPDATE shops
SET config = jsonb_set(
  jsonb_set(
    jsonb_set(
      config,
      '{layout,showQuickRebook}',
      'true'::jsonb
    ),
    '{layout,header,showNotifications}',
    'true'::jsonb
  ),
  '{layout,booking}',
  '{"allowGuestBooking": true, "showBarberRatings": true, "showBarberGallery": true}'::jsonb
),
    updated_at = NOW()
WHERE config->'layout' IS NOT NULL;

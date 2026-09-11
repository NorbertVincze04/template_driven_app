-- Update the default tenant's contact address/map to Cluj-Napoca, Romania.
UPDATE shops
SET config = jsonb_set(
  jsonb_set(
    config,
    '{contactDetails,address}',
    '{"line1": "12 Strada Memorandumului", "line2": "", "city": "Cluj-Napoca", "state": "Cluj", "postalCode": "400114", "country": "Romania"}'::jsonb
  ),
  '{contactDetails,mapEmbedUrl}',
  '"https://www.google.com/maps?q=Cluj-Napoca,+Romania&output=embed"'
)
WHERE config->>'tenantId' = 'default';

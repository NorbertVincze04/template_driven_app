CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(63) NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name VARCHAR(200) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  domain VARCHAR(253) NOT NULL UNIQUE
    CHECK (
      domain = lower(domain)
      AND position('/' IN domain) = 0
      AND position(':' IN domain) = 0
      AND domain !~ '[[:space:]]'
    ),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_primary_domain_per_shop
  ON shop_domains(shop_id) WHERE is_primary;

ALTER TABLE shop_domains DROP CONSTRAINT IF EXISTS shop_domains_domain_check;
ALTER TABLE shop_domains ADD CONSTRAINT shop_domains_domain_check
  CHECK (
    domain = lower(domain)
    AND position('/' IN domain) = 0
    AND position(':' IN domain) = 0
    AND domain !~ '[[:space:]]'
  );

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
    CHECK (role IN ('ADMIN', 'BARBER', 'CUSTOMER')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, email)
);

CREATE INDEX IF NOT EXISTS users_shop_id_idx ON users(shop_id);

INSERT INTO shops (slug, name, config)
VALUES (
  'default',
  'Salon Luxe',
  $$
  {
    "tenantId": "default",
    "name": "Salon Luxe",
    "logoUrl": "",
    "primaryColor": "#D6A92F",
    "secondaryColor": "#D4A574",
    "style": {"mode": "dark"},
    "fontFamily": "Montserrat",
    "fontFamilySecondary": "Playfair Display",
    "heroSection": {
      "badgeText": "Award-winning stylists & premium beauty services",
      "title": "Elevate Your Look with Expert Hair Care",
      "subtitle": "Discover our team of talented stylists dedicated to creating the perfect look for you. From cuts and color to treatments and styling, we're here to make you feel beautiful.",
      "ctaText": "Book Your Appointment",
      "backgroundImageUrl": "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1074&auto=format&fit=crop",
      "backgroundImageAlt": "Professional hair salon interior with styling stations",
      "profileGallery": []
    },
    "contactDetails": {
      "sectionLabel": "Contact",
      "title": "Ready for Your New Look?",
      "description": "Visit us for a consultation with one of our expert stylists.",
      "email": "hello@salonluxe.com",
      "phone": "+1 415 555 0123",
      "address": {"line1": "285 Fashion Drive", "line2": "Suite 100", "city": "San Francisco", "state": "CA", "postalCode": "94103", "country": "USA"},
      "socialMediaLinks": [{"label": "Instagram", "url": "https://instagram.com"}, {"label": "Facebook", "url": "https://facebook.com"}],
      "mapEmbedUrl": "https://www.google.com/maps?q=San+Francisco,+CA&output=embed",
      "operatingHours": [{"days": "Mon - Fri", "hours": "09:00 - 18:00", "timezone": "PST"}, {"days": "Sat", "hours": "10:00 - 14:00", "timezone": "PST"}],
      "ctaText": "Schedule an Appointment",
      "ctaLink": "/contact"
    },
    "layout": {
      "showHeader": true, "showTopBar": false, "showFooter": true,
      "showHeroSection": true, "showContactDetails": true,
      "header": {"showAboutUs": true, "showPricing": true, "showThemeToggle": true},
      "footer": {"showInstagram": true, "showFacebook": true, "showHelpCenter": true, "showTerms": true},
      "hero": {"variant": "profile-gallery", "showBadge": true, "showTitle": true, "showSubtitle": true, "showCtaButton": true, "showProfileGallery": true},
      "contactDetails": {"showEmail": true, "showPhone": true, "showAddress": true, "showSocialMediaLinks": true, "showMap": true, "showOperatingHours": true, "showCTAButton": true}
    }
  }
  $$::jsonb
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, config = EXCLUDED.config, updated_at = NOW();

INSERT INTO shop_domains (shop_id, domain, is_primary)
SELECT id, 'localhost', TRUE FROM shops WHERE slug = 'default'
ON CONFLICT (domain) DO NOTHING;

-- Add each production hostname to its tenant, for example:
-- INSERT INTO shop_domains (shop_id, domain, is_primary)
-- SELECT id, 'acme.example.com', TRUE FROM shops WHERE slug = 'acme';

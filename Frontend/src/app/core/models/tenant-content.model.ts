export interface TenantSocialLink {
  label: string;
  url: string;
}

export interface TenantAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface TenantOperatingHours {
  timezone?: string;
  days?: string;
  hours?: string;
}

export interface TenantContactDetailsContent {
  sectionLabel?: string;
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: TenantAddress;
  socialMediaLinks?: TenantSocialLink[];
  mapEmbedUrl?: string;
  operatingHours?: TenantOperatingHours[];
  ctaText?: string;
  ctaLink?: string;
}

export interface TenantProfileGalleryItem {
  id?: string;
  name: string;
  role: string;
  imageUrl: string;
  tags?: string[];
}

export interface TenantHeroSection {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  profileGallery?: TenantProfileGalleryItem[];
  backgroundImageUrl?: string;
  backgroundImageAlt?: string;
}

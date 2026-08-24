export interface TenantHeaderLayout {
  showAboutUs?: boolean;
  showPricing?: boolean;
}

export interface TenantFooterLayout {
  showInstagram?: boolean;
  showFacebook?: boolean;
  showHelpCenter?: boolean;
}

export interface TenantLayout {
  showHeader?: boolean;
  showTopBar?: boolean;
  showFooter?: boolean;
  showHeroSection?: boolean;
  showContactDetails?: boolean;
  header?: TenantHeaderLayout;
  footer?: TenantFooterLayout;
  hero?: TenantHeroLayout;
  contactDetails?: TenantContactDetailsLayout;
}

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

export interface TenantConfig {
  tenantId: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  fontFamilySecondary?: string;
  layout?: TenantLayout;
  heroSection?: TenantHeroSection;
  contactDetails?: TenantContactDetailsContent;
}

export interface TenantHeroLayout {
  variant?: 'profile-gallery' | 'hero-background';
  showBadge?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showCtaButton?: boolean;
  showProfileGallery?: boolean;
}

export interface TenantContactDetailsLayout {
  showEmail?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showSocialMediaLinks?: boolean;
  showMap?: boolean;
  showOperatingHours?: boolean;
  showCTAButton?: boolean;
}

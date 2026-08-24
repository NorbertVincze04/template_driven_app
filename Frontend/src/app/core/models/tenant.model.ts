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
  header?: TenantHeaderLayout;
  footer?: TenantFooterLayout;
  hero?: TenantHeroLayout;
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
}

export interface TenantHeroLayout {
  variant?: 'profile-gallery' | 'hero-background';
  showBadge?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showCtaButton?: boolean;
  showProfileGallery?: boolean;
}

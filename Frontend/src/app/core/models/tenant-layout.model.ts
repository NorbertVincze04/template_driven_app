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

export interface TenantHeaderLayout {
  showAboutUs?: boolean;
  showPricing?: boolean;
  showThemeToggle?: boolean;
}

export interface TenantFooterLayout {
  showInstagram?: boolean;
  showFacebook?: boolean;
  showHelpCenter?: boolean;
  showTerms?: boolean;
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

export interface TenantLayout {
  showHeader?: boolean;
  showTopBar?: boolean;
  showFooter?: boolean;
  showHeroSection?: boolean;
  showPricingSection?: boolean;
  showAboutUsSection?: boolean;
  showReviewsSection?: boolean;
  showContactDetails?: boolean;
  showQuickRebook?: boolean;
  header?: TenantHeaderLayout;
  footer?: TenantFooterLayout;
  hero?: TenantHeroLayout;
  contactDetails?: TenantContactDetailsLayout;
  booking?: TenantBookingLayout;
}

export interface TenantHeaderLayout {
  showAboutUs?: boolean;
  showPricing?: boolean;
  showReviews?: boolean;
  showThemeToggle?: boolean;
  showContact?: boolean;
  showNotifications?: boolean;
}

export interface TenantBookingLayout {
  allowGuestBooking?: boolean;
  showBarberRatings?: boolean;
  showBarberGallery?: boolean;
}

export interface TenantFooterLayout {
  showInstagram?: boolean;
  showFacebook?: boolean;
  showHelpCenter?: boolean;
  showTerms?: boolean;
  showReportBug?: boolean;
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

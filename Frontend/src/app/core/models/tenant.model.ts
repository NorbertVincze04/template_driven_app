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
  showFooter?: boolean;
  header?: TenantHeaderLayout;
  footer?: TenantFooterLayout;
}

export interface TenantConfig {
  tenantId: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  layout?: TenantLayout;
}

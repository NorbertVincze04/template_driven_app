import type {
  TenantContactDetailsContent,
  TenantHeroSection,
} from './tenant-content.model';
import type { TenantLayout } from './tenant-layout.model';
import type { TenantStyle } from './tenant-style.model';

export * from './tenant-content.model';
export * from './tenant-layout.model';
export * from './tenant-style.model';

export interface TenantConfig {
  tenantId: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  style?: TenantStyle;
  fontFamily?: string;
  fontFamilySecondary?: string;
  layout?: TenantLayout;
  heroSection?: TenantHeroSection;
  contactDetails?: TenantContactDetailsContent;
}

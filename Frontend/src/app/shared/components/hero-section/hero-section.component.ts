import { Component, computed, inject } from '@angular/core';
import {
  TenantConfig,
  TenantHeroGalleryItem,
  TenantHeroSection,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  private readonly tenantService = inject(TenantService);

  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
  );

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#131838',
      '--tenant-secondary': config?.secondaryColor || '#2e3c90',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', serif`
        : 'inherit',
    };
  });

  protected readonly heroContent = computed((): TenantHeroSection => {
    const hero = this.tenantService.config()?.heroSection;
    return {
      badgeText: hero?.badgeText || 'Over 3 million ready-to-work creatives!',
      title: hero?.title || "The world's destination for design",
      subtitle:
        hero?.subtitle ||
        'Get inspired by top-rated creators and agencies from around the world.',
      ctaText: hero?.ctaText || 'Get started',
      gallery: hero?.gallery || [],
    };
  });

  protected readonly hasGallery = computed(
    (): boolean => (this.heroContent().gallery?.length || 0) > 0,
  );

  protected trackByName(_: number, item: TenantHeroGalleryItem): string {
    return item.name;
  }

  protected onProfileClick(profile: TenantHeroGalleryItem): void {
    // Hook for future profile routing once a dedicated profile page is added.
    console.info('Open profile:', profile.name);
  }
}

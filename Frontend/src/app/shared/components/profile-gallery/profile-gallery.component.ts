import { Component, computed, inject } from '@angular/core';
import {
  TenantConfig,
  TenantHeroSection,
  TenantProfileGalleryItem,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-profile-gallery',
  standalone: true,
  imports: [],
  templateUrl: './profile-gallery.component.html',
  styleUrl: './profile-gallery.component.css',
})
export class ProfileGalleryComponent {
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
      profileGallery: hero?.profileGallery || [],
    };
  });

  protected readonly hasGallery = computed(
    (): boolean => (this.heroContent().profileGallery?.length || 0) > 0,
  );

  protected trackByName(_: number, item: TenantProfileGalleryItem): string {
    return item.name;
  }

  protected onProfileClick(profile: TenantProfileGalleryItem): void {
    // Hook for future profile routing once a dedicated profile page is added.
    console.info('Open profile:', profile.name);
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  TenantHeroLayout,
  TenantHeroSection,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ProfileGalleryComponent } from '../profile-gallery/profile-gallery.component';
import { HeroBackgroundComponent } from '../hero-background/hero-background.component';
import { BarberService } from '../../../core/services/barber.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [ProfileGalleryComponent, HeroBackgroundComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  private readonly tenantService = inject(TenantService);
  private readonly barberService = inject(BarberService);
  private readonly barbers = signal<any[]>([]);

  constructor() {
    effect(() => {
      if (!this.tenantService.config()) return;
      this.barberService
        .listBarbers()
        .subscribe({ next: (barbers) => this.barbers.set(barbers) });
    });
  }

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

  protected readonly heroLayout = computed((): TenantHeroLayout => {
    const layout = this.tenantService.config()?.layout?.hero;
    return {
      variant: layout?.variant || 'profile-gallery',
      showBadge: layout?.showBadge ?? true,
      showTitle: layout?.showTitle ?? true,
      showSubtitle: layout?.showSubtitle ?? true,
      showCtaButton: layout?.showCtaButton ?? true,
      showProfileGallery: layout?.showProfileGallery ?? true,
    };
  });

  protected readonly heroContent = computed((): TenantHeroSection => {
    const hero = this.tenantService.config()?.heroSection;
    return {
      badgeText: hero?.badgeText || 'text',
      title: hero?.title || 'text',
      subtitle: hero?.subtitle || 'text',
      ctaText: hero?.ctaText || 'text',
      profileGallery: this.barbers().length
        ? this.barbers().map((barber) => ({
            id: barber.id,
            name: barber.name,
            role: 'Barber',
            imageUrl: barber.profileImageUrl || '',
            tags: [],
          }))
        : hero?.profileGallery || [],
      backgroundImageUrl: hero?.backgroundImageUrl || '',
      backgroundImageAlt: hero?.backgroundImageAlt || 'Hero background image',
    };
  });

  protected readonly heroVariant = computed(
    (): string => this.heroLayout().variant || 'profile-gallery',
  );
}

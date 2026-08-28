import { Component, computed, inject } from '@angular/core';
import { TenantAboutUsContent } from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
  private readonly tenantService = inject(TenantService);

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#1f5e4a',
      '--tenant-secondary': config?.secondaryColor || '#b25a48',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', serif`
        : 'inherit',
    };
  });

  protected readonly about = computed((): TenantAboutUsContent => {
    const config = this.tenantService.config();
    const content = config?.aboutUs;

    return {
      sectionLabel: content?.sectionLabel || 'About us',
      title: content?.title || `The story behind ${config?.name || 'our work'}`,
      description:
        content?.description ||
        'We bring expertise, care, and a personal point of view to every appointment.',
      imageUrl: content?.imageUrl || '',
      imageAlt: content?.imageAlt || 'Team member at work',
      highlights: content?.highlights || [],
    };
  });
}

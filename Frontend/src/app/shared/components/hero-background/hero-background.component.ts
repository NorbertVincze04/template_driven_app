import { Component, computed, inject, Input } from '@angular/core';
import {
  TenantHeroLayout,
  TenantHeroSection,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [],
  templateUrl: './hero-background.component.html',
  styleUrl: './hero-background.component.css',
})
export class HeroBackgroundComponent {
  @Input({ required: true }) content!: TenantHeroSection;
  @Input({ required: true }) layout!: TenantHeroLayout;
  private readonly tenantService = inject(TenantService);

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
    };
  });
}

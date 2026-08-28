import { Component, computed, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  TenantHeroLayout,
  TenantHeroSection,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './hero-background.component.html',
  styleUrl: './hero-background.component.css',
})
export class HeroBackgroundComponent {
  @Input({ required: true }) content!: TenantHeroSection;
  @Input({ required: true }) layout!: TenantHeroLayout;
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

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

  onCtaClick(): void {
    const target = this.content.ctaLink || '/appointment-service';
    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      this.router.navigateByUrl(target);
    }
  }
}

import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  TenantPricingContent,
  TenantPricingPlan,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

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

  protected readonly pricing = computed((): TenantPricingContent => {
    const content = this.tenantService.config()?.pricing;
    return {
      sectionLabel: content?.sectionLabel || 'Pricing',
      title: content?.title || 'Services designed for you.',
      description:
        content?.description ||
        'Explore our services and reserve the experience that fits your needs.',
      plans: content?.plans || [],
    };
  });

  protected readonly plans = computed(
    (): TenantPricingPlan[] => this.pricing().plans || [],
  );

  protected choosePlan(plan: TenantPricingPlan): void {
    void this.router.navigate(['/barbers-preview'], {
      queryParams: { service: plan.name },
    });
  }

  protected viewAllServices(): void {
    void this.router.navigate(['/services']);
  }
}

import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantPricingPlan } from '../../core/models/tenant.model';
import { BarberService as ServiceOption } from '../../core/models/barber.model';
import { AuthService } from '../../core/services/auth.service';
import { BarberService } from '../../core/services/barber.service';
import { TenantService } from '../../core/services/tenant.service';
import { slugify } from '../../core/utils/slug.utils';
import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';

interface EditablePricingPlan extends TenantPricingPlan {
  featuresText: string;
}

@Component({
  selector: 'app-owner-admin',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './owner-admin.component.html',
  styleUrl: './owner-admin.component.css',
})
export class OwnerAdminComponent {
  private readonly authService = inject(AuthService);
  private readonly barberApi = inject(BarberService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected sectionLabel = '';
  protected title = '';
  protected description = '';
  protected plans: EditablePricingPlan[] = [];
  protected services: ServiceOption[] = [];
  protected saving = false;
  protected saved = false;
  protected error = '';
  private initialized = false;

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', serif`
        : 'inherit',
    };
  });

  constructor() {
    if (!this.authService.hasRole('OWNER')) {
      void this.router.navigate(['/home']);
      return;
    }

    this.barberApi.listServices().subscribe({
      next: (services) => (this.services = services),
      error: () => undefined,
    });

    effect(() => {
      const pricing = this.tenantService.config()?.pricing;
      if (!pricing || this.initialized) return;
      this.sectionLabel = pricing.sectionLabel || 'Services & pricing';
      this.title = pricing.title || 'Care that meets you where you are.';
      this.description = pricing.description || '';
      this.plans = (pricing.plans || []).map((plan) => ({
        ...plan,
        featuresText: (plan.features || []).join('\n'),
      }));
      this.initialized = true;
    });
  }

  protected addPlan(): void {
    this.plans.push({
      name: '',
      price: '',
      description: '',
      features: [],
      featuresText: '',
      ctaText: 'Choose a barber',
      ctaLink: '/services',
      featured: false,
    });
  }

  protected removePlan(index: number): void {
    this.plans.splice(index, 1);
  }

  protected selectService(
    plan: EditablePricingPlan,
    serviceName: string,
  ): void {
    plan.ctaLink = serviceName
      ? `/services/${slugify(serviceName)}`
      : '/services';
  }

  protected savePricing(): void {
    this.saved = false;
    this.error = '';
    const plans = this.plans.map((plan) => ({
      name: plan.name.trim(),
      price: plan.price.trim(),
      description: plan.description?.trim() || '',
      features: plan.featuresText
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      ctaText: plan.ctaText?.trim() || 'Choose a barber',
      ctaLink: plan.ctaLink?.trim() || '/services',
      featured: plan.featured === true,
    }));

    if (plans.some((plan) => !plan.name || !plan.price)) {
      this.error = 'Each home page service needs a name and price.';
      return;
    }

    this.saving = true;
    this.tenantService
      .updatePricing({
        sectionLabel: this.sectionLabel.trim() || 'Services & pricing',
        title: this.title.trim() || 'Care that meets you where you are.',
        description: this.description.trim(),
        plans,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
        },
        error: (error) => {
          this.saving = false;
          this.error =
            error.error?.message || 'Home services could not be saved.';
        },
      });
  }
}

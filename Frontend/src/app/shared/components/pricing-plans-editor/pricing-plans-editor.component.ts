import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarberService as ServiceOption } from '../../../core/models/barber.model';
import { TenantPricingPlan } from '../../../core/models/tenant.model';
import { slugify } from '../../../core/utils/slug.utils';

export interface EditablePricingPlan extends TenantPricingPlan {
  featuresText: string;
}

export interface PricingEditorModel {
  sectionLabel: string;
  title: string;
  description: string;
  plans: EditablePricingPlan[];
}

/**
 * Admin editor for the home page "services & pricing" section. Mutates the
 * `model` object it's given in place (no output events needed) so the parent
 * can read it back directly when saving.
 */
@Component({
  selector: 'app-pricing-plans-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pricing-plans-editor.component.html',
  styleUrl: './pricing-plans-editor.component.css',
})
export class PricingPlansEditorComponent {
  @Input() model!: PricingEditorModel;
  // Barber services, used to populate each plan's "link to service" dropdown.
  @Input() services: ServiceOption[] = [];

  protected addPlan(): void {
    this.model.plans.push({
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
    this.model.plans.splice(index, 1);
  }

  protected selectService(
    plan: EditablePricingPlan,
    serviceName: string,
  ): void {
    plan.ctaLink = serviceName
      ? `/services/${slugify(serviceName)}`
      : '/services';
  }
}

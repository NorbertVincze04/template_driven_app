import { Component, computed, inject } from '@angular/core';
import { TenantService } from '../../core/services/tenant.service';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';
import { ContactDetailsComponent } from '../../shared/components/contact-details/contact-details.component';
import { AboutUsComponent } from '../../shared/components/about-us/about-us.component';
import { PricingComponent } from '../../shared/components/pricing/pricing.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    PricingComponent,
    AboutUsComponent,
    ContactDetailsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly tenantService = inject(TenantService);

  protected readonly showHeroSection = computed(
    (): boolean => this.tenantService.config()?.layout?.showHeroSection ?? true,
  );

  protected readonly showPricingSection = computed(
    (): boolean =>
      this.tenantService.config()?.layout?.showPricingSection ?? true,
  );

  protected readonly showAboutUsSection = computed(
    (): boolean =>
      this.tenantService.config()?.layout?.showAboutUsSection ?? true,
  );

  protected readonly showContactDetails = computed(
    (): boolean =>
      this.tenantService.config()?.layout?.showContactDetails ?? true,
  );
}

import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BarberService as ServiceOption } from '../../core/models/barber.model';
import { AuthService } from '../../core/services/auth.service';
import { BarberService } from '../../core/services/barber.service';
import { TenantService } from '../../core/services/tenant.service';
import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';
import {
  PricingEditorModel,
  PricingPlansEditorComponent,
} from '../../shared/components/pricing-plans-editor/pricing-plans-editor.component';
import {
  HeroEditorModel,
  HeroSectionEditorComponent,
} from '../../shared/components/hero-section-editor/hero-section-editor.component';
import {
  AboutUsEditorModel,
  AboutUsEditorComponent,
} from '../../shared/components/about-us-editor/about-us-editor.component';
import {
  ContactEditorModel,
  ContactDetailsEditorComponent,
} from '../../shared/components/contact-details-editor/contact-details-editor.component';

/**
 * Orchestrates the /admin page: loads the tenant's current content into
 * editable models and saves them back. Each section's fields/markup live in
 * a focused, reusable child (app-pricing-plans-editor, app-hero-section-editor,
 * app-about-us-editor, app-contact-details-editor), which mutate the model
 * objects passed to them in place.
 */
@Component({
  selector: 'app-owner-admin',
  standalone: true,
  imports: [
    ActionButtonComponent,
    PricingPlansEditorComponent,
    HeroSectionEditorComponent,
    AboutUsEditorComponent,
    ContactDetailsEditorComponent,
  ],
  templateUrl: './owner-admin.component.html',
  styleUrl: './owner-admin.component.css',
})
export class OwnerAdminComponent {
  private readonly authService = inject(AuthService);
  private readonly barberApi = inject(BarberService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected pricing: PricingEditorModel = {
    sectionLabel: '',
    title: '',
    description: '',
    plans: [],
  };
  protected hero: HeroEditorModel = {
    badgeText: '',
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    backgroundImageUrl: '',
    backgroundImageAlt: '',
  };
  protected about: AboutUsEditorModel = {
    sectionLabel: '',
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    highlightsText: '',
  };
  protected contact: ContactEditorModel = {
    sectionLabel: '',
    title: '',
    description: '',
    email: '',
    phone: '',
    mapEmbedUrl: '',
    ctaText: '',
    ctaLink: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    socialLinks: [],
    operatingHours: [],
  };
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
    if (!this.authService.hasRole('ADMIN')) {
      void this.router.navigate(['/home']);
      return;
    }

    this.barberApi.listServices().subscribe({
      next: (services) => (this.services = services),
      error: () => undefined,
    });

    effect(() => {
      const config = this.tenantService.config();
      const pricing = config?.pricing;
      if (!config || !pricing || this.initialized) return;
      this.pricing = {
        sectionLabel: pricing.sectionLabel || 'Services & pricing',
        title: pricing.title || 'Care that meets you where you are.',
        description: pricing.description || '',
        plans: (pricing.plans || []).map((plan) => ({
          ...plan,
          featuresText: (plan.features || []).join('\n'),
        })),
      };
      const hero = config.heroSection || {};
      this.hero = {
        badgeText: hero.badgeText || '',
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        ctaText: hero.ctaText || '',
        ctaLink: hero.ctaLink || '',
        backgroundImageUrl: hero.backgroundImageUrl || '',
        backgroundImageAlt: hero.backgroundImageAlt || '',
      };
      const about = config.aboutUs || {};
      this.about = {
        sectionLabel: about.sectionLabel || '',
        title: about.title || '',
        description: about.description || '',
        imageUrl: about.imageUrl || '',
        imageAlt: about.imageAlt || '',
        highlightsText: (about.highlights || []).join('\n'),
      };
      const contact = config.contactDetails || {};
      this.contact = {
        sectionLabel: contact.sectionLabel || '',
        title: contact.title || '',
        description: contact.description || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mapEmbedUrl: contact.mapEmbedUrl || '',
        ctaText: contact.ctaText || '',
        ctaLink: contact.ctaLink || '',
        addressLine1: contact.address?.line1 || '',
        addressLine2: contact.address?.line2 || '',
        city: contact.address?.city || '',
        state: contact.address?.state || '',
        postalCode: contact.address?.postalCode || '',
        country: contact.address?.country || '',
        socialLinks: (contact.socialMediaLinks || []).map((link) => ({
          ...link,
        })),
        operatingHours: (contact.operatingHours || []).map((hour) => ({
          days: hour.days || '',
          hours: hour.hours || '',
          timezone: hour.timezone || '',
        })),
      };
      this.initialized = true;
    });
  }

  protected saveContent(): void {
    this.saved = false;
    this.error = '';
    const plans = this.pricing.plans.map((plan) => ({
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
      .updateContent({
        heroSection: this.hero,
        aboutUs: {
          sectionLabel: this.about.sectionLabel.trim(),
          title: this.about.title.trim(),
          description: this.about.description.trim(),
          imageUrl: this.about.imageUrl.trim(),
          imageAlt: this.about.imageAlt.trim(),
          highlights: this.about.highlightsText
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        },
        contactDetails: {
          sectionLabel: this.contact.sectionLabel.trim(),
          title: this.contact.title.trim(),
          description: this.contact.description.trim(),
          email: this.contact.email.trim(),
          phone: this.contact.phone.trim(),
          mapEmbedUrl: this.contact.mapEmbedUrl.trim(),
          ctaText: this.contact.ctaText.trim(),
          ctaLink: this.contact.ctaLink.trim(),
          address: {
            line1: this.contact.addressLine1.trim(),
            line2: this.contact.addressLine2.trim(),
            city: this.contact.city.trim(),
            state: this.contact.state.trim(),
            postalCode: this.contact.postalCode.trim(),
            country: this.contact.country.trim(),
          },
          socialMediaLinks: this.contact.socialLinks.filter(
            (link) => link.label.trim() && link.url.trim(),
          ),
          operatingHours: this.contact.operatingHours.filter(
            (hour) => hour.days.trim() && hour.hours.trim(),
          ),
        },
        pricing: {
          sectionLabel:
            this.pricing.sectionLabel.trim() || 'Services & pricing',
          title:
            this.pricing.title.trim() || 'Care that meets you where you are.',
          description: this.pricing.description.trim(),
          plans,
        },
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

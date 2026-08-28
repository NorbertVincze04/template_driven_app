import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  TenantContactDetailsContent,
  TenantContactDetailsLayout,
  TenantOperatingHours,
  TenantSocialLink,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.css',
})
export class ContactDetailsComponent {
  private readonly tenantService = inject(TenantService);
  private readonly sanitizer = inject(DomSanitizer);
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

  protected readonly layout = computed((): TenantContactDetailsLayout => {
    const sectionLayout = this.tenantService.config()?.layout?.contactDetails;
    return {
      showEmail: sectionLayout?.showEmail ?? true,
      showPhone: sectionLayout?.showPhone ?? true,
      showAddress: sectionLayout?.showAddress ?? true,
      showSocialMediaLinks: sectionLayout?.showSocialMediaLinks ?? true,
      showMap: sectionLayout?.showMap ?? true,
      showOperatingHours: sectionLayout?.showOperatingHours ?? true,
      showCTAButton: sectionLayout?.showCTAButton ?? true,
    };
  });

  protected readonly contact = computed((): TenantContactDetailsContent => {
    const config = this.tenantService.config();
    const details = config?.contactDetails;

    return {
      sectionLabel: details?.sectionLabel || 'Contact us',
      title: details?.title || `Speak with ${config?.name || 'our team'}`,
      description:
        details?.description ||
        'Share your project goals and we will help you plan the next step.',
      email: details?.email || 'hello@example.com',
      phone: details?.phone || '+1 (000) 000-0000',
      address: {
        line1: details?.address?.line1 || '123 Main Street',
        line2: details?.address?.line2 || '',
        city: details?.address?.city || 'San Francisco',
        state: details?.address?.state || 'CA',
        postalCode: details?.address?.postalCode || '94105',
        country: details?.address?.country || 'United States',
      },
      socialMediaLinks: details?.socialMediaLinks || [],
      mapEmbedUrl: details?.mapEmbedUrl || '',
      operatingHours: details?.operatingHours || [],
      ctaText: details?.ctaText || 'Book a call',
      ctaLink: details?.ctaLink || '#',
    };
  });

  protected readonly safeMapEmbedUrl = computed((): SafeResourceUrl | null => {
    const mapEmbedUrl = this.contact().mapEmbedUrl;
    if (!mapEmbedUrl) {
      return null;
    }

    try {
      const url = new URL(mapEmbedUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } catch {
      return null;
    }
  });

  protected readonly socialLinks = computed(
    (): TenantSocialLink[] => this.contact().socialMediaLinks || [],
  );

  protected readonly operatingHours = computed(
    (): TenantOperatingHours[] => this.contact().operatingHours || [],
  );

  protected readonly fullAddress = computed((): string => {
    const address = this.contact().address;
    if (!address) {
      return '';
    }

    const lineOne = [address.line1, address.line2].filter(Boolean).join(', ');
    const lineTwo = [
      [address.city, address.state].filter(Boolean).join(', '),
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(' ');

    return [lineOne, lineTwo].filter(Boolean).join(' | ');
  });

  protected onCtaClick(): void {
    const link = this.contact().ctaLink;
    if (link && link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link && link !== '#') {
      void this.router.navigateByUrl(link);
    } else {
      void this.router.navigate(['/appointment-service']);
    }
  }
}

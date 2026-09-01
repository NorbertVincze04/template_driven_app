import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Barber,
  BarberService as ServiceOption,
} from '../../core/models/barber.model';
import { BarberService } from '../../core/services/barber.service';
import { TenantService } from '../../core/services/tenant.service';
import { slugify } from '../../core/utils/slug.utils';

import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';

interface BarberOption {
  barber: Barber;
  service: ServiceOption;
}

@Component({
  selector: 'app-barbers-preview',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './barbers-preview.component.html',
  styleUrl: './barbers-preview.component.css',
})
export class BarbersPreviewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly barberApi = inject(BarberService);
  private readonly tenantService = inject(TenantService);
  private readonly serviceName =
    this.route.snapshot.paramMap.get('serviceSlug') ||
    this.route.snapshot.queryParamMap.get('service') ||
    '';
  protected readonly options = signal<BarberOption[]>([]);
  protected loading = true;
  protected error = '';

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

  protected readonly serviceRange = computed(() => {
    const options = this.options();
    if (!options.length) return null;
    const prices = options.map((option) => Number(option.service.price));
    const durations = options.map((option) => option.service.durationMinutes);
    return {
      name: options[0].service.name,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  });

  constructor() {
    if (!this.serviceName) {
      this.error = 'Choose a service before selecting a barber.';
      this.loading = false;
      return;
    }
    this.barberApi.listBarbers().subscribe({
      next: (barbers) => this.loadMatchingServices(barbers),
      error: () => this.setError('Barbers could not be loaded.'),
    });
  }

  protected chooseBarber(option: BarberOption): void {
    const barberSlug = slugify(option.barber.name);
    const serviceSlug = slugify(option.service.name);
    void this.router.navigate(['/book', barberSlug, serviceSlug]);
  }

  protected formatRange(
    minimum: number,
    maximum: number,
    suffix: string,
  ): string {
    return minimum === maximum
      ? `${minimum} ${suffix}`
      : `${minimum}-${maximum} ${suffix}`;
  }

  private loadMatchingServices(barbers: Barber[]): void {
    let pending = barbers.length;
    if (!pending) return this.setError('No barbers are available yet.');
    const matches: BarberOption[] = [];
    const targetSlug = slugify(this.serviceName);
    for (const barber of barbers) {
      this.barberApi.listServices(barber.id).subscribe({
        next: (services) => {
          const service = services.find(
            (item) =>
              slugify(item.name) === targetSlug ||
              item.name.trim().toLocaleLowerCase() ===
                this.serviceName.trim().toLocaleLowerCase(),
          );
          if (service) matches.push({ barber, service });
          if (--pending === 0) {
            this.options.set(matches);
            this.loading = false;
          }
        },
        error: () => {
          if (--pending === 0) {
            this.options.set(matches);
            this.loading = false;
          }
        },
      });
    }
  }

  private setError(message: string): void {
    this.error = message;
    this.loading = false;
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BarberService } from '../../core/services/barber.service';
import { BarberService as ServiceOption } from '../../core/models/barber.model';
import { TenantService } from '../../core/services/tenant.service';

interface ServiceSummary {
  name: string;
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
}

@Component({
  selector: 'app-barber-services',
  standalone: true,
  imports: [],
  templateUrl: './barber-services.component.html',
  styleUrl: './barber-services.component.css',
})
export class ServicesComponent {
  private readonly barberApi = inject(BarberService);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  protected readonly services = signal<ServiceSummary[]>([]);
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

  constructor() {
    this.barberApi.listServices().subscribe({
      next: (services) => {
        this.services.set(this.summarize(services));
        this.loading = false;
      },
      error: () => {
        this.error = 'Services could not be loaded.';
        this.loading = false;
      },
    });
  }

  protected selectService(service: ServiceSummary): void {
    void this.router.navigate(['/barbers-preview'], {
      queryParams: { service: service.name },
    });
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

  private summarize(services: ServiceOption[]): ServiceSummary[] {
    const grouped = new Map<string, ServiceOption[]>();
    for (const service of services) {
      const key = service.name.trim().toLocaleLowerCase();
      grouped.set(key, [...(grouped.get(key) || []), service]);
    }
    return [...grouped.values()]
      .map((group) => ({
        name: group[0].name,
        minPrice: Math.min(...group.map((service) => Number(service.price))),
        maxPrice: Math.max(...group.map((service) => Number(service.price))),
        minDuration: Math.min(
          ...group.map((service) => service.durationMinutes),
        ),
        maxDuration: Math.max(
          ...group.map((service) => service.durationMinutes),
        ),
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }
}

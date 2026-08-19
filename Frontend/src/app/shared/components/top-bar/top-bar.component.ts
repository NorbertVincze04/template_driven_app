import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { TenantConfig } from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
  );

  protected readonly routeLabel = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.formatRoute(this.router.url)),
    ),
    { initialValue: this.formatRoute(this.router.url) },
  );

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor ?? '#111827',
      '--tenant-secondary': config?.secondaryColor ?? '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
    };
  });

  private formatRoute(url: string): string {
    const segment = url.split('?')[0].split('/').filter(Boolean)[0] ?? '';
    return segment.replace(/-/g, ' ').toUpperCase();
  }
}

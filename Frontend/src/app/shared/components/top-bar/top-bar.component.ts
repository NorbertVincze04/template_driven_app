import { Component, computed, inject } from '@angular/core';
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

  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
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
}

import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantConfig } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
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

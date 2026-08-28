import { Component, computed, inject } from '@angular/core';
import { Location, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [NgStyle, ActionButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
    };
  });
}

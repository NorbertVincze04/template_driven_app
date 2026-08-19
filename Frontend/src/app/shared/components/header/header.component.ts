import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { User } from '../../../core/models/user.model';
import { TenantConfig } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ActionButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = computed((): boolean =>
    this.authService.isLoggedIn(),
  );
  protected readonly currentUser = computed((): User | null =>
    this.authService.currentUser(),
  );
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

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }
}

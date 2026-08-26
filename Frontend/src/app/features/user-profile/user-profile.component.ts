import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TenantConfig } from '../../core/models/tenant.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly tenantService = inject(TenantService);

  protected readonly currentUser = toSignal<User | null>(
    this.authService.currentUser$,
    { initialValue: null },
  );
  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
  );
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

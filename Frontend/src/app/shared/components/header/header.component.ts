import { Component, HostListener, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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

  protected readonly currentUser = toSignal<User | null>(
    this.authService.currentUser$,
    { initialValue: null },
  );
  protected readonly isLoggedIn = computed(
    (): boolean => this.currentUser() !== null,
  );
  protected readonly isDarkMode = this.tenantService.isDarkMode;
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
  protected profileMenuOpen = false;

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  viewProfile(): void {
    this.profileMenuOpen = false;
    this.router.navigate(['/user-profile']);
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenu(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.profileMenuOpen = false;
    }
  }

  onThemeToggle(): void {
    this.tenantService.toggleThemeMode();
  }
}

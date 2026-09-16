import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagementUser } from '../../core/models/management-user.model';
import { AuthService } from '../../core/services/auth.service';
import { ManagementService } from '../../core/services/management.service';
import { TenantService } from '../../core/services/tenant.service';
import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-owner-manage',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './owner-manage.component.html',
  styleUrl: './owner-manage.component.css',
})
export class OwnerManageComponent {
  private readonly authService = inject(AuthService);
  private readonly managementService = inject(ManagementService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected readonly users = signal<ManagementUser[]>([]);
  protected readonly search = signal('');
  protected readonly addSearch = signal('');
  protected addBarberOpen = false;
  protected selectedRole = 'BARBER';
  protected loading = true;
  protected savingId = '';
  protected error = '';
  protected savedId = '';

  protected readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const barbers = this.users().filter((user) => this.isBarber(user));
    if (!term) return barbers;
    return barbers.filter((user) =>
      [user.fullName, user.email, user.phoneNumber || '', ...user.roles]
        .join(' ')
        .toLocaleLowerCase()
        .includes(term),
    );
  });

  protected readonly addCandidates = computed(() => {
    const term = this.addSearch().trim().toLocaleLowerCase();
    return this.users().filter((user) => {
      if (this.isBarber(user)) return false;
      if (!term) return true;
      return [user.fullName, user.email, user.phoneNumber || '']
        .join(' ')
        .toLocaleLowerCase()
        .includes(term);
    });
  });

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

  constructor() {
    if (!this.authService.hasRole('OWNER')) {
      void this.router.navigate(['/home']);
      return;
    }
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.managementService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Users could not be loaded.';
        this.loading = false;
      },
    });
  }

  protected isBarber(user: ManagementUser): boolean {
    return user.roles.includes('BARBER');
  }

  protected openAddBarber(): void {
    this.addSearch.set('');
    this.selectedRole = 'BARBER';
    this.error = '';
    this.addBarberOpen = true;
  }

  protected closeAddBarber(): void {
    if (!this.savingId) this.addBarberOpen = false;
  }

  protected addBarber(user: ManagementUser): void {
    if (this.savingId || this.selectedRole !== 'BARBER') return;
    this.savingId = user.id;
    this.error = '';
    this.managementService.setBarberRole(user.id, true).subscribe({
      next: () => {
        this.savingId = '';
        this.addBarberOpen = false;
        this.users.update((users) =>
          users.map((item) =>
            item.id === user.id
              ? { ...item, roles: [...new Set([...item.roles, 'BARBER'])] }
              : item,
          ),
        );
      },
      error: (error) => {
        this.savingId = '';
        this.error = error.error?.message || 'Barber role could not be added.';
      },
    });
  }

  protected toggleBarber(user: ManagementUser): void {
    if (this.savingId) return;
    this.savingId = user.id;
    this.error = '';
    this.savedId = '';
    this.managementService
      .setBarberRole(user.id, !this.isBarber(user))
      .subscribe({
        next: () => {
          this.savingId = '';
          this.savedId = user.id;
          this.users.update((users) =>
            users.map((item) => {
              if (item.id !== user.id) return item;
              const roles = this.isBarber(item)
                ? item.roles.filter((role) => role !== 'BARBER')
                : [...item.roles, 'BARBER'];
              return {
                ...item,
                roles,
                role: roles.includes(item.role) ? item.role : 'CUSTOMER',
              };
            }),
          );
        },
        error: (error) => {
          this.savingId = '';
          this.error =
            error.error?.message || 'Barber role could not be updated.';
        },
      });
  }

  protected saveNote(user: ManagementUser): void {
    if (this.savingId) return;
    this.savingId = user.id;
    this.error = '';
    this.savedId = '';
    this.managementService
      .updateNote(user.id, user.barberPrivateNote || '')
      .subscribe({
        next: () => {
          this.savingId = '';
          this.savedId = user.id;
        },
        error: (error) => {
          this.savingId = '';
          this.error =
            error.error?.message || 'Private note could not be saved.';
        },
      });
  }
}

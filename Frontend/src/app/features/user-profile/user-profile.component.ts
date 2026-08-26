import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TenantConfig } from '../../core/models/tenant.model';
import { User } from '../../core/models/user.model';
import { Appointment, AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { BarberScheduleComponent } from '../barber-schedule/barber-schedule.component';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BarberScheduleComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentUser = toSignal<User | null>(
    this.authService.currentUser$,
    { initialValue: null },
  );
  protected readonly appointments = signal<Appointment[]>([]);
  protected profileError = '';
  protected profileSaved = false;
  protected profileSaving = false;
  protected appointmentActionId = '';
  protected readonly editingProfile = signal(false);
  protected profileForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^0[237]\d{8}$/)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    profileImageData: new FormControl<string | null>(null),
    profileImagePositionX: new FormControl(50, { nonNullable: true }),
    profileImagePositionY: new FormControl(50, { nonNullable: true }),
  });
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

  constructor() {
    const user = this.currentUser();
    this.profileForm.patchValue({
      fullName: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      profileImageData: user?.profileImageUrl || null,
      profileImagePositionX: user?.profileImagePositionX ?? 50,
      profileImagePositionY: user?.profileImagePositionY ?? 50,
    });
    this.loadAppointments();
    interval(15000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadAppointments());
  }

  protected saveProfile(): void {
    this.profileSaved = false;
    this.profileError = '';
    if (this.profileForm.invalid || this.profileSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profileSaving = true;
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (user) => {
        this.profileSaving = false;
        this.profileSaved = true;
        this.profileForm.patchValue({
          profileImageData: user.profileImageUrl || null,
          profileImagePositionX: user.profileImagePositionX ?? 50,
          profileImagePositionY: user.profileImagePositionY ?? 50,
        });
        this.editingProfile.set(false);
      },
      error: (error) => {
        this.profileSaving = false;
        this.profileError = error.message;
      },
    });
  }

  protected editProfile(): void {
    this.profileError = '';
    this.profileSaved = false;
    this.editingProfile.set(true);
  }

  protected cancelEdit(): void {
    const user = this.currentUser();
    this.profileForm.patchValue({
      fullName: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      profileImageData: user?.profileImageUrl || null,
      profileImagePositionX: user?.profileImagePositionX ?? 50,
      profileImagePositionY: user?.profileImagePositionY ?? 50,
    });
    this.profileError = '';
    this.profileSaved = false;
    this.editingProfile.set(false);
  }

  protected deleteProfileImage(): void {
    this.profileForm.controls.profileImageData.setValue(null);
    this.profileError = '';
    this.profileSaved = false;
  }

  protected updateAppointmentStatus(
    appointment: Appointment,
    status: string,
  ): void {
    if (this.appointmentActionId || appointment.status === status) return;
    this.appointmentActionId = appointment.id;
    this.authService.updateAppointmentStatus(appointment.id, status).subscribe({
      next: () => {
        this.appointmentActionId = '';
        this.loadAppointments();
      },
      error: (error) => {
        this.appointmentActionId = '';
        this.profileError = error.message;
      },
    });
  }

  protected deleteAppointment(appointment: Appointment): void {
    if (this.appointmentActionId || !window.confirm('Delete this appointment?'))
      return;
    this.appointmentActionId = appointment.id;
    this.authService.deleteAppointment(appointment.id).subscribe({
      next: () => {
        this.appointmentActionId = '';
        this.loadAppointments();
      },
      error: (error) => {
        this.appointmentActionId = '';
        this.profileError = error.message;
      },
    });
  }

  private loadAppointments(): void {
    this.authService.getMyAppointments().subscribe({
      next: (appointments) => this.appointments.set(appointments),
      error: (error) => (this.profileError = error.message),
    });
  }

  protected refreshAppointments(): void {
    this.loadAppointments();
  }

  protected onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/') || file.size > 2_000_000) {
      this.profileSaved = false;
      this.profileError = 'Choose an image smaller than 2 MB.';
      input.value = '';
      return;
    }
    this.profileError = '';
    this.profileSaved = false;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1000;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas
          .getContext('2d')
          ?.drawImage(image, 0, 0, canvas.width, canvas.height);
        this.profileForm.controls.profileImageData.setValue(
          canvas.toDataURL('image/jpeg', 0.82),
        );
      };
      image.onerror = () => {
        this.profileError = 'The selected image could not be processed.';
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

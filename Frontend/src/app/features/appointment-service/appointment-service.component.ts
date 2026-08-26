import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarberService } from '../../core/services/barber.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Barber,
  BarberAvailability,
  BarberService as ServiceOption,
} from '../../core/models/barber.model';
import { TenantConfig } from '../../core/models/tenant.model';
import { TenantService } from '../../core/services/tenant.service';
import {
  ActionButtonComponent,
  ActionConfig,
} from '../../shared/components/action-button/action-button.component';

function todayInBucharest(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  return `${values['year']}-${values['month']}-${values['day']}`;
}

@Component({
  selector: 'app-appointment-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent],
  templateUrl: './appointment-service.component.html',
  styleUrl: './appointment-service.component.css',
})
export class AppointmentServiceComponent {
  private readonly tenantService = inject(TenantService);

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
  private readonly route = inject(ActivatedRoute);
  private readonly barberApi = inject(BarberService);
  protected readonly auth = inject(AuthService);
  protected readonly barber = signal<Barber | null>(null);
  protected readonly services = signal<ServiceOption[]>([]);
  protected readonly availability = signal<BarberAvailability | null>(null);
  protected loading = true;
  protected selectedTime = '';
  protected booking = false;
  protected message = '';
  protected error = '';
  protected readonly confirmAppointmentConfig: ActionConfig = {
    label: 'Confirm appointment',
    loadingLabel: 'Booking...',
    variant: 'primary',
    disabled: false,
  };
  protected readonly bookingForm = new FormGroup({
    serviceId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    date: new FormControl(todayInBucharest(), {
      nonNullable: true,
      validators: Validators.required,
    }),
    guestName: new FormControl('', { nonNullable: true }),
    guestEmail: new FormControl('', { nonNullable: true }),
    guestPhone: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const barberName = this.route.snapshot.queryParamMap.get('barber');
    if (!barberName) {
      this.error = 'No barber was selected.';
      this.loading = false;
      return;
    }

    this.barberApi.listBarbers().subscribe({
      next: (barbers) => {
        const selected = barbers.find(
          (barber) =>
            barber.name.toLocaleLowerCase() === barberName.toLocaleLowerCase(),
        );
        if (!selected) {
          this.error = 'Barber not found.';
          this.loading = false;
          return;
        }
        this.barber.set(selected);
        this.barberApi.listServices(selected.id).subscribe({
          next: (services) => {
            this.services.set(services);
            if (services[0])
              this.bookingForm.controls.serviceId.setValue(services[0].id);
            this.loading = false;
            this.loadAvailability();
          },
          error: () => {
            this.error = 'Services could not be loaded.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Barbers could not be loaded.';
        this.loading = false;
      },
    });
  }

  protected loadAvailability(): void {
    const barberId = this.barber()?.id;
    const { serviceId, date } = this.bookingForm.getRawValue();
    if (!barberId || !serviceId || !date) return;
    this.selectedTime = '';
    this.barberApi.availability(barberId, serviceId, date).subscribe({
      next: (value) => this.availability.set(value),
      error: (error) =>
        (this.error =
          error.error?.message || 'Availability could not be loaded.'),
    });
  }

  protected book(): void {
    if (this.booking) {
      return;
    }
    const values = this.bookingForm.getRawValue();
    if (!values.serviceId) {
      this.error = 'Select a service before booking.';
      return;
    }
    if (!values.date) {
      this.error = 'Select an appointment date before booking.';
      return;
    }
    if (!this.barber()) {
      this.error = 'The barber profile is still loading. Please try again.';
      return;
    }
    if (!this.selectedTime) {
      this.error = 'Select an available time before booking.';
      return;
    }
    const accountBooking = !!this.auth.currentUserValue?.token;
    if (
      !accountBooking &&
      (!values.guestName || !values.guestEmail || !values.guestPhone)
    ) {
      this.error = 'Complete your contact details before booking.';
      return;
    }
    this.booking = true;
    this.error = '';
    this.message = '';
    const request = {
      barberId: this.barber()!.id,
      serviceId: values.serviceId,
      date: values.date,
      time: this.selectedTime,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
    };
    const bookingRequest = accountBooking
      ? this.barberApi.bookAccount(request)
      : this.barberApi.bookGuest(request);
    bookingRequest.subscribe({
      next: () => {
        this.message = 'Your appointment has been requested.';
        this.booking = false;
        this.loadAvailability();
      },
      error: (error) => {
        this.error = error.error?.message || 'Booking failed.';
        this.booking = false;
      },
    });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
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
import { slugify } from '../../core/utils/slug.utils';
import {
  ActionButtonComponent,
  ActionConfig,
} from '../../shared/components/action-button/action-button.component';
import { BarberProfileHeaderComponent } from '../../shared/components/barber-profile-header/barber-profile-header.component';
import { TimeSlotPickerComponent } from '../../shared/components/time-slot-picker/time-slot-picker.component';
import { GuestDetailsFormComponent } from '../../shared/components/guest-details-form/guest-details-form.component';

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

/**
 * Orchestrates the public booking page (route: /book, /book/:barberSlug, ...).
 * Responsibilities kept here: resolving which barber/service to preload from
 * the route, loading availability, and submitting the booking request.
 * The visual pieces are delegated to focused, reusable children:
 *  - app-barber-profile-header  -> shows who you're booking with
 *  - app-time-slot-picker       -> lets the visitor pick a time
 *  - app-guest-details-form     -> collects guest contact info when not logged in
 */
@Component({
  selector: 'app-appointment-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButtonComponent,
    BarberProfileHeaderComponent,
    TimeSlotPickerComponent,
    GuestDetailsFormComponent,
  ],
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
  protected submitted = false;
  protected readonly confirmAppointmentConfig: ActionConfig = {
    label: 'Confirm appointment',
    loadingLabel: 'Booking...',
    variant: 'primary',
    disabled: false,
  };
  // Guest details live in their own nested FormGroup so it can be handed
  // directly to <app-guest-details-form> via [group] while staying part of
  // this component's overall bookingForm (validity/values stay in sync).
  protected readonly bookingForm = new FormGroup(
    {
      serviceId: new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      }),
      date: new FormControl(todayInBucharest(), {
        nonNullable: true,
        validators: Validators.required,
      }),
      guestDetails: new FormGroup({
        guestName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        guestEmail: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email],
        }),
        guestPhone: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern(/^0[237]\d{8}$/),
          ],
        }),
      }),
    },
    { validators: this.guestFieldsValidator.bind(this) },
  );

  constructor() {
    const barberId = this.route.snapshot.queryParamMap.get('barberId') || '';
    const barberSlug =
      this.route.snapshot.paramMap.get('barberSlug') ||
      this.route.snapshot.queryParamMap.get('barber') ||
      '';
    const selectedServiceId =
      this.route.snapshot.queryParamMap.get('serviceId') || '';
    const selectedServiceSlug =
      this.route.snapshot.paramMap.get('serviceSlug') ||
      this.route.snapshot.queryParamMap.get('service') ||
      '';

    this.barberApi.listBarbers().subscribe({
      next: (barbers) => {
        if (!barbers.length) {
          this.error = 'No barbers available.';
          this.loading = false;
          return;
        }

        let selected: Barber | undefined;
        if (barberId) {
          selected = barbers.find((b) => b.id === barberId);
        }
        if (!selected && barberSlug) {
          const targetSlug = slugify(barberSlug);
          selected = barbers.find(
            (b) =>
              slugify(b.name) === targetSlug ||
              b.name.toLocaleLowerCase() === barberSlug.toLocaleLowerCase(),
          );
        }
        if (!selected) {
          selected = barbers[0];
        }

        this.barber.set(selected);
        this.barberApi.listServices(selected.id).subscribe({
          next: (services) => {
            this.services.set(services);
            let selectedService: ServiceOption | undefined;
            if (selectedServiceId) {
              selectedService = services.find(
                (service) => service.id === selectedServiceId,
              );
            }
            if (!selectedService && selectedServiceSlug) {
              const targetSlug = slugify(selectedServiceSlug);
              selectedService = services.find(
                (service) =>
                  slugify(service.name) === targetSlug ||
                  service.name.toLocaleLowerCase() ===
                    selectedServiceSlug.toLocaleLowerCase(),
              );
            }

            if (selectedService || services[0]) {
              this.bookingForm.controls.serviceId.setValue(
                (selectedService || services[0]).id,
              );
            }
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

  // Re-fetches free time slots whenever the barber, service or date changes.
  // Called from the template on (change) of the service/date selects, and
  // once from the constructor after the barber + services finish loading.
  protected loadAvailability(): void {
    const barberId = this.barber()?.id;
    const { serviceId, date } = this.bookingForm.getRawValue();
    if (!barberId || !serviceId || !date) return;
    this.selectedTime = ''; // a new date/service invalidates any previously picked slot
    this.barberApi.availability(barberId, serviceId, date).subscribe({
      next: (value) => this.availability.set(value),
      error: (error) =>
        (this.error =
          error.error?.message || 'Availability could not be loaded.'),
    });
  }

  // Cross-field validator attached to the whole bookingForm: guest contact
  // fields are only required when nobody is logged in (see `auth` below).
  private guestFieldsValidator(
    group: AbstractControl,
  ): { [key: string]: any } | null {
    const isGuest = !this.auth.currentUserValue?.token;
    if (!isGuest) {
      return null;
    }

    const guestName = group.get('guestDetails.guestName');
    const guestEmail = group.get('guestDetails.guestEmail');
    const guestPhone = group.get('guestDetails.guestPhone');

    const errors: { [key: string]: any } = {};

    if (guestName?.hasError('required')) {
      errors['guestNameRequired'] = true;
    }

    if (guestEmail?.hasError('required')) {
      errors['guestEmailRequired'] = true;
    } else if (guestEmail?.hasError('email')) {
      errors['guestEmailInvalid'] = true;
    }

    if (guestPhone?.hasError('required')) {
      errors['guestPhoneRequired'] = true;
    } else if (guestPhone?.hasError('pattern')) {
      errors['guestPhoneInvalid'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Handles the booking form submit: validates, then calls the account or
  // guest booking endpoint depending on whether the visitor is signed in.
  protected book(): void {
    if (this.booking) {
      return;
    }
    this.submitted = true; // reveals validation messages in app-guest-details-form
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
    if (!accountBooking) {
      const guestName = this.bookingForm.get('guestDetails.guestName');
      const guestEmail = this.bookingForm.get('guestDetails.guestEmail');
      const guestPhone = this.bookingForm.get('guestDetails.guestPhone');

      if (guestName?.hasError('required') || !values.guestDetails.guestName) {
        this.error = 'Please enter your name.';
        return;
      }
      if (guestEmail?.hasError('required') || !values.guestDetails.guestEmail) {
        this.error = 'Please enter your email address.';
        return;
      }
      if (guestEmail?.hasError('email')) {
        this.error = 'Please enter a valid email address.';
        return;
      }
      if (guestPhone?.hasError('required') || !values.guestDetails.guestPhone) {
        this.error = 'Please enter your phone number.';
        return;
      }
      if (guestPhone?.hasError('pattern')) {
        this.error =
          'Phone number must be in format: 02XXXXXXXX or 03XXXXXXXX or 07XXXXXXXX';
        return;
      }
    }
    this.booking = true;
    this.error = '';
    this.message = '';
    const request = {
      barberId: this.barber()!.id,
      serviceId: values.serviceId,
      date: values.date,
      time: this.selectedTime,
      guestName: values.guestDetails.guestName,
      guestEmail: values.guestDetails.guestEmail,
      guestPhone: values.guestDetails.guestPhone,
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

import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TenantService } from '../../core/services/tenant.service';
import { BarberService } from '../../core/services/barber.service';
import { AuthService } from '../../core/services/auth.service';

import { ActionButtonComponent } from '../../shared/components/action-button/action-button.component';

interface ScheduleDay {
  weekday: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
interface BlockedPeriod {
  id: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}

@Component({
  selector: 'app-barber-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent],
  templateUrl: './barber-schedule.component.html',
  styleUrl: './barber-schedule.component.css',
})
export class BarberScheduleComponent {
  private readonly http = inject(HttpClient);
  private readonly tenant = inject(TenantService);
  private readonly barberApi = inject(BarberService);
  private readonly auth = inject(AuthService);
  protected readonly saved = signal(false);
  protected readonly blockedPeriods = signal<BlockedPeriod[]>([]);
  protected error = '';
  protected readonly days = signal<ScheduleDay[]>([
    {
      weekday: 1,
      label: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    },
    {
      weekday: 2,
      label: 'Tuesday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    },
    {
      weekday: 3,
      label: 'Wednesday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    },
    {
      weekday: 4,
      label: 'Thursday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    },
    {
      weekday: 5,
      label: 'Friday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    },
    {
      weekday: 6,
      label: 'Saturday',
      startTime: '09:00',
      endTime: '14:00',
      isActive: false,
    },
    {
      weekday: 0,
      label: 'Sunday',
      startTime: '09:00',
      endTime: '14:00',
      isActive: false,
    },
  ]);
  protected readonly blockForm = new FormGroup({
    startsAt: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    endsAt: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    reason: new FormControl('', { nonNullable: true }),
  });
  private options() {
    return {
      headers: { 'X-Tenant-Slug': this.tenant.config()?.tenantId || 'default' },
    };
  }
  protected readonly services = signal<any[]>([]);
  protected readonly serviceForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    durationMinutes: new FormControl(30, {
      nonNullable: true,
      validators: Validators.required,
    }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  constructor() {
    effect(() => {
      if (
        this.tenant.config() &&
        this.auth.currentUserValue?.type === 'BARBER'
      ) {
        this.loadSchedule();
        this.barberApi.listMyServices().subscribe({
          next: (services) => this.services.set(services),
          error: (error) =>
            (this.error = this.apiMessage(error, 'Could not load services.')),
        });
      }
    });
  }
  private apiMessage(error: any, fallback: string): string {
    return error.error?.message || error.message || fallback;
  }
  private loadSchedule(): void {
    if (!this.tenant.config()) return;
    this.http
      .get<any>(`${environment.apiUrl}/public/schedule`, this.options())
      .subscribe({
        next: (response) => {
          const current = response.payload.hours;
          this.days.update((days) =>
            days.map(
              (day) =>
                current.find((item: any) => item.weekday === day.weekday) ||
                day,
            ),
          );
          this.blockedPeriods.set(response.payload.blockedPeriods);
        },
        error: (error) =>
          (this.error = this.apiMessage(
            error,
            'Could not load your schedule. Apply the barber scheduling migrations first.',
          )),
      });
  }
  protected save(): void {
    this.http
      .put(
        `${environment.apiUrl}/public/schedule`,
        { hours: this.days() },
        this.options(),
      )
      .subscribe({
        next: () => {
          this.saved.set(true);
          this.error = '';
        },
        error: (error) =>
          (this.error = this.apiMessage(
            error,
            'Could not save working hours.',
          )),
      });
  }
  protected update(
    day: ScheduleDay,
    field: keyof ScheduleDay,
    value: string | boolean,
  ): void {
    this.days.update((days) =>
      days.map((item) => (item === day ? { ...item, [field]: value } : item)),
    );
    this.saved.set(false);
  }
  protected block(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    const values = this.blockForm.getRawValue();
    if (values.startsAt >= values.endsAt) {
      this.error = 'End time must be after start time.';
      return;
    }
    this.error = '';
    this.http
      .post<{
        payload: BlockedPeriod;
      }>(
        `${environment.apiUrl}/public/schedule/blocked`,
        values,
        this.options(),
      )
      .subscribe({
        next: (response) => {
          this.blockedPeriods.update((periods) => [
            ...periods,
            response.payload,
          ]);
          this.blockForm.reset();
        },
        error: (error) =>
          (this.error = error.error?.message || 'Could not block this time.'),
      });
  }
  protected unblock(id: string): void {
    this.http
      .delete(
        `${environment.apiUrl}/public/schedule/blocked/${id}`,
        this.options(),
      )
      .subscribe({
        next: () =>
          this.blockedPeriods.update((periods) =>
            periods.filter((period) => period.id !== id),
          ),
        error: (error) =>
          (this.error = this.apiMessage(
            error,
            'Could not remove this blocked period.',
          )),
      });
  }
  protected addService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }
    this.barberApi.createService(this.serviceForm.getRawValue()).subscribe({
      next: (service) => {
        this.services.update((services) => [...services, service]);
        this.serviceForm.reset({ name: '', durationMinutes: 30, price: 0 });
        this.error = '';
      },
      error: (error) =>
        (this.error = this.apiMessage(
          error,
          'Could not create service. Apply the barber services migration first.',
        )),
    });
  }
}

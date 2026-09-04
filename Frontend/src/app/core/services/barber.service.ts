import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';
import {
  LOCAL_BARBERS,
  LOCAL_BARBER_SERVICES,
} from '../fixtures/barber.fixtures';
import {
  Barber,
  BarberAvailability,
  BarberService as ServiceOption,
} from '../models/barber.model';

@Injectable({ providedIn: 'root' })
export class BarberService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly baseUrl = `${environment.apiUrl}/public`;

  private options() {
    return {
      headers: {
        'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
      },
    };
  }

  listBarbers(): Observable<Barber[]> {
    if (environment.useLocalBarberFixtures) {
      return of(LOCAL_BARBERS);
    }
    return this.http
      .get<{ payload: Barber[] }>(`${this.baseUrl}/barbers`, this.options())
      .pipe(map((response) => response.payload));
  }

  getBarber(id: string): Observable<Barber> {
    if (environment.useLocalBarberFixtures) {
      return of(LOCAL_BARBERS.find((barber) => barber.id === id)!);
    }
    return this.http
      .get<{ payload: Barber }>(`${this.baseUrl}/barbers/${id}`, this.options())
      .pipe(map((response) => response.payload));
  }

  listServices(barberId?: string): Observable<ServiceOption[]> {
    if (environment.useLocalBarberFixtures) {
      return of(
        barberId
          ? LOCAL_BARBER_SERVICES[barberId] || []
          : Object.values(LOCAL_BARBER_SERVICES).flat(),
      );
    }
    return this.http
      .get<{
        payload: ServiceOption[];
      }>(`${this.baseUrl}/services`, {
        ...this.options(),
        params: barberId ? { barberId } : {},
      })
      .pipe(map((response) => response.payload));
  }

  listMyServices(): Observable<ServiceOption[]> {
    return this.http
      .get<{
        payload: ServiceOption[];
      }>(`${this.baseUrl}/services/mine`, this.options())
      .pipe(map((response) => response.payload));
  }

  availability(
    barberId: string,
    serviceId: string,
    date: string,
  ): Observable<BarberAvailability> {
    if (environment.useLocalBarberFixtures) {
      const barber = LOCAL_BARBERS.find((item) => item.id === barberId)!;
      const service = (LOCAL_BARBER_SERVICES[barberId] || []).find(
        (item) => item.id === serviceId,
      )!;
      return of({
        barber,
        service,
        slots: ['09:00', '10:30', '13:00', '15:30'],
      });
    }
    return this.http
      .get<{
        payload: BarberAvailability;
      }>(`${this.baseUrl}/availability`, {
        ...this.options(),
        params: { barberId, serviceId, date },
      })
      .pipe(map((response) => response.payload));
  }

  bookGuest(details: object) {
    if (environment.useLocalBarberFixtures) {
      return of({ success: true, payload: details });
    }
    return this.http.post(
      `${this.baseUrl}/appointments`,
      details,
      this.options(),
    );
  }

  bookAccount(details: object) {
    if (environment.useLocalBarberFixtures) {
      return of({ success: true, payload: details });
    }
    return this.http.post(
      `${this.baseUrl}/appointments/account`,
      details,
      this.options(),
    );
  }

  createService(details: object) {
    return this.http
      .post<{
        payload: ServiceOption;
      }>(`${this.baseUrl}/services`, details, this.options())
      .pipe(map((response) => response.payload));
  }

  updateService(id: string, details: object) {
    return this.http
      .patch<{
        payload: ServiceOption;
      }>(`${this.baseUrl}/services/${id}`, details, this.options())
      .pipe(map((response) => response.payload));
  }

  deleteService(id: string) {
    return this.http.delete(`${this.baseUrl}/services/${id}`, this.options());
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';
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
    return this.http
      .get<{ payload: Barber[] }>(`${this.baseUrl}/barbers`, this.options())
      .pipe(map((response) => response.payload));
  }

  getBarber(id: string): Observable<Barber> {
    return this.http
      .get<{ payload: Barber }>(`${this.baseUrl}/barbers/${id}`, this.options())
      .pipe(map((response) => response.payload));
  }

  listServices(barberId?: string): Observable<ServiceOption[]> {
    return this.http
      .get<{
        payload: ServiceOption[];
      }>(`${this.baseUrl}/services`, { ...this.options(), params: barberId ? { barberId } : {} })
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
    return this.http
      .get<{
        payload: BarberAvailability;
      }>(`${this.baseUrl}/availability`, { ...this.options(), params: { barberId, serviceId, date } })
      .pipe(map((response) => response.payload));
  }

  bookGuest(details: object) {
    return this.http.post(
      `${this.baseUrl}/appointments`,
      details,
      this.options(),
    );
  }

  bookAccount(details: object) {
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
}

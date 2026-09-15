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
  BarberGalleryPhoto,
  BarberReceivedRating,
  BarberService as ServiceOption,
  MyBarberRating,
  MyBarberRatingStatus,
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
    excludeAppointmentId?: string,
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
        params: excludeAppointmentId
          ? { barberId, serviceId, date, excludeAppointmentId }
          : { barberId, serviceId, date },
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

  listGalleryForBarber(barberId: string): Observable<BarberGalleryPhoto[]> {
    if (environment.useLocalBarberFixtures) {
      return of([]);
    }
    return this.http
      .get<{
        payload: BarberGalleryPhoto[];
      }>(`${this.baseUrl}/barbers/${barberId}/gallery`, this.options())
      .pipe(map((response) => response.payload));
  }

  listMyGallery(): Observable<BarberGalleryPhoto[]> {
    return this.http
      .get<{
        payload: BarberGalleryPhoto[];
      }>(`${this.baseUrl}/barbers/me/gallery`, this.options())
      .pipe(map((response) => response.payload));
  }

  addGalleryPhoto(
    imageData: string,
    caption: string | null,
    imagePositionX: number,
    imagePositionY: number,
  ) {
    return this.http
      .post<{
        payload: BarberGalleryPhoto;
      }>(`${this.baseUrl}/barbers/me/gallery`, { imageData, caption, imagePositionX, imagePositionY }, this.options())
      .pipe(map((response) => response.payload));
  }

  deleteGalleryPhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/barbers/me/gallery/${photoId}`,
      this.options(),
    );
  }

  // The logged-in customer's rating status for this barber: whether they're
  // eligible (had a completed appointment) and whether they can (re)rate now.
  getMyRating(barberId: string): Observable<MyBarberRatingStatus> {
    return this.http
      .get<{
        payload: MyBarberRatingStatus;
      }>(`${this.baseUrl}/barbers/${barberId}/rating/mine`, this.options())
      .pipe(map((response) => response.payload));
  }

  listMyReceivedRatings(): Observable<BarberReceivedRating[]> {
    return this.http
      .get<{
        payload: BarberReceivedRating[];
      }>(`${this.baseUrl}/barbers/me/ratings`, this.options())
      .pipe(map((response) => response.payload));
  }

  listRatingsForBarber(barberId: string): Observable<BarberReceivedRating[]> {
    if (environment.useLocalBarberFixtures) {
      return of([]);
    }
    return this.http
      .get<{
        payload: BarberReceivedRating[];
      }>(`${this.baseUrl}/barbers/${barberId}/ratings`, this.options())
      .pipe(map((response) => response.payload));
  }

  rateBarber(
    barberId: string,
    rating: number,
    comment: string,
  ): Observable<MyBarberRating> {
    return this.http
      .post<{
        payload: MyBarberRating;
      }>(
        `${this.baseUrl}/barbers/${barberId}/rating`,
        { rating, comment },
        this.options(),
      )
      .pipe(map((response) => response.payload));
  }

  deleteMyRating(barberId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/barbers/${barberId}/rating`,
      this.options(),
    );
  }
}

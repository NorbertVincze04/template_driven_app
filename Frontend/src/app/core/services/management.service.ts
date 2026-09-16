import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagementUser } from '../models/management-user.model';
import { OwnerAnalytics } from '../models/owner-analytics.model';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class ManagementService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly baseUrl = `${environment.apiUrl}/management`;

  private options() {
    return {
      headers: {
        'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
      },
    };
  }

  listUsers(): Observable<ManagementUser[]> {
    return this.http
      .get<{
        payload: ManagementUser[];
      }>(`${this.baseUrl}/users`, this.options())
      .pipe(map((response) => response.payload));
  }

  getAnalytics(): Observable<OwnerAnalytics> {
    return this.http
      .get<{
        payload: OwnerAnalytics;
      }>(`${this.baseUrl}/analytics`, this.options())
      .pipe(map((response) => response.payload));
  }

  setBarberRole(userId: string, enabled: boolean): Observable<void> {
    return this.http
      .patch<void>(
        `${this.baseUrl}/users/${userId}/barber-role`,
        { enabled },
        this.options(),
      )
      .pipe(map(() => undefined));
  }

  updateNote(userId: string, note: string): Observable<void> {
    return this.http
      .patch<void>(
        `${this.baseUrl}/users/${userId}/note`,
        { note },
        this.options(),
      )
      .pipe(map(() => undefined));
  }
}

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';

const POLL_INTERVAL_MS = 10000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.isRead).length,
  );

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private readonly locallyDeletedIds = new Set<string>();

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.refresh();
        this.startPolling();
      } else {
        this._notifications.set([]);
        this.stopPolling();
      }
    });

    // Catches notifications created while this tab was inactive/backgrounded.
    if (this.isBrowser) {
      document.addEventListener('visibilitychange', () => {
        if (
          document.visibilityState === 'visible' &&
          this.authService.currentUserValue
        ) {
          this.refresh();
        }
      });
      window.addEventListener('focus', () => {
        if (this.authService.currentUserValue) {
          this.refresh();
        }
      });
    }
  }

  private headers(): Record<string, string> {
    return {
      'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
    };
  }

  refresh(): void {
    this.http
      .get<any>(`${environment.apiUrl}/notifications`, {
        headers: this.headers(),
      })
      .pipe(
        map((response) =>
          ((response.payload || []) as AppNotification[]).filter(
            (notification) => !this.locallyDeletedIds.has(notification.id),
          ),
        ),
        catchError(() => of<AppNotification[]>([])),
      )
      .subscribe((notifications) => this._notifications.set(notifications));
  }

  markAsRead(id: string): void {
    const notification = this._notifications().find((n) => n.id === id);
    if (!notification || notification.isRead) {
      return;
    }
    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    this.http
      .patch(`${environment.apiUrl}/notifications/${id}/read`, null, {
        headers: this.headers(),
      })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0) {
      return;
    }
    this._notifications.update((list) =>
      list.map((n) => ({ ...n, isRead: true })),
    );
    this.http
      .patch(`${environment.apiUrl}/notifications/read-all`, null, {
        headers: this.headers(),
      })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  delete(id: string): void {
    const previousNotifications = this._notifications();
    this.locallyDeletedIds.add(id);
    this._notifications.update((list) =>
      list.filter((notification) => notification.id !== id),
    );
    this.http
      .delete(`${environment.apiUrl}/notifications/${id}`, {
        headers: this.headers(),
      })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      )
      .subscribe((deleted) => {
        if (!deleted) {
          this.locallyDeletedIds.delete(id);
          this._notifications.set(previousNotifications);
        }
      });
  }

  private startPolling(): void {
    if (this.pollHandle || !this.isBrowser) {
      return;
    }
    this.pollHandle = setInterval(() => this.refresh(), POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }
}

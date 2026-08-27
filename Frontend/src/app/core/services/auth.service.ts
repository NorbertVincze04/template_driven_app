import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import {
  BehaviorSubject,
  MonoTypeOperatorFunction,
  catchError,
  throwError,
  Observable,
  map,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';

export interface Appointment {
  id: string;
  status: string;
  date: string;
  serviceName: string;
  hour: string;
  customerName?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tenantService: TenantService,
  ) {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const storedUser = localStorage.getItem(environment.CURRENT_USER_STORAGE);
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  get userRole() {
    return this.currentUserSubject.value?.type;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private persistCurrentUser(user: User): void {
    const { phoneNumber, ...storedUser } = user;
    localStorage.setItem(
      environment.CURRENT_USER_STORAGE,
      JSON.stringify(storedUser),
    );
  }

  private throwApiError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error: unknown) => {
      const message =
        error instanceof HttpErrorResponse &&
        typeof error.error?.message === 'string'
          ? error.error.message
          : 'Server Error: Please try again later.';

      return throwError(() => new Error(message));
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.authUrl}/users`).pipe(
      map((response) => {
        if (!response.success) {
          return [];
        }

        return response.payload;
      }),
    );
  }

  register(userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Observable<boolean> {
    return this.http
      .post<any>(`${this.authUrl}/register`, userData, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .pipe(
        map((response) => !!response.success),
        this.throwApiError(),
      );
  }

  login(
    email: string,
    password: string,
  ): Observable<{ isTempPassword: boolean }> {
    return this.http
      .post<any>(
        `${this.authUrl}/login`,
        {
          email,
          password,
        },
        {
          headers: {
            'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
          },
        },
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            const userWithToken: User = {
              id: response.payload.id,
              name: response.payload.fullName,
              email: response.payload.email,
              type: response.payload.role,
              token: response.payload.token,
              password: '',
              tenantId: response.payload.shopSlug,
              phoneNumber: response.payload.phoneNumber,
              profileImageUrl: response.payload.profileImageUrl,
              profileImagePositionX: response.payload.profileImagePositionX,
              profileImagePositionY: response.payload.profileImagePositionY,
            };

            this.currentUserSubject.next(userWithToken);
            this.persistCurrentUser(userWithToken);
          }
        }),
        map((response) => ({
          isTempPassword: !!response.payload?.isTempPassword,
        })),
        this.throwApiError(),
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(environment.CURRENT_USER_STORAGE);
  }

  updateProfile(profile: {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImageData: string | null;
    profileImagePositionX: number;
    profileImagePositionY: number;
  }): Observable<User> {
    return this.http
      .patch<any>(`${environment.apiUrl}/users/me`, profile, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .pipe(
        map((response) => {
          const updatedUser: User = {
            ...this.currentUserSubject.value!,
            name: response.payload.fullName,
            email: response.payload.email,
            phoneNumber: response.payload.phoneNumber,
            profileImageUrl: response.payload.profileImageUrl,
            profileImagePositionX: response.payload.profileImagePositionX,
            profileImagePositionY: response.payload.profileImagePositionY,
          };
          this.currentUserSubject.next(updatedUser);
          this.persistCurrentUser(updatedUser);
          return updatedUser;
        }),
        this.throwApiError(),
      );
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/appointments/mine`, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .pipe(
        map((response) => response.payload || []),
        this.throwApiError(),
      );
  }

  updateAppointmentStatus(id: string, status: string): Observable<void> {
    return this.http
      .patch(
        `${environment.apiUrl}/appointments/mine/${id}`,
        { status },
        {
          headers: {
            'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
          },
        },
      )
      .pipe(
        map(() => undefined),
        this.throwApiError(),
      );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http
      .delete(`${environment.apiUrl}/appointments/mine/${id}`, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .pipe(
        map(() => undefined),
        this.throwApiError(),
      );
  }

  isTokenValid(user: User | null): boolean {
    return user ? !!user.token : false; // '!!' to convert to boolean
  }
}

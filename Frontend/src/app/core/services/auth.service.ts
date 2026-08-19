import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
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

  private throwApiError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error: unknown) =>
      throwError(() => new Error('Server Error: Please try again later.')),
    );
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
  }): Observable<boolean> {
    return this.http.post<any>(`${this.authUrl}/register`, userData).pipe(
      map((response) => !!response.success),
      this.throwApiError(),
    );
  }

  login(
    email: string,
    password: string,
  ): Observable<{ isTempPassword: boolean }> {
    return this.http
      .post<any>(`${this.authUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const userWithToken: User = {
              name: response.payload.fullName,
              email: response.payload.email,
              type: response.payload.type,
              token: response.payload.token,
              password: '',
              tenantId: response.payload.tenantId,
            };

            this.currentUserSubject.next(userWithToken);

            localStorage.setItem(
              environment.CURRENT_USER_STORAGE,
              JSON.stringify(userWithToken),
            );
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

  isTokenValid(user: User | null): boolean {
    return user ? !!user.token : false; // '!!' to convert to boolean
  }
}

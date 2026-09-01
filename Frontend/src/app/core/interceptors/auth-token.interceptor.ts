import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!this.isBrowser) {
      return next.handle(req);
    }

    const rawUser = localStorage.getItem(environment.CURRENT_USER_STORAGE);
    if (!rawUser) {
      return next.handle(req);
    }

    try {
      const user = JSON.parse(rawUser) as { token?: string };
      if (!user.token) {
        return next.handle(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
          }
          return throwError(() => error);
        }),
      );
    } catch {
      return next.handle(req);
    }
  }
}

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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

      return next.handle(authReq);
    } catch {
      return next.handle(req);
    }
  }
}

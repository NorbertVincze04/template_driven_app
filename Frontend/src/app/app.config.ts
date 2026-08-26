import {
  APP_INITIALIZER,
  ApplicationConfig,
  PLATFORM_ID,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { TenantService } from './core/services/tenant.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    {
      provide: APP_INITIALIZER,
      useFactory: (tenantService: TenantService, platformId: object) => {
        return () => {
          if (!isPlatformBrowser(platformId)) {
            return;
          }
          return firstValueFrom(
            tenantService.loadForDomain(window.location.hostname),
          );
        };
      },
      deps: [TenantService, PLATFORM_ID],
      multi: true,
    },
  ],
};

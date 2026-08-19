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

function resolveTenantId(hostname: string): string {
  const parts = hostname.split('.');
  // e.g. acme.myapp.com → 'acme', localhost → 'default'
  return parts.length > 2 ? parts[0] : 'default';
}

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
          const tenantId = resolveTenantId(window.location.hostname);
          return firstValueFrom(tenantService.loadFromAssets(tenantId));
        };
      },
      deps: [TenantService, PLATFORM_ID],
      multi: true,
    },
  ],
};

import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { TenantConfig, TenantThemeMode } from '../models/tenant.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly _config = signal<TenantConfig | null>(null);
  private readonly _themeMode = signal<TenantThemeMode>('light');

  readonly config = this._config.asReadonly();
  readonly themeMode = this._themeMode.asReadonly();
  readonly isDarkMode = computed(() => this._themeMode() === 'dark');

  loadForDomain(domain: string): Observable<void> {
    return this.http
      .get<{
        success: boolean;
        payload: TenantConfig;
      }>(`${environment.apiUrl}/tenant/config`, { headers: { 'X-Tenant-Domain': domain } })
      .pipe(
        map((response) => response.payload),
        catchError(() => this.http.get<TenantConfig>('tenants/default.json')),
        tap((config) => this.setTenant(config)),
        map(() => undefined),
      );
  }

  setTenant(config: TenantConfig): void {
    this._config.set(config);
    this.setThemeMode(config.style?.mode);

    if (config.fontFamily) {
      this.loadGoogleFont(config.fontFamily);
    }
    if (config.fontFamilySecondary) {
      this.loadGoogleFont(config.fontFamilySecondary);
    }
  }

  private loadGoogleFont(fontName: string): void {
    const id = `tenant-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (this.document.getElementById(id)) {
      return;
    }
    const link = this.document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
    this.document.head.appendChild(link);
  }

  setThemeMode(mode?: TenantThemeMode): void {
    const normalizedMode: TenantThemeMode = mode === 'dark' ? 'dark' : 'light';
    this._themeMode.set(normalizedMode);
    this.document.documentElement.setAttribute('data-theme', normalizedMode);
    this.document.documentElement.style.colorScheme = normalizedMode;
  }

  toggleThemeMode(): void {
    this.setThemeMode(this.isDarkMode() ? 'light' : 'dark');
  }
}

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
      }>(`${environment.apiUrl}/tenant/config`, {
        headers: { 'X-Tenant-Domain': domain },
      })
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
    this.applyCssVariables(config);

    if (config.fontFamily) {
      this.loadGoogleFont(config.fontFamily);
    }
    if (config.fontFamilySecondary) {
      this.loadGoogleFont(config.fontFamilySecondary);
    }
  }

  private applyCssVariables(config: TenantConfig): void {
    const root = this.document.documentElement;
    const primary = config.primaryColor || '#111827';
    const secondary = config.secondaryColor || '#374151';

    root.style.setProperty('--tenant-primary', primary);
    root.style.setProperty('--tenant-secondary', secondary);
    root.style.setProperty(
      '--tenant-primary-contrast',
      this.getContrastColor(primary),
    );
    root.style.setProperty(
      '--tenant-secondary-contrast',
      this.getContrastColor(secondary),
    );

    if (config.fontFamily) {
      root.style.setProperty(
        '--tenant-font',
        `'${config.fontFamily}', sans-serif`,
      );
    }
    if (config.fontFamilySecondary) {
      root.style.setProperty(
        '--tenant-font-secondary',
        `'${config.fontFamilySecondary}', Georgia, serif`,
      );
    }
  }

  private getContrastColor(hexColor?: string): string {
    if (!hexColor) return '#ffffff';
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (hex.length !== 6) return '#ffffff';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? '#0f172a' : '#ffffff';
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

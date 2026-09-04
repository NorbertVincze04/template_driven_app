import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { TenantConfig, TenantThemeMode } from '../models/tenant.model';
import { environment } from '../../../environments/environment';

// Tenant-agnostic fallback key: lets the pre-bootstrap inline script in
// index.html (and first-time visitors without a tenant-scoped choice yet)
// restore the user's last explicit theme choice before the tenant loads.
const GLOBAL_THEME_KEY = 'lastThemeMode';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly http = inject(HttpClient);
  private readonly _config = signal<TenantConfig | null>(null);
  private readonly _themeMode = signal<TenantThemeMode>('light');
  private activeTenantId: string | null = null;

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
    this.activeTenantId = config.tenantId;
    // Theme preference is shared by every page (auth pages included) and
    // survives login/logout: it's stored per tenant only, in localStorage.
    // Falls back to the tenant's configured default, then the browser's
    // prefers-color-scheme, if the user never picked a theme themselves.
    const savedMode = this.readSavedTheme(config.tenantId);
    this.applyThemeMode(
      savedMode ||
        config.style?.mode ||
        this.readBrowserPreference() ||
        undefined,
      false,
    );
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
    this.applyThemeMode(mode, true);
  }

  private applyThemeMode(
    mode: TenantThemeMode | undefined,
    persist: boolean,
  ): void {
    const normalizedMode: TenantThemeMode = mode === 'dark' ? 'dark' : 'light';
    this._themeMode.set(normalizedMode);
    this.document.documentElement.setAttribute('data-theme', normalizedMode);
    this.document.documentElement.style.colorScheme = normalizedMode;
    if (persist) {
      this.saveTheme(normalizedMode);
    }
  }

  private themeStorageKey(tenantId: string): string {
    return `themeMode:${tenantId}`;
  }

  private readSavedTheme(tenantId: string): TenantThemeMode | null {
    if (!this.isBrowser) return null;
    const saved =
      localStorage.getItem(this.themeStorageKey(tenantId)) ||
      localStorage.getItem(GLOBAL_THEME_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  }

  private readBrowserPreference(): TenantThemeMode | null {
    if (!this.isBrowser || !window.matchMedia) return null;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : null;
  }

  private saveTheme(mode: TenantThemeMode): void {
    if (!this.isBrowser) return;
    localStorage.setItem(GLOBAL_THEME_KEY, mode);
    if (this.activeTenantId) {
      localStorage.setItem(this.themeStorageKey(this.activeTenantId), mode);
    }
  }

  toggleThemeMode(): void {
    this.setThemeMode(this.isDarkMode() ? 'light' : 'dark');
  }
}

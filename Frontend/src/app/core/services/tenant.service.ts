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

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly http = inject(HttpClient);
  private readonly _config = signal<TenantConfig | null>(null);
  private readonly _themeMode = signal<TenantThemeMode>('light');
  private activeUserId: string | null = null;
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
    const storedUserId = this.getStoredUserId();
    if (this.activeUserId === null) {
      this.activeUserId = storedUserId;
    }
    const savedMode = this.readSavedTheme(config.tenantId, this.activeUserId);
    this.applyThemeMode(savedMode || config.style?.mode, false);
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

  setUserThemeContext(userId: string | null, tenantId?: string): void {
    this.activeUserId = userId;
    this.activeTenantId = tenantId || this.activeTenantId;
    const config = this._config();
    if (config) {
      const savedMode = this.readSavedTheme(config.tenantId, userId);
      this.applyThemeMode(savedMode || config.style?.mode, false);
    }
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

  private themeStorageKey(tenantId: string, userId: string | null): string {
    return `themeMode:${tenantId}:${userId || 'guest'}`;
  }

  private readSavedTheme(
    tenantId: string,
    userId: string | null,
  ): TenantThemeMode | null {
    if (!this.isBrowser) return null;
    const saved = localStorage.getItem(this.themeStorageKey(tenantId, userId));
    return saved === 'dark' || saved === 'light' ? saved : null;
  }

  private saveTheme(mode: TenantThemeMode): void {
    if (!this.isBrowser || !this.activeTenantId) return;
    localStorage.setItem(
      this.themeStorageKey(this.activeTenantId, this.activeUserId),
      mode,
    );
  }

  private getStoredUserId(): string | null {
    if (!this.isBrowser) return null;
    try {
      const storedUser = JSON.parse(
        localStorage.getItem(environment.CURRENT_USER_STORAGE) || 'null',
      ) as { id?: string } | null;
      return storedUser?.id || null;
    } catch {
      return null;
    }
  }

  toggleThemeMode(): void {
    this.setThemeMode(this.isDarkMode() ? 'light' : 'dark');
  }
}

import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { Subject, filter, takeUntil } from 'rxjs';
import { TenantService } from './core/services/tenant.service';
import { TopBarComponent } from './shared/components/top-bar/top-bar.component';
import { NotificationService } from './core/services/notification.service';
import { AuthService, Appointment } from './core/services/auth.service';
import { QuickRebookModalComponent } from './shared/components/quick-rebook-modal/quick-rebook-modal.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    TopBarComponent,
    QuickRebookModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  showBars = true;
  private readonly tenantService = inject(TenantService);
  private readonly platformId = inject(PLATFORM_ID);
  // Constructed here (rather than only when the header's notification menu
  // renders) so unread notifications are fetched the instant the app loads,
  // on every visit, regardless of what the current route/layout shows.
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  protected readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });
  protected quickRebookAppointment: Appointment | null = null;
  protected quickRebookOpen = false;
  private quickRebookCheckedKey = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    effect(() => {
      const user = this.currentUser();
      const tenant = this.tenantService.config();
      const userRoles = user?.roles || (user ? [user.type] : []);
      if (
        !isPlatformBrowser(this.platformId) ||
        !user?.id ||
        !userRoles.includes('CUSTOMER') ||
        !tenant
      )
        return;

      const key = `quick-rebook:${tenant.tenantId}:${user.id}`;
      if (this.quickRebookCheckedKey === key) return;
      this.quickRebookCheckedKey = key;

      this.authService.getMyAppointments().subscribe({
        next: (appointments) => {
          const completed = appointments
            .filter(
              (appointment) =>
                appointment.status === 'COMPLETED' &&
                appointment.barberId &&
                appointment.serviceId,
            )
            .sort((first, second) =>
              `${second.date} ${second.hour}`.localeCompare(
                `${first.date} ${first.hour}`,
              ),
            )[0];
          if (completed && localStorage.getItem(key) !== completed.id) {
            this.quickRebookAppointment = completed;
            this.quickRebookOpen = true;
          } else {
            localStorage.setItem(key, completed?.id || 'none');
          }
        },
        error: () => localStorage.setItem(key, 'none'),
      });
    });
  }

  get showHeader(): boolean {
    return (
      this.showBars && (this.tenantService.config()?.layout?.showHeader ?? true)
    );
  }

  get showFooter(): boolean {
    return (
      this.showBars && (this.tenantService.config()?.layout?.showFooter ?? true)
    );
  }

  get showTopBar(): boolean {
    return (
      this.showBars && (this.tenantService.config()?.layout?.showTopBar ?? true)
    );
  }

  get isLoading(): boolean {
    return !this.tenantService.config();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.tenantService.loadForDomain(window.location.hostname).subscribe();
    }

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        const showBars = route.snapshot.data['showBars'];
        this.showBars = showBars !== false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected quickRebook(): void {
    const appointment = this.quickRebookAppointment;
    this.dismissQuickRebook();
    if (!appointment?.barberId || !appointment.serviceId) return;
    void this.router.navigate(['/book'], {
      queryParams: {
        barberId: appointment.barberId,
        serviceId: appointment.serviceId,
      },
    });
  }

  protected dismissQuickRebook(): void {
    const appointmentId = this.quickRebookAppointment?.id || 'none';
    this.quickRebookOpen = false;
    this.quickRebookAppointment = null;
    if (this.quickRebookCheckedKey && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.quickRebookCheckedKey, appointmentId);
    }
  }
}

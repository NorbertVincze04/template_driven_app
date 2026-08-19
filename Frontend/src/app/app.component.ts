import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TopBarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  showBars = true;
  private readonly tenantService = inject(TenantService);
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

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

  ngOnInit() {
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
}

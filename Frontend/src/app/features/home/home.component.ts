import { Component, computed, inject } from '@angular/core';
import { TenantService } from '../../core/services/tenant.service';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly tenantService = inject(TenantService);

  protected readonly showHeroSection = computed(
    (): boolean => this.tenantService.config()?.layout?.showHeroSection ?? true,
  );
}

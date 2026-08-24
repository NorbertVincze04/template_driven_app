import { Component, Input } from '@angular/core';
import {
  TenantHeroLayout,
  TenantHeroSection,
} from '../../../core/models/tenant.model';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [],
  templateUrl: './hero-background.component.html',
  styleUrl: './hero-background.component.css',
})
export class HeroBackgroundComponent {
  @Input({ required: true }) content!: TenantHeroSection;
  @Input({ required: true }) layout!: TenantHeroLayout;
}

import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  TenantHeroLayout,
  TenantHeroSection,
  TenantProfileGalleryItem,
} from '../../../core/models/tenant.model';

@Component({
  selector: 'app-profile-gallery',
  standalone: true,
  imports: [],
  templateUrl: './profile-gallery.component.html',
  styleUrl: './profile-gallery.component.css',
})
export class ProfileGalleryComponent {
  private readonly router = inject(Router);
  @Input({ required: true }) content!: TenantHeroSection;
  @Input({ required: true }) layout!: TenantHeroLayout;

  protected hasGallery(): boolean {
    return (this.content.profileGallery?.length || 0) > 0;
  }

  protected trackByName(_: number, item: TenantProfileGalleryItem): string {
    return item.name;
  }

  protected onProfileClick(profile: TenantProfileGalleryItem): void {
    this.router.navigate(['/appointment-service'], {
      queryParams: { barber: profile.name },
    });
  }
}

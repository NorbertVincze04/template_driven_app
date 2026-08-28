import { Component, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  TenantReviewItem,
  TenantReviewsContent,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-site-reviews',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './client-site-reviews.component.html',
  styleUrl: './client-site-reviews.component.css',
})
export class ClientSiteReviewsComponent {
  private readonly tenantService = inject(TenantService);
  private readonly http = inject(HttpClient);

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#1f5e4a',
      '--tenant-secondary': config?.secondaryColor || '#b25a48',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', serif`
        : 'inherit',
    };
  });

  protected readonly reviewsContent = computed((): TenantReviewsContent => {
    const content = this.tenantService.config()?.reviews;
    return {
      sectionLabel: content?.sectionLabel || 'Client Reviews',
      title: content?.title || 'What Our Clients Say',
      description:
        content?.description ||
        'Read genuine reviews and experiences shared by our valued guests.',
      reviews: content?.reviews || [],
    };
  });

  protected readonly localReviews = signal<TenantReviewItem[]>([]);

  protected readonly averageRating = computed((): string => {
    const list = this.reviewsList();
    if (!list.length) return '5.0';
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  protected readonly reviewsList = computed((): TenantReviewItem[] => {
    const tenantRevs = this.reviewsContent().reviews || [];
    const addedRevs = this.localReviews();
    return [...addedRevs, ...tenantRevs];
  });

  // Modal State
  protected isModalOpen = signal(false);

  // Form State
  protected authorName = '';
  protected authorRole = '';
  protected rating = 5;
  protected comment = '';
  protected formError = signal<string | null>(null);

  constructor() {
    this.http
      .get<{ payload: TenantReviewItem[] }>(`${environment.apiUrl}/reviews`, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .subscribe({
        next: (response) => this.localReviews.set(response.payload || []),
      });
  }

  openReviewModal(): void {
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  closeReviewModal(): void {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  setRating(r: number): void {
    this.rating = r;
  }

  submitReview(): void {
    if (!this.authorName.trim()) {
      this.formError.set('Please enter your name.');
      return;
    }

    if (!this.comment.trim()) {
      this.formError.set('Please write a comment for your review.');
      return;
    }

    this.http
      .post<{ payload: TenantReviewItem }>(
        `${environment.apiUrl}/reviews`,
        {
          authorName: this.authorName.trim(),
          authorRole: this.authorRole.trim() || null,
          rating: this.rating,
          comment: this.comment.trim(),
        },
        {
          headers: {
            'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
          },
        },
      )
      .subscribe({
        next: (response) => {
          this.localReviews.update((prev) => [response.payload, ...prev]);
          this.closeReviewModal();
        },
        error: (error) =>
          this.formError.set(
            error.error?.message || 'Could not submit your review.',
          ),
      });
  }

  private resetForm(): void {
    this.authorName = '';
    this.authorRole = '';
    this.rating = 5;
    this.comment = '';
    this.formError.set(null);
  }
}

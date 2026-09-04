import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TenantReviewItem,
  TenantReviewsContent,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { ReviewsListComponent } from '../reviews-list/reviews-list.component';
import {
  ReviewFormModalComponent,
  ReviewSubmission,
} from '../review-form-modal/review-form-modal.component';
import { environment } from '../../../../environments/environment';

/**
 * Orchestrates the tenant "Client Reviews" section:
 * - reads tenant-configured heading copy + seed reviews from TenantService.
 * - fetches visitor-submitted reviews from the API for the active tenant.
 * - renders the grid via <app-reviews-list> and the "add review" dialog via
 *   <app-review-form-modal>, wiring their outputs back into this component.
 * This component owns all state/HTTP calls; the two children are purely
 * presentational and reusable on their own.
 */
@Component({
  selector: 'app-client-site-reviews',
  standalone: true,
  imports: [ActionButtonComponent, ReviewsListComponent, ReviewFormModalComponent],
  templateUrl: './client-site-reviews.component.html',
  styleUrl: './client-site-reviews.component.css',
})
export class ClientSiteReviewsComponent {
  private readonly tenantService = inject(TenantService);
  private readonly http = inject(HttpClient);

  // CSS custom properties so this section follows the current tenant's brand colors/fonts.
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

  // Tenant-driven heading copy for this section (falls back to sane defaults).
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

  // Reviews submitted by real visitors through the API (kept separate from tenant-seeded ones).
  protected readonly localReviews = signal<TenantReviewItem[]>([]);

  // Visitor-submitted reviews are shown first, followed by the tenant's curated ones.
  protected readonly reviewsList = computed((): TenantReviewItem[] => {
    const tenantReviews = this.reviewsContent().reviews || [];
    return [...this.localReviews(), ...tenantReviews];
  });

  protected readonly averageRating = computed((): string => {
    const list = this.reviewsList();
    if (!list.length) return '5.0';
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  // Whether <app-review-form-modal> is currently shown.
  protected readonly isModalOpen = signal(false);
  // Error from the last failed submit attempt; shown inside the modal.
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    this.fetchReviews();
  }

  private fetchReviews(): void {
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

  // Called by the "Leave a Review" button and by the child's empty-state button.
  protected openReviewModal(): void {
    this.submitError.set(null);
    this.isModalOpen.set(true);
  }

  // Called when the modal is cancelled/dismissed.
  protected closeReviewModal(): void {
    this.isModalOpen.set(false);
  }

  // Called when <app-review-form-modal> emits a validated review; performs the API call.
  protected handleReviewSubmit(review: ReviewSubmission): void {
    this.http
      .post<{ payload: TenantReviewItem }>(
        `${environment.apiUrl}/reviews`,
        {
          authorName: review.authorName,
          authorRole: review.authorRole || null,
          rating: review.rating,
          comment: review.comment,
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
          this.isModalOpen.set(false);
        },
        error: (error) =>
          this.submitError.set(
            error.error?.message || 'Could not submit your review.',
          ),
      });
  }
}

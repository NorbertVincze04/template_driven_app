import { Component, Signal, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TenantReviewItem,
  TenantReviewsContent,
} from '../../../core/models/tenant.model';
import { TenantService } from '../../../core/services/tenant.service';
import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'app-client-site-reviews',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './client-site-reviews.component.html',
  styleUrl: './client-site-reviews.component.css',
})
export class ClientSiteReviewsComponent {
  private readonly tenantService = inject(TenantService);

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

  // Local list of reviews initialized with tenant configuration reviews
  protected readonly localReviews = signal<TenantReviewItem[]>([]);

  // Average rating signal
  protected readonly averageRating = computed((): string => {
    const list = this.reviewsList();
    if (!list.length) return '5.0';
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  // Signal returning all reviews (tenant + newly submitted)
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

    const today = new Date().toISOString().split('T')[0];

    const newReview: TenantReviewItem = {
      id: `user-rev-${Date.now()}`,
      authorName: this.authorName.trim(),
      authorRole: this.authorRole.trim() || 'Verified Client',
      rating: this.rating,
      comment: this.comment.trim(),
      date: today,
    };

    this.localReviews.update((prev) => [newReview, ...prev]);
    this.closeReviewModal();
  }

  private resetForm(): void {
    this.authorName = '';
    this.authorRole = '';
    this.rating = 5;
    this.comment = '';
    this.formError.set(null);
  }
}

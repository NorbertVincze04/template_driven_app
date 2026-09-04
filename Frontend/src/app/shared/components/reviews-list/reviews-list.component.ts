import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TenantReviewItem } from '../../../core/models/tenant.model';
import { ActionButtonComponent } from '../action-button/action-button.component';

/**
 * Presentational component: renders the grid of client reviews (or an empty
 * state when there are none yet). It receives the already-combined list of
 * tenant-seeded + visitor-submitted reviews from its parent
 * (ClientSiteReviewsComponent) and never fetches or stores data itself.
 * When the visitor wants to add a review, it asks the parent via `writeReview`.
 */
@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent {
  // Reviews to display, already ordered by the parent (newest visitor reviews first).
  @Input() reviews: TenantReviewItem[] = [];

  // Fired when the visitor clicks "Write First Review" in the empty state.
  // The parent listens to this to open the review form modal.
  @Output() writeReview = new EventEmitter<void>();

  // Used by the template to draw 5 star icons per review without repeating literals.
  protected readonly starIndexes = [1, 2, 3, 4, 5];
}

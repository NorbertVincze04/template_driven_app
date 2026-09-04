import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionButtonComponent } from '../action-button/action-button.component';

export interface ReviewSubmission {
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
}

/**
 * Reusable modal dialog used to collect a new review from a visitor.
 * It owns its own form fields (name/role/rating/comment) and does basic
 * client-side validation, but it never talks to the backend directly: it
 * just emits `submitReview` with the collected data and lets the parent
 * decide what to do with it (send the HTTP request, close the modal, etc).
 */
@Component({
  selector: 'app-review-form-modal',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './review-form-modal.component.html',
  styleUrl: './review-form-modal.component.css',
})
export class ReviewFormModalComponent implements OnChanges {
  // Controls whether the modal is rendered at all.
  @Input() isOpen = false;
  // Server-side error forwarded by the parent (e.g. "could not submit review").
  @Input() errorMessage: string | null = null;

  // Emitted once the visitor submits a valid review; the parent performs the API call.
  @Output() submitReview = new EventEmitter<ReviewSubmission>();
  // Emitted when the visitor cancels or dismisses the dialog.
  @Output() closeModal = new EventEmitter<void>();

  protected authorName = '';
  protected authorRole = '';
  protected rating = 5;
  protected comment = '';
  // Client-side validation error, kept separate from the server error above.
  protected localError: string | null = null;

  // Whenever the parent closes the modal (isOpen -> false), clear the form
  // so the next time it opens it starts empty instead of showing stale input.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && !this.isOpen) {
      this.resetForm();
    }
  }

  protected setRating(value: number): void {
    this.rating = value;
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected submit(): void {
    if (!this.authorName.trim()) {
      this.localError = 'Please enter your name.';
      return;
    }
    if (!this.comment.trim()) {
      this.localError = 'Please write a comment for your review.';
      return;
    }
    this.localError = null;
    // Hand the validated data up to the parent; it owns the HTTP request.
    this.submitReview.emit({
      authorName: this.authorName.trim(),
      authorRole: this.authorRole.trim(),
      rating: this.rating,
      comment: this.comment.trim(),
    });
  }

  private resetForm(): void {
    this.authorName = '';
    this.authorRole = '';
    this.rating = 5;
    this.comment = '';
    this.localError = null;
  }
}

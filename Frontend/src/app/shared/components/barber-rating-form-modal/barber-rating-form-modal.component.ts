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

export interface BarberRatingSubmission {
  rating: number;
  comment: string;
}

/**
 * Reusable modal dialog for a customer to rate a barber. Mirrors
 * app-review-form-modal's structure (star picker + comment), minus the
 * author fields since the rater is already known (the logged-in customer).
 * Self-contained: owns form state, validates locally, emits submitRating.
 * Parent handles the HTTP call and modal lifecycle (isOpen control).
 */
@Component({
  selector: 'app-barber-rating-form-modal',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './barber-rating-form-modal.component.html',
  styleUrl: './barber-rating-form-modal.component.css',
})
export class BarberRatingFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() errorMessage: string | null = null;
  @Input() initialRating = 5;
  @Input() initialComment = '';
  @Input() saving = false;

  @Output() submitRating = new EventEmitter<BarberRatingSubmission>();
  @Output() closeModal = new EventEmitter<void>();

  protected rating = 5;
  protected comment = '';
  protected localError: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.rating = this.initialRating || 5;
      this.comment = this.initialComment || '';
      this.localError = null;
    }
  }

  protected setRating(value: number): void {
    this.rating = value;
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected submit(): void {
    if (!this.comment.trim()) {
      this.localError = 'Please write a comment for your rating.';
      return;
    }
    this.localError = null;
    this.submitRating.emit({
      rating: this.rating,
      comment: this.comment.trim(),
    });
  }
}

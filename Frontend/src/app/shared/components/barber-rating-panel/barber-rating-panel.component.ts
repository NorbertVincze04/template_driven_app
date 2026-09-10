import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarberService } from '../../../core/services/barber.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyBarberRatingStatus } from '../../../core/models/barber.model';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { BarberRatingSummaryComponent } from '../barber-rating-summary/barber-rating-summary.component';
import {
  BarberRatingFormModalComponent,
  BarberRatingSubmission,
} from '../barber-rating-form-modal/barber-rating-form-modal.component';

/**
 * Orchestrates a logged-in customer's ability to rate a barber they've had a
 * completed appointment with: shows their existing rating (if any), lets
 * them submit a new one, update it once the 3-month cooldown has passed, or
 * delete it to rate again sooner. Hidden entirely for guests, barbers/admins,
 * and customers who haven't completed an appointment with this barber yet.
 */
@Component({
  selector: 'app-barber-rating-panel',
  standalone: true,
  imports: [
    CommonModule,
    ActionButtonComponent,
    BarberRatingSummaryComponent,
    BarberRatingFormModalComponent,
  ],
  templateUrl: './barber-rating-panel.component.html',
  styleUrl: './barber-rating-panel.component.css',
})
export class BarberRatingPanelComponent implements OnChanges {
  @Input({ required: true }) barberId!: string;

  private readonly barberApi = inject(BarberService);
  protected readonly auth = inject(AuthService);

  protected readonly status = signal<MyBarberRatingStatus | null>(null);
  protected loading = false;
  protected readonly modalOpen = signal(false);
  protected saving = false;
  protected readonly error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['barberId']) {
      this.load();
    }
  }

  private load(): void {
    if (this.auth.currentUserValue?.type !== 'CUSTOMER' || !this.barberId) {
      this.status.set(null);
      return;
    }
    this.loading = true;
    this.barberApi.getMyRating(this.barberId).subscribe({
      next: (status) => {
        this.status.set(status);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  protected openModal(): void {
    this.error.set(null);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected submit(submission: BarberRatingSubmission): void {
    this.saving = true;
    this.barberApi
      .rateBarber(this.barberId, submission.rating, submission.comment)
      .subscribe({
        next: () => {
          this.saving = false;
          this.modalOpen.set(false);
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.error.set(err.error?.message || 'Could not submit your rating.');
        },
      });
  }

  protected deleteRating(): void {
    this.barberApi.deleteMyRating(this.barberId).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.error.set(err.error?.message || 'Could not delete your rating.'),
    });
  }
}

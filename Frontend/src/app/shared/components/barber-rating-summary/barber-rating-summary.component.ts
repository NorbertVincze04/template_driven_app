import { Component, Input } from '@angular/core';

/**
 * Presentational component: renders a read-only star rating plus the
 * number of ratings behind it (or an empty state when nobody has rated
 * yet). Pure display - reusable anywhere a barber's average rating needs
 * to be shown (booking page, barber's own profile, etc).
 */
@Component({
  selector: 'app-barber-rating-summary',
  standalone: true,
  imports: [],
  templateUrl: './barber-rating-summary.component.html',
  styleUrl: './barber-rating-summary.component.css',
})
export class BarberRatingSummaryComponent {
  @Input() rating: number | null | undefined = null;
  @Input() ratingCount: number | undefined = 0;

  protected readonly starIndexes = [1, 2, 3, 4, 5];
}

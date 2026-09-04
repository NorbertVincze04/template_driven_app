import { Component, Input } from '@angular/core';
import { Barber } from '../../../core/models/barber.model';

/**
 * Presentational component: shows a barber's avatar, name and phone number.
 * Pure display — it receives the barber to show via `barber` and has no
 * state or side effects of its own, so it can be reused anywhere a barber
 * needs to be introduced (booking page, previews, etc).
 */
@Component({
  selector: 'app-barber-profile-header',
  standalone: true,
  imports: [],
  templateUrl: './barber-profile-header.component.html',
  styleUrl: './barber-profile-header.component.css',
})
export class BarberProfileHeaderComponent {
  @Input({ required: true }) barber!: Barber;
}

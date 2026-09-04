import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

/**
 * Presentational form fragment: renders the guest name/email/phone fields
 * used when someone books an appointment without an account. It does not
 * own the FormGroup — the parent (AppointmentServiceComponent) creates the
 * `guestDetails` FormGroup and passes it in, so validation state and values
 * stay in sync automatically through Angular's reactive forms.
 */
@Component({
  selector: 'app-guest-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guest-details-form.component.html',
  styleUrl: './guest-details-form.component.css',
})
export class GuestDetailsFormComponent {
  // The `guestDetails` FormGroup owned by the parent's booking form.
  @Input({ required: true }) group!: FormGroup;
  // Whether the parent form has been submitted, used to reveal validation errors early.
  @Input() submitted = false;
}

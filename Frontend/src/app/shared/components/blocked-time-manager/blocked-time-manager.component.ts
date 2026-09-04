import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { BlockedPeriod } from '../../../core/models/barber-schedule.models';

/**
 * Lets a barber block out a time range (e.g. holiday, lunch break) and
 * lists/removes existing blocked periods. Owns its own form and date-range
 * validation; the parent (BarberScheduleComponent) performs the API calls
 * and supplies the current `blockedPeriods` list.
 */
@Component({
  selector: 'app-blocked-time-manager',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ActionButtonComponent],
  templateUrl: './blocked-time-manager.component.html',
  styleUrl: './blocked-time-manager.component.css',
})
export class BlockedTimeManagerComponent {
  @Input() blockedPeriods: BlockedPeriod[] = [];

  // Emitted with a validated {startsAt, endsAt, reason}; the parent calls the API.
  @Output() block = new EventEmitter<{
    startsAt: string;
    endsAt: string;
    reason: string;
  }>();
  // Emitted with the id of the period to remove.
  @Output() unblock = new EventEmitter<string>();

  protected readonly blockForm = new FormGroup({
    startsAt: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    endsAt: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    reason: new FormControl('', { nonNullable: true }),
  });
  // Local, form-level validation error (kept separate from the parent's API error).
  protected validationError = '';

  protected submit(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    const values = this.blockForm.getRawValue();
    if (values.startsAt >= values.endsAt) {
      this.validationError = 'End time must be after start time.';
      return;
    }
    this.validationError = '';
    this.block.emit(values);
    this.blockForm.reset();
  }
}

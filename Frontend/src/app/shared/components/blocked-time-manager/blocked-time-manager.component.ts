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
 * lists/edits/removes existing blocked periods. Owns its own forms and
 * date-range validation; the parent (BarberScheduleComponent) performs the
 * API calls and supplies the current `blockedPeriods` list.
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
  // Emitted with the id + validated new values when a barber saves an edit.
  @Output() editPeriod = new EventEmitter<{
    id: string;
    startsAt: string;
    endsAt: string;
    reason: string;
  }>();

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

  // Id of the period currently being edited inline, or '' if none.
  protected editingId = '';
  protected readonly editForm = new FormGroup({
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
  protected editValidationError = '';

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

  protected startEdit(period: BlockedPeriod): void {
    this.editingId = period.id;
    this.editValidationError = '';
    this.editForm.setValue({
      startsAt: this.toDatetimeLocal(period.startsAt),
      endsAt: this.toDatetimeLocal(period.endsAt),
      reason: period.reason || '',
    });
  }

  protected cancelEdit(): void {
    this.editingId = '';
    this.editValidationError = '';
  }

  protected saveEdit(id: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const values = this.editForm.getRawValue();
    if (values.startsAt >= values.endsAt) {
      this.editValidationError = 'End time must be after start time.';
      return;
    }
    this.editValidationError = '';
    this.editPeriod.emit({ id, ...values });
    this.editingId = '';
  }

  private toDatetimeLocal(value: string): string {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

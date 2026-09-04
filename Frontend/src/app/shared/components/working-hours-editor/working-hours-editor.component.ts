import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { ScheduleDay } from '../../../core/models/barber-schedule.models';

/**
 * Lets a barber toggle each weekday on/off and set its start/end time.
 * It is purely presentational: the parent (BarberScheduleComponent) owns
 * the `days` list and performs the actual save request; this component
 * only reports edits and the "Save" click upward.
 */
@Component({
  selector: 'app-working-hours-editor',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './working-hours-editor.component.html',
  styleUrl: './working-hours-editor.component.css',
})
export class WorkingHoursEditorComponent {
  @Input() days: ScheduleDay[] = [];
  // Shows a "Saved." confirmation after the parent's save request succeeds.
  @Input() saved = false;

  // Emitted on every toggle/time change so the parent can update its `days` signal.
  @Output() dayChange = new EventEmitter<{
    day: ScheduleDay;
    field: keyof ScheduleDay;
    value: string | boolean;
  }>();
  // Emitted when the barber clicks "Save working hours".
  @Output() save = new EventEmitter<void>();

  protected onToggle(day: ScheduleDay, checked: boolean): void {
    this.dayChange.emit({ day, field: 'isActive', value: checked });
  }

  protected onTimeChange(
    day: ScheduleDay,
    field: 'startTime' | 'endTime',
    value: string,
  ): void {
    this.dayChange.emit({ day, field, value });
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BarberAvailability } from '../../../core/models/barber.model';

/**
 * Presentational component: shows the list of available time slots for the
 * currently selected barber/service/date and lets the visitor pick one.
 * It holds no booking logic itself — selecting (or de-selecting) a slot just
 * emits `timeSelected` so the parent can store it on the booking form.
 */
@Component({
  selector: 'app-time-slot-picker',
  standalone: true,
  imports: [],
  templateUrl: './time-slot-picker.component.html',
  styleUrl: './time-slot-picker.component.css',
})
export class TimeSlotPickerComponent {
  // Availability payload for the chosen date; null while it hasn't loaded yet.
  @Input() availability: BarberAvailability | null = null;
  // Currently selected time (empty string = nothing selected).
  @Input() selectedTime = '';

  // Emits the new selection; the parent toggles it off if the same slot is clicked again.
  @Output() timeSelected = new EventEmitter<string>();

  protected selectSlot(slot: string): void {
    this.timeSelected.emit(this.selectedTime === slot ? '' : slot);
  }
}

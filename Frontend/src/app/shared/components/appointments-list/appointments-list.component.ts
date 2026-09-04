import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Appointment } from '../../../core/services/auth.service';
import { ActionButtonComponent } from '../action-button/action-button.component';

/**
 * Displays the signed-in user's appointments as a table and lets barbers
 * change an appointment's status or delete it. It holds no HTTP logic —
 * the parent (UserProfileComponent) owns the data and the API calls; this
 * component only renders `appointments` and reports user actions upward.
 */
@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [DatePipe, ActionButtonComponent],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @Input() appointments: Appointment[] = [];
  // 'BARBER' users get extra columns/controls (customer name, status select, delete).
  @Input() userType: string | undefined;
  // Id of the appointment currently being updated/deleted; disables its row's controls.
  @Input() actionId = '';

  // Emitted when a barber picks a new status from the row's dropdown.
  @Output() statusChange = new EventEmitter<{
    appointment: Appointment;
    status: string;
  }>();
  // Emitted when a barber clicks "Delete" on a row.
  @Output() deleteAppointment = new EventEmitter<Appointment>();
  // Emitted when a barber clicks "Refresh" to reload the list on demand.
  @Output() refresh = new EventEmitter<void>();

  protected onStatusSelect(appointment: Appointment, status: string): void {
    this.statusChange.emit({ appointment, status });
  }
}

import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Appointment } from '../../../core/services/auth.service';
import { BarberService as ServiceOption } from '../../../core/models/barber.model';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export type AppointmentStatusFilter = 'SCHEDULED' | 'COMPLETED' | 'ALL';

/**
 * Displays the signed-in user's appointments as a table with status
 * filtering. Barbers get inline editing (date/time/service), a
 * confirm-before-delete dialog, and approve/reject controls for pending
 * customer requests; customers get "request cancel"/"request reschedule"
 * actions instead. It holds no HTTP logic — the parent (UserProfileComponent)
 * owns the data and the API calls; this component only renders `appointments`
 * and reports user actions upward.
 */
@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ActionButtonComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  // Signal input (not @Input) so `filteredAppointments` reactively recomputes
  // whenever the parent passes a new array reference (e.g. after a delete).
  readonly appointments = input<Appointment[]>([]);
  // 'BARBER' users get extra columns/controls (customer name, edit, delete, approve/reject).
  @Input() userType: string | undefined;
  // Id of the appointment currently being updated/deleted; disables its row's controls.
  @Input() actionId = '';
  // Barber's own services, used to populate the edit form's service dropdown.
  @Input() services: ServiceOption[] = [];

  // Emitted when a barber saves an inline edit (date/time/service).
  @Output() editAppointment = new EventEmitter<{
    id: string;
    date: string;
    time: string;
    serviceId: string;
  }>();
  // Emitted when a barber confirms deletion of a row.
  @Output() deleteAppointment = new EventEmitter<Appointment>();
  // Emitted when a customer confirms a cancellation request.
  @Output() requestCancel = new EventEmitter<Appointment>();
  // Emitted when a customer submits a reschedule request.
  @Output() requestReschedule = new EventEmitter<{
    appointment: Appointment;
    date: string;
    time: string;
  }>();
  // Emitted when a barber approves/rejects a pending customer request.
  @Output() resolveRequest = new EventEmitter<{
    requestId: string;
    action: 'APPROVE' | 'REJECT';
  }>();
  // Emitted when a barber clicks "Refresh" to reload the list on demand.
  @Output() refresh = new EventEmitter<void>();

  // Defaults to only showing what's still upcoming.
  protected readonly statusFilter =
    signal<AppointmentStatusFilter>('SCHEDULED');

  protected readonly filteredAppointments = computed(() => {
    const filter = this.statusFilter();
    const appointments = this.appointments();
    if (filter === 'ALL') return appointments;
    if (filter === 'COMPLETED')
      return appointments.filter((a) => a.status === 'COMPLETED');
    return appointments.filter(
      (a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED',
    );
  });

  // Id of the appointment currently being edited inline, or '' if none.
  protected editingId = '';
  protected readonly editForm = new FormGroup({
    date: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    time: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    serviceId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  // Id of the appointment a customer is currently proposing a new time for.
  protected reschedulingId = '';
  protected readonly rescheduleForm = new FormGroup({
    date: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    time: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  // Appointment pending a confirm dialog, and which action it's for.
  protected readonly confirmTarget = signal<Appointment | null>(null);
  protected confirmMode: 'delete' | 'cancel' = 'delete';

  protected setStatusFilter(filter: AppointmentStatusFilter): void {
    this.statusFilter.set(filter);
  }

  protected startEdit(appointment: Appointment): void {
    this.editingId = appointment.id;
    this.editForm.setValue({
      date: appointment.date.slice(0, 10),
      time: appointment.hour,
      serviceId: appointment.serviceId,
    });
  }

  protected cancelEdit(): void {
    this.editingId = '';
  }

  protected saveEdit(id: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editAppointment.emit({ id, ...this.editForm.getRawValue() });
    this.editingId = '';
  }

  protected startRescheduleRequest(appointment: Appointment): void {
    this.reschedulingId = appointment.id;
    this.rescheduleForm.setValue({
      date: appointment.date.slice(0, 10),
      time: appointment.hour,
    });
  }

  protected cancelRescheduleRequest(): void {
    this.reschedulingId = '';
  }

  protected submitRescheduleRequest(appointment: Appointment): void {
    if (this.rescheduleForm.invalid) {
      this.rescheduleForm.markAllAsTouched();
      return;
    }
    this.requestReschedule.emit({
      appointment,
      ...this.rescheduleForm.getRawValue(),
    });
    this.reschedulingId = '';
  }

  protected requestDelete(appointment: Appointment): void {
    this.confirmMode = 'delete';
    this.confirmTarget.set(appointment);
  }

  protected requestCancelConfirm(appointment: Appointment): void {
    this.confirmMode = 'cancel';
    this.confirmTarget.set(appointment);
  }

  protected confirmAction(): void {
    const target = this.confirmTarget();
    if (!target) return;
    if (this.confirmMode === 'delete') {
      this.deleteAppointment.emit(target);
    } else {
      this.requestCancel.emit(target);
    }
    this.confirmTarget.set(null);
  }

  protected cancelConfirm(): void {
    this.confirmTarget.set(null);
  }

  protected approveRequest(requestId: string): void {
    this.resolveRequest.emit({ requestId, action: 'APPROVE' });
  }

  protected rejectRequest(requestId: string): void {
    this.resolveRequest.emit({ requestId, action: 'REJECT' });
  }

  protected pendingLabel(appointment: Appointment): string {
    const request = appointment.pendingRequest;
    if (!request) return '';
    if (request.type === 'CANCEL') {
      return request.reason
        ? `Cancel requested: ${request.reason}`
        : 'Cancel requested';
    }
    const date = request.requestedDate?.slice(0, 10) || '';
    return `Reschedule requested: ${date} ${request.requestedTime || ''}`;
  }
}

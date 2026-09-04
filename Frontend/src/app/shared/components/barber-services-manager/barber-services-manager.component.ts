import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BarberService as ServiceOption } from '../../../core/models/barber.model';

/**
 * CRUD table for a barber's services: list, add, edit (inline) and delete
 * (behind a confirm dialog). Owns its own forms/validation; the parent
 * (BarberScheduleComponent) performs the actual API calls and passes the
 * up-to-date `services` list back down.
 */
@Component({
  selector: 'app-barber-services-manager',
  standalone: true,
  imports: [ReactiveFormsModule, ActionButtonComponent, ConfirmDialogComponent],
  templateUrl: './barber-services-manager.component.html',
  styleUrl: './barber-services-manager.component.css',
})
export class BarberServicesManagerComponent {
  @Input() services: ServiceOption[] = [];

  // Emitted with the validated form value; the parent creates the service via the API.
  @Output() addService = new EventEmitter<{
    name: string;
    durationMinutes: number;
    price: number;
  }>();
  // Emitted with the id + validated new values when a barber saves an edit.
  @Output() updateService = new EventEmitter<{
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }>();
  // Emitted with the id of the service to delete, once confirmed.
  @Output() deleteService = new EventEmitter<string>();

  protected readonly serviceForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    durationMinutes: new FormControl(30, {
      nonNullable: true,
      validators: Validators.required,
    }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  // Id of the service currently being edited inline, or '' if none.
  protected editingId = '';
  protected readonly editForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    durationMinutes: new FormControl(30, {
      nonNullable: true,
      validators: Validators.required,
    }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  // Service pending delete confirmation, or null if the dialog is closed.
  protected readonly confirmTarget = signal<ServiceOption | null>(null);

  protected submit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }
    this.addService.emit(this.serviceForm.getRawValue());
    // Reset optimistically so the form is ready for the next entry; if the
    // parent's API call fails it surfaces the error separately.
    this.serviceForm.reset({ name: '', durationMinutes: 30, price: 0 });
  }

  protected startEdit(service: ServiceOption): void {
    this.editingId = service.id;
    this.editForm.setValue({
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
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
    this.updateService.emit({ id, ...this.editForm.getRawValue() });
    this.editingId = '';
  }

  protected requestDelete(service: ServiceOption): void {
    this.confirmTarget.set(service);
  }

  protected confirmDelete(): void {
    const target = this.confirmTarget();
    if (!target) return;
    this.deleteService.emit(target.id);
    this.confirmTarget.set(null);
  }

  protected cancelDelete(): void {
    this.confirmTarget.set(null);
  }
}

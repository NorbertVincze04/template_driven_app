import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { BarberService as ServiceOption } from '../../../core/models/barber.model';

/**
 * Lists a barber's services and provides a small form to add a new one.
 * Owns its own "add service" form/validation; the parent
 * (BarberScheduleComponent) performs the actual API call and passes the
 * up-to-date `services` list back down.
 */
@Component({
  selector: 'app-barber-services-manager',
  standalone: true,
  imports: [ReactiveFormsModule, ActionButtonComponent],
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
}

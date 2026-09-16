import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { Appointment } from '../../../core/services/auth.service';

@Component({
  selector: 'app-quick-rebook-modal',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './quick-rebook-modal.component.html',
  styleUrl: './quick-rebook-modal.component.css',
})
export class QuickRebookModalComponent {
  @Input() appointment: Appointment | null = null;
  @Input() isOpen = false;
  @Output() rebook = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  protected close(): void {
    this.dismiss.emit();
  }
}

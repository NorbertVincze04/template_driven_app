import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButtonComponent } from '../action-button/action-button.component';

/**
 * Generic "are you sure?" modal. Purely presentational: the parent decides
 * what to show as the message and what happens on confirm/cancel.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Delete';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

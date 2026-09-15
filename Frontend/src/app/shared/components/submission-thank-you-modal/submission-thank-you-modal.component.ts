import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submission-thank-you-modal',
  standalone: true,
  templateUrl: './submission-thank-you-modal.component.html',
  styleUrl: './submission-thank-you-modal.component.css',
})
export class SubmissionThankYouModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Thank You';
  @Input() message = 'Thank you for taking the time to share this with us.';

  @Output() closeModal = new EventEmitter<void>();

  protected close(): void {
    this.closeModal.emit();
  }
}

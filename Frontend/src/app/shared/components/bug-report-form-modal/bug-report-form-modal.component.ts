import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BugReportSubmission } from '../../../core/models/bug-report.model';
import { ActionButtonComponent } from '../action-button/action-button.component';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-bug-report-form-modal',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './bug-report-form-modal.component.html',
  styleUrl: './bug-report-form-modal.component.css',
})
export class BugReportFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() errorMessage: string | null = null;
  @Input() initialPageUrl: string | null = null;
  @Input() saving = false;

  @Output() submitBugReport = new EventEmitter<BugReportSubmission>();
  @Output() closeModal = new EventEmitter<void>();

  protected reporterName = '';
  protected reporterEmail = '';
  protected pageUrl = '';
  protected description = '';
  protected localError: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.pageUrl = this.initialPageUrl || '';
      this.localError = null;
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.resetForm();
    }
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected submit(): void {
    const email = this.reporterEmail.trim();
    const details = this.description.trim();

    if (email && !EMAIL_PATTERN.test(email)) {
      this.localError = 'Please enter a valid email address.';
      return;
    }
    if (!details) {
      this.localError = 'Please describe the bug you found.';
      return;
    }

    this.localError = null;
    this.submitBugReport.emit({
      reporterName: this.reporterName.trim() || null,
      reporterEmail: email || null,
      pageUrl: this.pageUrl.trim() || null,
      description: details,
    });
  }

  private resetForm(): void {
    this.reporterName = '';
    this.reporterEmail = '';
    this.pageUrl = '';
    this.description = '';
    this.localError = null;
  }
}

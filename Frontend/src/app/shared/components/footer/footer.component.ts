import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantConfig } from '../../../core/models/tenant.model';
import { BugReportSubmission } from '../../../core/models/bug-report.model';
import { BugReportService } from '../../../core/services/bug-report.service';
import { BugReportFormModalComponent } from '../bug-report-form-modal/bug-report-form-modal.component';
import { SubmissionThankYouModalComponent } from '../submission-thank-you-modal/submission-thank-you-modal.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    BugReportFormModalComponent,
    SubmissionThankYouModalComponent,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly tenantService = inject(TenantService);
  private readonly bugReportService = inject(BugReportService);

  protected isBugReportModalOpen = false;
  protected isBugReportThankYouOpen = false;
  protected isSubmittingBugReport = false;
  protected bugReportError: string | null = null;

  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
  );
  protected socialLink(label: string): string | undefined {
    return this.tenantConfig()?.contactDetails?.socialMediaLinks?.find(
      (link) => link.label.toLowerCase() === label.toLowerCase(),
    )?.url;
  }

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
    };
  });

  protected openBugReportModal(): void {
    this.bugReportError = null;
    this.isBugReportModalOpen = true;
  }

  protected closeBugReportModal(): void {
    this.isBugReportModalOpen = false;
  }

  protected closeBugReportThankYou(): void {
    this.isBugReportThankYouOpen = false;
  }

  protected currentPageUrl(): string | null {
    return typeof window === 'undefined' ? null : window.location.href;
  }

  protected submitBugReport(report: BugReportSubmission): void {
    this.isSubmittingBugReport = true;
    this.bugReportError = null;
    this.bugReportService.submit(report).subscribe({
      next: () => {
        this.isSubmittingBugReport = false;
        this.isBugReportModalOpen = false;
        this.isBugReportThankYouOpen = true;
      },
      error: (error) => {
        this.isSubmittingBugReport = false;
        this.bugReportError =
          error.error?.message || 'Could not send your bug report.';
      },
    });
  }
}

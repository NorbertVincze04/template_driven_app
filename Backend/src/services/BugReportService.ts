export interface BugReportMailPayload {
  shopId: string;
  tenantSlug: string;
  tenantName: string;
  reporterName: string | null;
  reporterEmail: string | null;
  pageUrl: string | null;
  description: string;
  userAgent: string | null;
  submittedAt: string;
}

export class BugReportService {
  static async send(report: BugReportMailPayload): Promise<void> {
    console.info(
      "Bug report received. Configure mail delivery here to forward it.",
      report,
    );
  }
}

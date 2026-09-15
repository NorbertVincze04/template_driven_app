import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BugReportSubmission } from '../models/bug-report.model';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class BugReportService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly baseUrl = `${environment.apiUrl}/public/bug-reports`;

  submit(report: BugReportSubmission): Observable<void> {
    return this.http
      .post<{ success: boolean; message: string }>(this.baseUrl, report, {
        headers: {
          'X-Tenant-Slug': this.tenantService.config()?.tenantId || 'default',
        },
      })
      .pipe(map(() => undefined));
  }
}

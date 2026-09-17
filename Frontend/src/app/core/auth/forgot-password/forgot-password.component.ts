import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ActionButtonComponent,
  ActionConfig,
} from '../../../shared/components/action-button/action-button.component';
import { AuthService } from '../../services/auth.service';
import { TenantService } from '../../services/tenant.service';

function passwordsMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

/**
 * Three-step "forgot password" flow, reachable from the sign-in page's
 * "Forgot password?" link: request a code by email, verify that code, then
 * set a new password (with confirmation). Mirrors app-sign-in's visual style.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ActionButtonComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  protected readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly step = signal<'request' | 'verify' | 'reset' | 'success'>(
    'request',
  );
  protected requestError = '';
  protected requestLoading = false;
  protected verifyError = '';
  protected verifyLoading = false;
  protected resetError = '';
  protected resetLoading = false;

  // Set once the code is verified; required by the final reset request instead of the raw code.
  private resetToken = '';

  requestForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  verifyForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/),
    ]),
  });

  resetForm = new FormGroup(
    {
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatchValidator },
  );

  protected readonly requestActionConfig: ActionConfig = {
    label: 'Send reset code',
    loadingLabel: 'Sending...',
    variant: 'primary',
  };

  protected readonly verifyActionConfig: ActionConfig = {
    label: 'Verify code',
    loadingLabel: 'Verifying...',
    variant: 'primary',
  };

  protected readonly resetActionConfig: ActionConfig = {
    label: 'Reset password',
    loadingLabel: 'Resetting...',
    variant: 'primary',
  };

  get requestButtonConfig(): ActionConfig {
    return {
      ...this.requestActionConfig,
      disabled: this.requestForm.invalid || this.requestLoading,
    };
  }

  get verifyButtonConfig(): ActionConfig {
    return {
      ...this.verifyActionConfig,
      disabled: this.verifyForm.invalid || this.verifyLoading,
    };
  }

  get resetButtonConfig(): ActionConfig {
    return {
      ...this.resetActionConfig,
      disabled: this.resetForm.invalid || this.resetLoading,
    };
  }

  onRequestCode(): void {
    if (this.requestLoading || this.requestForm.invalid) return;
    this.requestLoading = true;
    this.requestError = '';
    const email = this.requestForm.controls.email.value || '';

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.requestLoading = false;
        this.step.set('verify');
      },
      error: (error) => {
        this.requestLoading = false;
        this.requestError = error.message;
      },
    });
  }

  onVerifyCode(): void {
    if (this.verifyLoading || this.verifyForm.invalid) return;
    this.verifyLoading = true;
    this.verifyError = '';
    const email = this.requestForm.controls.email.value || '';
    const code = this.verifyForm.controls.code.value || '';

    this.authService.verifyResetCode(email, code).subscribe({
      next: (resetToken) => {
        this.verifyLoading = false;
        this.resetToken = resetToken;
        this.step.set('reset');
      },
      error: (error) => {
        this.verifyLoading = false;
        this.verifyError = error.message;
      },
    });
  }

  onResetPassword(): void {
    if (this.resetLoading || this.resetForm.invalid) return;
    this.resetLoading = true;
    this.resetError = '';
    const email = this.requestForm.controls.email.value || '';
    const { newPassword } = this.resetForm.getRawValue();

    this.authService
      .resetPassword(email, this.resetToken, newPassword!)
      .subscribe({
        next: () => {
          this.resetLoading = false;
          this.step.set('success');
        },
        error: (error) => {
          this.resetLoading = false;
          this.resetError = error.message;
        },
      });
  }

  onBackToRequest(): void {
    this.step.set('request');
    this.verifyError = '';
    this.resetError = '';
  }

  onGoToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', serif`
        : 'inherit',
    };
  });
}

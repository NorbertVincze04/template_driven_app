import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ActionButtonComponent,
  ActionConfig,
} from '../../../shared/components/action-button/action-button.component';
import { AuthService } from '../../services/auth.service';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TenantService } from '../../services/tenant.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ActionButtonComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  protected readonly tenantService = inject(TenantService);

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  loginError = '';
  signInLoading = false;

  passwordVisible = false;

  signInButtonConfig: ActionConfig = {
    label: 'Sign In',
    loadingLabel: 'Signing in...',
    variant: 'primary',
    disabled: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSignIn() {
    if (this.signInLoading) {
      return;
    }

    if (!this.signInForm.valid) {
      return;
    }

    this.signInLoading = true;

    const emailValue = this.signInForm.get('email')?.value || '';
    const passwordValue = this.signInForm.get('password')?.value || '';

    this.authService.login(emailValue, passwordValue).subscribe({
      next: (result) => {
        this.signInLoading = false;
        this.loginError = '';
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.signInLoading = false;
        this.loginError = error.message;
      },
    });
  }

  get signInActionConfig(): ActionConfig {
    return {
      ...this.signInButtonConfig,
      disabled: this.signInForm.invalid || this.signInLoading,
    };
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  onForgotPassword() {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
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

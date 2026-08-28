import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  computed,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TenantService } from '../../../core/services/tenant.service';

export interface ActionConfig {
  label?: string;
  icon?: string;
  loadingLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  private readonly tenantService = inject(TenantService);

  @Input() config: ActionConfig = { label: 'Action' };
  @Input() isLoading: boolean = false;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon: TemplateRef<any> | null = null;
  @Input() variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'outline'
    | 'link';
  @Input() size?: 'sm' | 'md' | 'lg';
  @Input() fullWidth?: boolean;
  @Input() disabled?: boolean;
  @Input() ariaLabel?: string;
  @Input() customClass: string = '';
  @Output() action = new EventEmitter<void>();

  get effectiveVariant(): string {
    return this.variant || this.config.variant || 'primary';
  }

  get effectiveSize(): string {
    return this.size || this.config.size || 'md';
  }

  get isFullWidth(): boolean {
    return this.fullWidth ?? this.config.fullWidth ?? false;
  }

  get isDisabled(): boolean {
    return (this.disabled ?? this.config.disabled ?? false) || this.isLoading;
  }

  get effectiveAriaLabel(): string | undefined {
    return this.ariaLabel || this.config.ariaLabel || undefined;
  }

  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    const primary = config?.primaryColor || '#111827';
    const secondary = config?.secondaryColor || '#374151';
    return {
      '--tenant-primary': primary,
      '--tenant-secondary': secondary,
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
    };
  });

  get displayLabel(): string {
    return (
      (this.isLoading
        ? this.config.loadingLabel || this.config.label
        : this.config.label) || ''
    );
  }

  onAction() {
    if (!this.isDisabled) {
      this.action.emit();
    }
  }
}

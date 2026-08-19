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
  label: string;
  icon?: string;
  loadingLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
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
  @Output() action = new EventEmitter<void>();

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

  get displayLabel(): string {
    return this.isLoading ? this.config.loadingLabel || '' : this.config.label;
  }

  onAction() {
    if (!this.config.disabled && !this.isLoading) {
      this.action.emit();
    }
  }
}

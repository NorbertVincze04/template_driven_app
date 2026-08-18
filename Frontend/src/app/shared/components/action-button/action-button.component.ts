import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

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
  imports: [CommonModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  @Input() config: ActionConfig = { label: 'Action' };
  @Input() isLoading: boolean = false;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon: TemplateRef<any> | null = null;
  @Output() action = new EventEmitter<void>();

  get displayLabel(): string {
    return this.isLoading ? this.config.loadingLabel || '' : this.config.label;
  }

  onAction() {
    if (!this.config.disabled && !this.isLoading) {
      this.action.emit();
    }
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantConfig } from '../../core/models/tenant.model';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.css',
})
export class HelpCenterComponent {
  private readonly tenantService = inject(TenantService);
  private readonly searchTerm = signal('');

  protected readonly faqs = [
    {
      number: '01',
      question: 'How do I book an appointment?',
      answer:
        'Choose a service and contact our salon team to find a time that works for you.',
    },
    {
      number: '02',
      question: 'Can I change or cancel my booking?',
      answer:
        'Contact the salon as early as possible so we can update your appointment.',
    },
    {
      number: '03',
      question: 'What should I bring to my visit?',
      answer:
        'Bring inspiration photos and let your stylist know about your hair history.',
    },
    {
      number: '04',
      question: 'Which payment methods do you accept?',
      answer:
        'Our team can confirm the latest payment options when you schedule your visit.',
    },
  ];
  protected readonly filteredFaqs = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();

    if (!searchTerm) {
      return this.faqs;
    }

    return this.faqs.filter((faq) =>
      `${faq.question} ${faq.answer}`.toLowerCase().includes(searchTerm),
    );
  });

  protected readonly tenantConfig = computed((): TenantConfig | null =>
    this.tenantService.config(),
  );
  protected readonly tenantStyles = computed((): Record<string, string> => {
    const config = this.tenantService.config();
    return {
      '--tenant-primary': config?.primaryColor || '#111827',
      '--tenant-secondary': config?.secondaryColor || '#374151',
      '--tenant-font': config?.fontFamily
        ? `'${config.fontFamily}', sans-serif`
        : 'inherit',
      '--tenant-font-secondary': config?.fontFamilySecondary
        ? `'${config.fontFamilySecondary}', Georgia, serif`
        : 'Georgia, serif',
    };
  });

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SocialLinkModel {
  label: string;
  url: string;
}

export interface OperatingHourModel {
  days: string;
  hours: string;
  timezone: string;
}

export interface ContactEditorModel {
  sectionLabel: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  mapEmbedUrl: string;
  ctaText: string;
  ctaLink: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  socialLinks: SocialLinkModel[];
  operatingHours: OperatingHourModel[];
}

/** Admin editor for the "Contact" section. Mutates `model` in place. */
@Component({
  selector: 'app-contact-details-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-details-editor.component.html',
  styleUrl: './contact-details-editor.component.css',
})
export class ContactDetailsEditorComponent {
  @Input() model!: ContactEditorModel;

  protected addSocialLink(): void {
    this.model.socialLinks.push({ label: '', url: '' });
  }

  protected removeSocialLink(index: number): void {
    this.model.socialLinks.splice(index, 1);
  }

  protected addOperatingHour(): void {
    this.model.operatingHours.push({ days: '', hours: '', timezone: '' });
  }

  protected removeOperatingHour(index: number): void {
    this.model.operatingHours.splice(index, 1);
  }
}

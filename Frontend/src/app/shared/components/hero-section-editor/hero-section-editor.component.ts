import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface HeroEditorModel {
  badgeText: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string;
  backgroundImageAlt: string;
}

/** Admin editor for the home page hero section. Mutates `model` in place. */
@Component({
  selector: 'app-hero-section-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './hero-section-editor.component.html',
  styleUrl: './hero-section-editor.component.css',
})
export class HeroSectionEditorComponent {
  @Input() model!: HeroEditorModel;
}

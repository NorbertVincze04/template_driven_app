import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AboutUsEditorModel {
  sectionLabel: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlightsText: string;
}

/** Admin editor for the "About Us" section. Mutates `model` in place. */
@Component({
  selector: 'app-about-us-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './about-us-editor.component.html',
  styleUrl: './about-us-editor.component.css',
})
export class AboutUsEditorComponent {
  @Input() model!: AboutUsEditorModel;
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButtonComponent } from '../action-button/action-button.component';

/**
 * Self-contained profile picture editor: lets the user choose an image file,
 * automatically resizes it (via a canvas) to keep uploads small, and exposes
 * horizontal/vertical position sliders so the photo can be cropped nicely
 * inside a circular avatar. It never talks to the backend — it just reports
 * the processed image data and position back to the parent through outputs,
 * so the parent can save them together with the rest of the profile form.
 */
@Component({
  selector: 'app-profile-image-editor',
  standalone: true,
  imports: [ActionButtonComponent],
  templateUrl: './profile-image-editor.component.html',
  styleUrl: './profile-image-editor.component.css',
})
export class ProfileImageEditorComponent {
  // Current image as a data URL (or null when no picture is set).
  @Input() imageData: string | null = null;
  // Crop position as a percentage (0-100), used for `object-position`.
  @Input() positionX = 50;
  @Input() positionY = 50;

  // Emitted whenever the image changes: a new upload (string) or removal (null).
  @Output() imageDataChange = new EventEmitter<string | null>();
  @Output() positionXChange = new EventEmitter<number>();
  @Output() positionYChange = new EventEmitter<number>();
  // Emitted when the selected file is invalid (wrong type/too large) or fails to load.
  @Output() errorMessage = new EventEmitter<string>();

  // Reads the chosen file, downsizes it client-side and emits it as a data URL.
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/') || file.size > 2_000_000) {
      this.errorMessage.emit('Choose an image smaller than 2 MB.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        // Cap the largest dimension so the stored image stays lightweight.
        const maxDimension = 1000;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas
          .getContext('2d')
          ?.drawImage(image, 0, 0, canvas.width, canvas.height);
        this.imageDataChange.emit(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.onerror = () => {
        this.errorMessage.emit('The selected image could not be processed.');
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  protected onPositionXInput(event: Event): void {
    this.positionXChange.emit(Number((event.target as HTMLInputElement).value));
  }

  protected onPositionYInput(event: Event): void {
    this.positionYChange.emit(Number((event.target as HTMLInputElement).value));
  }

  protected deleteImage(): void {
    this.imageDataChange.emit(null);
  }
}

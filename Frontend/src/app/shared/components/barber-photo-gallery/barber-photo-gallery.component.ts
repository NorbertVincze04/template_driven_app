import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarberGalleryPhoto } from '../../../core/models/barber.model';
import { ActionButtonComponent } from '../action-button/action-button.component';

export interface GalleryPhotoSubmission {
  imageData: string;
  caption: string | null;
  imagePositionX: number;
  imagePositionY: number;
}

@Component({
  selector: 'app-barber-photo-gallery',
  standalone: true,
  imports: [FormsModule, ActionButtonComponent],
  templateUrl: './barber-photo-gallery.component.html',
  styleUrl: './barber-photo-gallery.component.css',
})
export class BarberPhotoGalleryComponent {
  @Input() photos: BarberGalleryPhoto[] = [];
  @Input() editable = false;
  @Input() uploading = false;
  @Input() deletingId = '';
  @Input() emptyMessage = 'No gallery photos yet.';

  @Output() uploadPhoto = new EventEmitter<GalleryPhotoSubmission>();
  @Output() deletePhoto = new EventEmitter<string>();
  @Output() errorMessage = new EventEmitter<string>();

  protected caption = '';
  protected pendingImageData: string | null = null;
  protected imagePositionX = 50;
  protected imagePositionY = 50;
  protected selectedPhoto: BarberGalleryPhoto | null = null;
  protected selectedPhotoIndex = -1;

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
        const maxDimension = 1200;
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
        this.pendingImageData = canvas.toDataURL('image/jpeg', 0.84);
        this.imagePositionX = 50;
        this.imagePositionY = 50;
      };
      image.onerror = () => {
        this.errorMessage.emit('The selected image could not be processed.');
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  protected submit(): void {
    if (!this.pendingImageData || this.uploading) {
      this.errorMessage.emit('Choose a photo before uploading.');
      return;
    }
    this.uploadPhoto.emit({
      imageData: this.pendingImageData,
      caption: this.caption.trim() || null,
      imagePositionX: this.imagePositionX,
      imagePositionY: this.imagePositionY,
    });
  }

  protected resetDraft(): void {
    this.caption = '';
    this.pendingImageData = null;
    this.imagePositionX = 50;
    this.imagePositionY = 50;
  }

  protected onPositionXInput(event: Event): void {
    this.imagePositionX = Number((event.target as HTMLInputElement).value);
  }

  protected onPositionYInput(event: Event): void {
    this.imagePositionY = Number((event.target as HTMLInputElement).value);
  }

  protected openPhoto(index: number): void {
    const photo = this.photos[index];
    if (!photo) return;
    this.selectedPhoto = photo;
    this.selectedPhotoIndex = index;
  }

  protected closePhoto(): void {
    this.selectedPhoto = null;
    this.selectedPhotoIndex = -1;
  }

  protected showPreviousPhoto(): void {
    if (!this.photos.length) return;
    const index =
      this.selectedPhotoIndex <= 0
        ? this.photos.length - 1
        : this.selectedPhotoIndex - 1;
    this.openPhoto(index);
  }

  protected showNextPhoto(): void {
    if (!this.photos.length) return;
    const index =
      this.selectedPhotoIndex >= this.photos.length - 1
        ? 0
        : this.selectedPhotoIndex + 1;
    this.openPhoto(index);
  }
}

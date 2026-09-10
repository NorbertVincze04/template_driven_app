import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.css',
})
export class NotificationMenuComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly notifications = this.notificationService.notifications;
  protected readonly unreadCount = this.notificationService.unreadCount;
  protected isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notificationService.refresh();
    }
  }

  onNotificationClick(notification: AppNotification): void {
    this.isOpen = false;
    this.notificationService.markAsRead(notification.id);
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  onNotificationKeydown(
    event: KeyboardEvent,
    notification: AppNotification,
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onNotificationClick(notification);
    }
  }

  deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.delete(id);
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  timeAgo(dateString: string): string {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event): void {
    if (!(event.target as HTMLElement).closest('.notifications-menu')) {
      this.isOpen = false;
    }
  }
}

export type NotificationType =
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_STATUS_CHANGED"
  | "APPOINTMENT_CHANGE_REQUESTED"
  | "APPOINTMENT_CHANGE_RESOLVED"
  | "REVIEW_RECEIVED"
  | "RATING_REMINDER";

// structure of a notification record returned to the client.
export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

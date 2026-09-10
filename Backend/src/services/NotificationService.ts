import { NotificationRepository } from "../repositories/NotificationRepository.ts";
import type { NotificationType } from "../types/notification.types.ts";

// Notifications should never break the action that triggered them.
async function safeCreate(
  shopId: string,
  recipientId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string | null = null,
): Promise<void> {
  try {
    await NotificationRepository.create(
      shopId,
      recipientId,
      type,
      title,
      message,
      link,
    );
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

const STATUS_VERBS: Record<string, string> = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "marked as completed",
  SCHEDULED: "updated",
  RESCHEDULED: "rescheduled",
};

export class NotificationService {
  static async notifyAppointmentBooked(
    shopId: string,
    barberId: string,
    details: {
      customerName: string;
      serviceName: string;
      date: string;
      time: string;
    },
  ): Promise<void> {
    await safeCreate(
      shopId,
      barberId,
      "APPOINTMENT_BOOKED",
      "New appointment booked",
      `${details.customerName} booked ${details.serviceName}.`,
      "/user-profile",
    );
  }

  static async notifyAppointmentStatusChanged(
    shopId: string,
    customerId: string,
    details: {
      status: string;
      serviceName: string;
      date: string;
      time: string;
    },
  ): Promise<void> {
    const verb = STATUS_VERBS[details.status] ?? "updated";
    await safeCreate(
      shopId,
      customerId,
      "APPOINTMENT_STATUS_CHANGED",
      `Appointment ${verb}`,
      `Your ${details.serviceName} appointment was ${verb}.`,
      "/user-profile",
    );
  }

  static async notifyChangeRequested(
    shopId: string,
    barberId: string,
    details: {
      requesterName: string;
      type: "CANCEL" | "RESCHEDULE";
      serviceName: string;
      date: string;
      time: string;
    },
  ): Promise<void> {
    const action = details.type === "CANCEL" ? "cancel" : "reschedule";
    await safeCreate(
      shopId,
      barberId,
      "APPOINTMENT_CHANGE_REQUESTED",
      "New change request",
      `${details.requesterName} wants to ${action} their ${details.serviceName} appointment.`,
      "/user-profile",
    );
  }

  static async notifyChangeResolved(
    shopId: string,
    customerId: string,
    details: { approved: boolean; type: "CANCEL" | "RESCHEDULE" },
  ): Promise<void> {
    const outcome = details.approved ? "approved" : "declined";
    const action = details.type === "CANCEL" ? "cancellation" : "reschedule";
    await safeCreate(
      shopId,
      customerId,
      "APPOINTMENT_CHANGE_RESOLVED",
      `Request ${outcome}`,
      `Your ${action} request was ${outcome}.`,
      "/user-profile",
    );
  }

  static async notifyReviewReceived(
    shopId: string,
    details: { authorName: string; rating: number },
  ): Promise<void> {
    const staffIds = await NotificationRepository.findStaffRecipientIds(shopId);
    await Promise.all(
      staffIds.map((recipientId) =>
        safeCreate(
          shopId,
          recipientId,
          "REVIEW_RECEIVED",
          "New review received",
          `${details.authorName} left you a ${details.rating}-star review.`,
          "/user-profile",
        ),
      ),
    );
  }
}

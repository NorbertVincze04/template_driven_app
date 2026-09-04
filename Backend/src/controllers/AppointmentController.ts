import type { Request, Response } from "express";
import {
  AppointmentRepository,
  type AppointmentRecord,
} from "../repositories/AppointmentRepository.ts";
import { AppointmentRequestRepository } from "../repositories/AppointmentRequestRepository.ts";

function toPayload(appointment: AppointmentRecord) {
  return {
    id: appointment.id,
    date: appointment.appointment_date,
    hour: appointment.appointment_time.slice(0, 5),
    status: appointment.status,
    serviceId: appointment.service_id,
    serviceName: appointment.service_name,
    customerName: appointment.customer_name,
    guestName: appointment.guest_name,
    guestEmail: appointment.guest_email,
    guestPhone: appointment.guest_phone,
    pendingRequest: appointment.request_id
      ? {
          id: appointment.request_id,
          type: appointment.request_type,
          requestedDate: appointment.request_date,
          requestedTime: appointment.request_time?.slice(0, 5) ?? null,
          reason: appointment.request_reason,
        }
      : null,
  };
}

export class AppointmentController {
  static async listMine(req: Request, res: Response): Promise<Response> {
    const appointments =
      req.user!.role === "BARBER"
        ? await AppointmentRepository.findForBarber(req.user!.id, req.shop!.id)
        : await AppointmentRepository.findForCustomer(
            req.user!.id,
            req.shop!.id,
          );
    return res.json({
      success: true,
      payload: appointments.map(toPayload),
    });
  }

  static async updateMine(req: Request, res: Response): Promise<Response> {
    if (req.user!.role !== "BARBER") {
      return res.status(403).json({
        success: false,
        message: "Only barbers can manage appointments.",
      });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "An appointment is required." });
    }
    const { status, date, time, serviceId } = req.body;
    let appointment: AppointmentRecord | null;
    if (status !== undefined) {
      if (
        !["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid appointment status is required.",
        });
      }
      appointment = await AppointmentRepository.updateForBarber(
        req.params.id,
        req.user!.id,
        req.shop!.id,
        status,
      );
    } else if (date && time && serviceId) {
      try {
        appointment = await AppointmentRepository.updateDetailsForBarber(
          req.params.id,
          req.user!.id,
          req.shop!.id,
          { date, time, serviceId },
        );
      } catch (error) {
        return res.status(409).json({
          success: false,
          message: (error as Error).message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide a status, or a date, time and service to update.",
      });
    }
    return appointment
      ? res.json({ success: true, payload: toPayload(appointment) })
      : res
          .status(404)
          .json({ success: false, message: "Appointment not found." });
  }

  static async deleteMine(req: Request, res: Response): Promise<Response> {
    if (req.user!.role !== "BARBER") {
      return res.status(403).json({
        success: false,
        message: "Only barbers can manage appointments.",
      });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "An appointment is required." });
    }
    const deleted = await AppointmentRepository.deleteForBarber(
      req.params.id,
      req.user!.id,
      req.shop!.id,
    );
    return deleted
      ? res.status(204).send()
      : res
          .status(404)
          .json({ success: false, message: "Appointment not found." });
  }

  static async requestCancel(req: Request, res: Response): Promise<Response> {
    if (req.user!.role === "BARBER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can request a cancellation.",
      });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "An appointment is required." });
    }
    try {
      const request = await AppointmentRequestRepository.createCancelRequest(
        req.shop!.id,
        req.user!.id,
        req.params.id,
        req.body.reason,
      );
      return res.status(201).json({ success: true, payload: request });
    } catch (error) {
      return res
        .status(409)
        .json({ success: false, message: (error as Error).message });
    }
  }

  static async requestReschedule(
    req: Request,
    res: Response,
  ): Promise<Response> {
    if (req.user!.role === "BARBER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can request a reschedule.",
      });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "An appointment is required." });
    }
    const { date, time, reason } = req.body;
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "A new date and time are required.",
      });
    }
    try {
      const request =
        await AppointmentRequestRepository.createRescheduleRequest(
          req.shop!.id,
          req.user!.id,
          req.params.id,
          date,
          time,
          reason,
        );
      return res.status(201).json({ success: true, payload: request });
    } catch (error) {
      return res
        .status(409)
        .json({ success: false, message: (error as Error).message });
    }
  }

  static async resolveRequest(req: Request, res: Response): Promise<Response> {
    if (req.user!.role !== "BARBER") {
      return res.status(403).json({
        success: false,
        message: "Only barbers can resolve change requests.",
      });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A request is required." });
    }
    const approve = req.body.action === "APPROVE";
    if (!approve && req.body.action !== "REJECT") {
      return res.status(400).json({
        success: false,
        message: "action must be APPROVE or REJECT.",
      });
    }
    try {
      const resolved = await AppointmentRequestRepository.resolve(
        req.shop!.id,
        req.user!.id,
        req.params.id,
        approve,
      );
      return resolved
        ? res.json({ success: true, payload: { status: resolved } })
        : res
            .status(404)
            .json({ success: false, message: "Request not found." });
    } catch (error) {
      return res
        .status(409)
        .json({ success: false, message: (error as Error).message });
    }
  }
}

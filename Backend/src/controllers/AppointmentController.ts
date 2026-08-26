import type { Request, Response } from "express";
import { AppointmentRepository } from "../repositories/AppointmentRepository.ts";

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
      payload: appointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.appointment_date,
        hour: appointment.appointment_time.slice(0, 5),
        status: appointment.status,
        serviceName: appointment.service_name,
        customerName: appointment.customer_name,
        guestName: appointment.guest_name,
        guestEmail: appointment.guest_email,
        guestPhone: appointment.guest_phone,
      })),
    });
  }

  static async updateMine(req: Request, res: Response): Promise<Response> {
    if (req.user!.role !== "BARBER") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can manage appointments.",
        });
    }
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "An appointment is required." });
    }
    const { status } = req.body;
    if (
      !["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A valid appointment status is required.",
        });
    }
    const appointment = await AppointmentRepository.updateForBarber(
      req.params.id,
      req.user!.id,
      req.shop!.id,
      status,
    );
    return appointment
      ? res.json({ success: true, payload: appointment })
      : res
          .status(404)
          .json({ success: false, message: "Appointment not found." });
  }

  static async deleteMine(req: Request, res: Response): Promise<Response> {
    if (req.user!.role !== "BARBER") {
      return res
        .status(403)
        .json({
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
}

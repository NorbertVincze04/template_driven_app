import type { Request, Response } from "express";
import { AppointmentRepository } from "../repositories/AppointmentRepository.ts";

export class AppointmentController {
  static async listMine(req: Request, res: Response): Promise<Response> {
    const appointments = await AppointmentRepository.findForCustomer(
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
      })),
    });
  }
}

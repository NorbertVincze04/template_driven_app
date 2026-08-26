import type { Request, Response } from "express";
import { BarberRepository } from "../repositories/BarberRepository.ts";

export class PublicController {
  static async listBarbers(req: Request, res: Response) {
    return res.json({
      success: true,
      payload: await BarberRepository.list(req.shop!.id),
    });
  }

  static async getBarber(req: Request, res: Response) {
    const barberId = req.params.barberId;
    if (typeof barberId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A barber is required." });
    }
    const barber = await BarberRepository.find(req.shop!.id, barberId);
    return barber
      ? res.json({ success: true, payload: barber })
      : res.status(404).json({ success: false, message: "Barber not found." });
  }

  static async listServices(req: Request, res: Response) {
    const barberId =
      typeof req.query.barberId === "string" ? req.query.barberId : undefined;
    return res.json({
      success: true,
      payload: await BarberRepository.listServices(req.shop!.id, barberId),
    });
  }

  static async listMyServices(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can view their services.",
        });
    return res.json({
      success: true,
      payload: await BarberRepository.listServices(req.shop!.id, req.user!.id),
    });
  }

  static async availability(req: Request, res: Response) {
    const { barberId, serviceId, date } = req.query;
    if (
      typeof barberId !== "string" ||
      typeof serviceId !== "string" ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "barberId, serviceId and date are required.",
        });
    }
    const result = await BarberRepository.availability(
      req.shop!.id,
      barberId,
      serviceId,
      date,
    );
    return result
      ? res.json({ success: true, payload: result })
      : res
          .status(404)
          .json({ success: false, message: "Barber or service not found." });
  }

  static async createGuestAppointment(req: Request, res: Response) {
    const {
      barberId,
      serviceId,
      date,
      time,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;
    if (
      !barberId ||
      !serviceId ||
      !date ||
      !time ||
      !guestName ||
      !guestEmail ||
      !guestPhone
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All booking details are required." });
    }
    const appointment = await BarberRepository.createAppointment({
      shopId: req.shop!.id,
      barberId,
      serviceId,
      date,
      time,
      guestName,
      guestEmail,
      guestPhone,
    });
    return res.status(201).json({ success: true, payload: appointment });
  }

  static async createAccountAppointment(req: Request, res: Response) {
    const { barberId, serviceId, date, time } = req.body;
    if (!barberId || !serviceId || !date || !time) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Barber, service, date and time are required.",
        });
    }
    const appointment = await BarberRepository.createAppointment({
      shopId: req.shop!.id,
      barberId,
      serviceId,
      date,
      time,
      customerId: req.user!.id,
    });
    return res.status(201).json({ success: true, payload: appointment });
  }

  static async getSchedule(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can manage schedules.",
        });
    const barberId = req.user!.id;
    return res.json({
      success: true,
      payload: {
        hours: await BarberRepository.getWorkingHours(req.shop!.id, barberId),
        blockedPeriods: await BarberRepository.listBlockedPeriods(
          req.shop!.id,
          barberId,
        ),
      },
    });
  }

  static async saveSchedule(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can manage schedules.",
        });
    const barberId = req.user!.id;
    await BarberRepository.saveWorkingHours(
      req.shop!.id,
      barberId,
      req.body.hours ?? [],
    );
    return res.json({ success: true });
  }

  static async blockTime(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can manage schedules.",
        });
    const barberId = req.user!.id;
    const { startsAt, endsAt, reason } = req.body;
    if (!startsAt || !endsAt)
      return res
        .status(400)
        .json({ success: false, message: "Start and end are required." });
    return res
      .status(201)
      .json({
        success: true,
        payload: await BarberRepository.addBlockedPeriod(
          req.shop!.id,
          barberId,
          startsAt,
          endsAt,
          reason,
        ),
      });
  }

  static async unblockTime(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only barbers can manage schedules.",
        });
    const blockedId = req.params.id;
    if (typeof blockedId !== "string")
      return res
        .status(400)
        .json({ success: false, message: "A blocked period is required." });
    await BarberRepository.deleteBlockedPeriod(
      req.shop!.id,
      req.user!.id,
      blockedId,
    );
    return res.status(204).send();
  }

  static async createService(req: Request, res: Response) {
    if (req.user!.role !== "BARBER")
      return res
        .status(403)
        .json({ success: false, message: "Only barbers can create services." });
    const { name, durationMinutes, price } = req.body;
    if (
      !name ||
      !Number.isInteger(Number(durationMinutes)) ||
      Number(durationMinutes) <= 0 ||
      Number(price) < 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, duration and a valid price are required.",
        });
    }
    const service = await BarberRepository.createService(
      req.shop!.id,
      req.user!.id,
      name,
      Number(durationMinutes),
      Number(price),
    );
    return res.status(201).json({ success: true, payload: service });
  }
}

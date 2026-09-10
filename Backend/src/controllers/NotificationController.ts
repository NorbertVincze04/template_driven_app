import type { Request, Response } from "express";
import { NotificationRepository } from "../repositories/NotificationRepository.ts";

export class NotificationController {
  static async list(req: Request, res: Response): Promise<Response> {
    const notifications = await NotificationRepository.listForUser(
      req.shop!.id,
      req.user!.id,
    );
    return res.json({ success: true, payload: notifications });
  }

  static async markRead(req: Request, res: Response): Promise<Response> {
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A notification is required." });
    }
    const updated = await NotificationRepository.markRead(
      req.shop!.id,
      req.user!.id,
      req.params.id,
    );
    return updated
      ? res.json({ success: true })
      : res
          .status(404)
          .json({ success: false, message: "Notification not found." });
  }

  static async markAllRead(req: Request, res: Response): Promise<Response> {
    await NotificationRepository.markAllRead(req.shop!.id, req.user!.id);
    return res.json({ success: true });
  }

  static async delete(req: Request, res: Response): Promise<Response> {
    if (typeof req.params.id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A notification is required." });
    }
    const deleted = await NotificationRepository.deleteForUser(
      req.shop!.id,
      req.user!.id,
      req.params.id,
    );
    return deleted
      ? res.status(204).send()
      : res
          .status(404)
          .json({ success: false, message: "Notification not found." });
  }
}

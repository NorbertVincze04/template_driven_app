import type { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository.ts";
import { hasRole } from "../types/user.types.ts";

export class ManagementController {
  static async listUsers(req: Request, res: Response): Promise<Response> {
    if (!hasRole(req.user!, "OWNER")) {
      return res
        .status(403)
        .json({ success: false, message: "Only owners can manage barbers." });
    }
    return res.json({
      success: true,
      payload: await UserRepository.listForOwner(req.shop!.id),
    });
  }

  static async setBarberRole(req: Request, res: Response): Promise<Response> {
    if (!hasRole(req.user!, "OWNER")) {
      return res
        .status(403)
        .json({ success: false, message: "Only owners can manage barbers." });
    }
    const userId = req.params.userId;
    if (typeof userId !== "string" || typeof req.body?.enabled !== "boolean") {
      return res
        .status(400)
        .json({
          success: false,
          message: "A user and barber role state are required.",
        });
    }
    const updated = await UserRepository.setBarberRole(
      req.shop!.id,
      userId,
      req.body.enabled,
    );
    return updated
      ? res.json({ success: true })
      : res.status(404).json({ success: false, message: "User not found." });
  }

  static async updateNote(req: Request, res: Response): Promise<Response> {
    if (!hasRole(req.user!, "OWNER")) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only owners can manage barber notes.",
        });
    }
    const userId = req.params.userId;
    const note = req.body?.note;
    if (
      typeof userId !== "string" ||
      typeof note !== "string" ||
      note.trim().length > 2000
    ) {
      return res
        .status(400)
        .json({ success: false, message: "A valid private note is required." });
    }
    const updated = await UserRepository.updateBarberNote(
      req.shop!.id,
      userId,
      note.trim() || null,
    );
    return updated
      ? res.json({ success: true })
      : res.status(404).json({ success: false, message: "User not found." });
  }
}

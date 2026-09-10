import type { Request, Response } from "express";
import { BarberRatingRepository } from "../repositories/BarberRatingRepository.ts";

export class BarberRatingController {
  static async summary(req: Request, res: Response): Promise<Response> {
    const barberId = req.params.barberId;
    if (typeof barberId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A barber is required." });
    }
    return res.json({
      success: true,
      payload: await BarberRatingRepository.summary(req.shop!.id, barberId),
    });
  }

  static async mine(req: Request, res: Response): Promise<Response> {
    const barberId = req.params.barberId;
    if (typeof barberId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A barber is required." });
    }
    if (req.user!.role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ success: false, message: "Only customers can rate barbers." });
    }
    return res.json({
      success: true,
      payload: await BarberRatingRepository.findMine(
        req.shop!.id,
        barberId,
        req.user!.id,
      ),
    });
  }

  static async rate(req: Request, res: Response): Promise<Response> {
    const barberId = req.params.barberId;
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (
      typeof barberId !== "string" ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5 ||
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "A rating (1-5) and a comment are required.",
      });
    }
    if (req.user!.role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ success: false, message: "Only customers can rate barbers." });
    }
    try {
      const rated = await BarberRatingRepository.rate(
        req.shop!.id,
        barberId,
        req.user!.id,
        numericRating,
        comment.trim(),
      );
      return res.status(201).json({ success: true, payload: rated });
    } catch (error) {
      return res.status(409).json({
        success: false,
        message: (error as Error).message || "Could not submit your rating.",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    const barberId = req.params.barberId;
    if (typeof barberId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "A barber is required." });
    }
    if (req.user!.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can delete their rating.",
      });
    }
    const deleted = await BarberRatingRepository.remove(
      req.shop!.id,
      barberId,
      req.user!.id,
    );
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ success: false, message: "Rating not found." });
  }
}

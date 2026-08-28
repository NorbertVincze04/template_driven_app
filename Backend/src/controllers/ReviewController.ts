import type { Request, Response } from "express";
import { ReviewRepository } from "../repositories/ReviewRepository.ts";

export class ReviewController {
  static async list(req: Request, res: Response): Promise<Response> {
    return res.json({
      success: true,
      payload: await ReviewRepository.list(req.shop!.id),
    });
  }

  static async create(req: Request, res: Response): Promise<Response> {
    const { authorName, authorRole, rating, comment } = req.body;
    const numericRating = Number(rating);
    if (
      typeof authorName !== "string" ||
      !authorName.trim() ||
      authorName.trim().length > 150 ||
      (authorRole !== undefined &&
        authorRole !== null &&
        (typeof authorRole !== "string" || authorRole.trim().length > 100)) ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5 ||
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, rating, and review comment are required.",
      });
    }

    const review = await ReviewRepository.create(
      req.shop!.id,
      authorName.trim(),
      typeof authorRole === "string" && authorRole.trim()
        ? authorRole.trim()
        : null,
      numericRating,
      comment.trim(),
    );
    return res.status(201).json({ success: true, payload: review });
  }
}

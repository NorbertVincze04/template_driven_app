import type { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository.ts";

export class UserController {
  static async updateProfile(req: Request, res: Response): Promise<Response> {
    const {
      fullName,
      email,
      phoneNumber,
      profileImageData,
      profileImagePositionX,
      profileImagePositionY,
    } = req.body;
    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required." });
    }
    if (typeof phoneNumber !== "string" || !/^0[237]\d{8}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Use a valid Romanian phone number with 10 digits.",
      });
    }
    const positionX = Number(profileImagePositionX);
    const positionY = Number(profileImagePositionY);
    if (
      !Number.isInteger(positionX) ||
      positionX < 0 ||
      positionX > 100 ||
      !Number.isInteger(positionY) ||
      positionY < 0 ||
      positionY > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Image position must be between 0 and 100.",
      });
    }

    try {
      const user = await UserRepository.updateProfile(
        req.user!.id,
        req.shop!.id,
        fullName.trim(),
        email.trim().toLowerCase(),
        phoneNumber.trim(),
        typeof profileImageData === "string" &&
          profileImageData.startsWith("data:image/")
          ? profileImageData
          : null,
        positionX,
        positionY,
      );
      return res.json({
        success: true,
        payload: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          profileImageUrl: user.profile_image_url,
          profileImagePositionX: user.profile_image_position_x,
          profileImagePositionY: user.profile_image_position_y,
          role: user.role,
          shopId: req.shop!.id,
          shopSlug: req.shop!.slug,
        },
      });
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "An account with that email already exists.",
        });
      }
      return res
        .status(500)
        .json({ success: false, message: "Profile update failed." });
    }
  }
}

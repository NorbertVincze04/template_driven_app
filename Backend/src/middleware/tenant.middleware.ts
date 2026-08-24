import type { NextFunction, Request, Response } from "express";
import { ShopRepository } from "../repositories/ShopRepository.ts";
import type { ShopRecord } from "../types/tenant.types.ts";

declare global {
  namespace Express {
    interface Request {
      shop?: ShopRecord;
    }
  }
}

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  const slugHeader = req.get("X-Tenant-Slug");
  const slug = slugHeader?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({
      success: false,
      message: "A valid X-Tenant-Slug header is required.",
    });
  }

  const shop = await ShopRepository.findActiveBySlug(slug);
  if (!shop) {
    return res.status(404).json({
      success: false,
      message: "Salon not found or inactive.",
    });
  }

  req.shop = shop;
  next();
}

import type { Request, Response } from "express";
import { BugReportService } from "../services/BugReportService.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed || null : "";
}

export class BugReportController {
  static async create(req: Request, res: Response): Promise<Response> {
    const { reporterName, reporterEmail, pageUrl, description } = req.body;
    const name = optionalText(reporterName, 150);
    const email = optionalText(reporterEmail, 254);
    const currentPage = optionalText(pageUrl, 2000);
    const details = typeof description === "string" ? description.trim() : "";

    if (
      name === "" ||
      email === "" ||
      currentPage === "" ||
      (email && !EMAIL_PATTERN.test(email)) ||
      !details ||
      details.length > 4000
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid bug description is required.",
      });
    }

    await BugReportService.send({
      shopId: req.shop!.id,
      tenantSlug: req.shop!.slug,
      tenantName: req.shop!.name,
      reporterName: name,
      reporterEmail: email,
      pageUrl: currentPage,
      description: details,
      userAgent: req.get("User-Agent") || null,
      submittedAt: new Date().toISOString(),
    });

    return res.status(202).json({
      success: true,
      message: "Bug report received.",
    });
  }
}

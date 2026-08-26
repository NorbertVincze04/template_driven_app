import { Router } from "express";
import { tenantMiddleware } from "../middleware/tenant.middleware.ts";

export const tenantRouter = Router();

tenantRouter.get("/config", tenantMiddleware, (req, res) => {
  const shop = req.shop!;

  res.json({
    success: true,
    payload: {
      ...shop.config,
      tenantId: shop.slug,
      name: shop.config.name ?? shop.name,
    },
  });
});

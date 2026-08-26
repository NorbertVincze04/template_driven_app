import express from "express";
import cors from "cors";
import morgan from "morgan";
import { CORS_ORIGINS } from "./config.ts";
import { authRouter } from "./routes/auth.routes.ts";
import { tenantRouter } from "./routes/tenant.routes.ts";
import { errorHandler } from "./middleware/error.middleware.ts";

export function createApp() {
  const app = express(); // create express server

  app.use(
    cors({
      origin: CORS_ORIGINS,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Tenant-Slug",
        "X-Tenant-Domain",
      ],
    }),
  );

  app.use(express.json()); // middleware to parse JSON request bodies
  app.use(morgan("dev"));

  app.use("/api/auth", authRouter);
  app.use("/api/tenant", tenantRouter);
  app.use(errorHandler);

  return app;
}

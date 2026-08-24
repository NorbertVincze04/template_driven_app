import express from "express";
import cors from "cors";
import morgan from "morgan";
import { CORS_ORIGIN } from "./config.ts";
import { authRouter } from "./routes/auth.routes.ts";
import { errorHandler } from "./middleware/error.middleware.ts";

export function createApp() {
  const app = express(); // create express server

  app.use(
    cors({
      origin: CORS_ORIGIN,
      allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Slug"],
    }),
  );

  app.use(express.json()); // middleware to parse JSON request bodies
  app.use(morgan("dev"));

  app.use("/api/auth", authRouter);
  app.use(errorHandler);

  return app;
}

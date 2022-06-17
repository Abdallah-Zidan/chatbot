import http from "http";
import { Application } from "express";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";

//? register services into container
import { TYPES, container } from "./container";
import { registerServices } from "./service.provider";

import config from "./config";
import { ILoggable } from "./interfaces";
import { getLogger } from "./logger";

registerServices();

//? setup application
export async function setup(app: Application) {
  const localLogger = getLogger("local", "setup");
  const remoteLogger = getLogger("remote", "setup");
  const port = process.env.PORT || 3000;

  //? connect to mongo db that is used for storing messages
  await mongoose.connect(process.env.MONGO_URL);

  const logConnection: ILoggable = {
    message: "connected to mongo db",
    options: {
      level: "info",
      timestamp: Date.now(),
    },
  };

  localLogger.log(logConnection);
  remoteLogger.log(logConnection);
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(apiLimiter);
  app.use(helmet());
  app.use(
    cors({
      origin: (
        config.env.ALLOWED_ORIGINS || `http://localhost:${config.env.PORT}}`
      )
        .split(",")
        .map((o) => o.trim()),
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const server = http.createServer(app);
  const io = new Server(server, {
    serveClient: false,
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || `http://localhost:${port}`)
        .split(",")
        .map((o) => o.trim()),
      methods: ["GET", "POST"],
      allowedHeaders: "*",
    },
  });

  container.bind(TYPES.IO).toConstantValue(io);

  return { server, io, port };
}

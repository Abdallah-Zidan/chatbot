import { ILoggable, ILogger } from "../interfaces";
import winston from "winston";
import config from "../config";

declare global {
  namespace globalThis {
    var __winston__: winston.Logger;
  }
}

const transports =
  config.env.NODE_ENV === "production"
    ? [
        new winston.transports.File({
          filename: "logs/log.json",
          level: "debug",
        }),
      ]
    : [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: "logs/log.json",
          level: "debug",
          format: winston.format.json(),
        }),
      ];

if (!global.__winston__) {
  global.__winston__ = winston.createLogger({
    level: "debug",
    transports,
  });
}

const localLogger: winston.Logger = global.__winston__;

export class LocalLogger implements ILogger {
  constructor(private name: string) {}
  log({ message, meta, options }: ILoggable) {
    const data = {
      app: config.appName,
      env: config.env.NODE_ENV ?? "development",
      meta: meta ?? {},
      timestamp: options?.timestamp ?? Date.now(),
      level: options?.level ?? "info",
      context: {
        name: this.name,
      },
    };
    message = `[${this.name}] ${message}`;
    switch (options?.level) {
      case "info":
        localLogger.info(message, data);
        break;
      case "warn":
        localLogger.warn(message, data);
        break;
      case "error":
        localLogger.error(message, data);
        break;
      case "debug":
        localLogger.debug(message, data);
        break;
      default:
        localLogger.info(message, data);
    }
  }
}
export function getLocalLogger(name: string) {
  return new LocalLogger(name);
}

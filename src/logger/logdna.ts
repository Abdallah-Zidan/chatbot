import { createLogger, Logger } from "@logdna/logger";
import { ILoggable, ILogger } from "../interfaces";
import config from "../config";

declare global {
  namespace globalThis {
    var __logdna__: Logger;
  }
}

if (!global.__logdna__) {
  global.__logdna__ = createLogger(config.env.LOGDNA_KEY, {
    app: config.appName,
    verboseEvents: false,
  });
}

const remoteLogger: Logger = global.__logdna__;

export class RemoteLogger implements ILogger {
  constructor(private name: string) {}
  log({ message, meta, options }: ILoggable) {
    remoteLogger.log(`[${this.name}] ${message}`, {
      app: config.appName,
      env: config.env.NODE_ENV ?? "development",
      meta: meta ?? {},
      timestamp: options?.timestamp ?? Date.now(),
      level: options?.level ?? "info",
      context: {
        name: this.name,
      },
    });
  }
}

export function getRemoteLogger(name: string) {
  return new RemoteLogger(name);
}

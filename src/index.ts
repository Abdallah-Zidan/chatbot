import "reflect-metadata";
import express from "express";
import { setup } from "./setup";
import { getLogger } from "./logger";
import { onConnection, sessionMiddleware } from "./websocket";
import { IBot, ILoggable } from "./interfaces";
import { container, TYPES } from "./container";
import { createOnReplyHandler } from "./websocket/handlers";

async function main() {
  const localLogger = getLogger("local", "main");
  const remoteLogger = getLogger("remote", "main");

  const app = express();
  const { server, io, port } = await setup(app);

  //? middleware to handle dealing with user session
  io.use(sessionMiddleware);
  io.on("connection", onConnection);

  server.listen(port, () => {
    const toLog: ILoggable = {
      message: `server started on port ${port}`,
      options: {
        level: "info",
        timestamp: Date.now(),
      },
    };
    localLogger.log(toLog);
    remoteLogger.log(toLog);
  });

  const bot = container.get<IBot>(TYPES.Bot);
  bot.onReply(createOnReplyHandler());
}

main().catch(console.error);

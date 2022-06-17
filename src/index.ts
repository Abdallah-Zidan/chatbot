import express from "express";
import { setup } from "./setup";
import { getLogger } from "./logger";
import { startHandlingConnections, createSessionMiddleware } from "./websocket";
import { ContentType, ILoggable } from "./interfaces";

async function main() {
  const localLogger = getLogger("local", "main");
  const remoteLogger = getLogger("remote", "main");

  const app = express();
  const { messageStore, sessionStore, server, io, port, bot } = await setup(
    app
  );

  //? middleware to handle dealing with user session
  io.use(createSessionMiddleware(sessionStore));

  startHandlingConnections({
    io,
    sessionStore,
    messageStore,
    bot,
  });

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

  bot.onReply(async (message) => {
    const toSend = {
      _id: await messageStore.newMessageID(),
      data: message,
      type: ContentType.Text,
      isBot: true,
      sessionID: message.sessionID,
      createdAt: new Date(),
      delivered: false,
    };
    localLogger.log({
      message: `sending message to client`,
      options: {
        level: "info",
        timestamp: Date.now(),
      },
      meta: {
        message,
      },
    });
    await messageStore.saveMessage(toSend);
    io.to(message.sessionID).emit("message", message);
  });
}

main().catch(console.error);

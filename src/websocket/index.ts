import { Server } from "socket.io";
import { onConnection } from "./on-connection";
import { ISessionStore, IMessageStore, IBot } from "../interfaces";

export function startHandlingConnections({
  io,
  sessionStore,
  messageStore,
  bot,
}: {
  io: Server;
  sessionStore: ISessionStore;
  messageStore: IMessageStore;
  bot: IBot;
}) {
  io.on(
    "connection",
    onConnection({
      io,
      sessionStore,
      messageStore,
      bot,
    })
  );
}

export { createSessionMiddleware } from "./session-middleware";

import { Server } from "socket.io";
import { getLogger } from "../logger";
import {
  SessionedSocket,
  IMessageStore,
  ISessionStore,
  ContentType,
  IMessage,
  IBot,
} from "../interfaces";

const localLogger = getLogger("local", "handlers");

export function attachSocketHandlers({
  messageStore,
  sessionStore,
  io,
  socket,
  bot,
}: {
  messageStore: IMessageStore;
  sessionStore: ISessionStore;
  io: Server;
  socket: SessionedSocket;
  bot: IBot;
}) {
  socket.on("disconnect", createDisconnectHandler(sessionStore, io));
  socket.on("message", createMessageHandler(bot, messageStore));
}

function createMessageHandler(bot: IBot, messageStore: IMessageStore) {
  return async function onMessage(this: SessionedSocket, message: string) {
    const socket = this;
    const toSend: IMessage = {
      _id: await messageStore.newMessageID(),
      data: message,
      type: ContentType.Text,
      isBot: false,
      sessionID: socket.sessionID,
      timestamp: new Date(),
      delivered: true,
    };
    await messageStore.saveMessage(toSend);
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
    bot.sendMessage({
      sessionID: socket.sessionID,
      body: message,
    });
  };
}

function createDisconnectHandler(sessionStore: ISessionStore, io: Server) {
  return async function onDisconnect(this: SessionedSocket) {
    const socket = this;
    const matchingSockets = await io.in(socket.sessionID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      await sessionStore.saveSession(socket.sessionID, {
        username: socket.username,
        connected: false,
      });
    }
  };
}

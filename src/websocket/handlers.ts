import { Server, Socket } from "socket.io";
import { getLogger, transformError } from "../logger";
import {
  SessionedSocket,
  IMessageStore,
  ISessionStore,
  ContentType,
  IMessage,
  IBot,
  IBotMessage,
} from "../interfaces";
import { container, TYPES } from "../container";
import { onHistory, onMissed } from "./send-history";

const localLogger = getLogger("local", "handlers");

export function attachSocketHandlers(socket: Socket) {
  socket.on("disconnect", onDisconnect);
  socket.on("message", onMessage);
  socket.on("history", onHistory);
  socket.on("missed", onMissed);
  socket.on("delivered", onDeliverd);
}

async function onMessage(this: SessionedSocket, message: string) {
  const socket = this;
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);
  const bot = container.get<IBot>(TYPES.Bot);

  const toSend: IMessage = {
    _id: await messageStore.newMessageID(),
    data: message,
    type: ContentType.Text,
    isBot: false,
    sessionID: socket.sessionID,
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
}

async function onDisconnect(this: SessionedSocket) {
  const sessionStore = container.get<ISessionStore>(TYPES.SessionStore);
  const io = container.get<Server>(TYPES.IO);
  const socket = this;
  const matchingSockets = await io.in(socket.sessionID).allSockets();
  const isDisconnected = matchingSockets.size === 0;
  if (isDisconnected) {
    await sessionStore.saveSession(socket.sessionID, {
      username: socket.username,
      connected: false,
    });
  }
}

async function onDeliverd(this: SessionedSocket, id: string) {
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);
  messageStore.deliverMessage(id).catch((err) => {
    localLogger.log({
      message: `error delivering message`,
      options: {
        level: "error",
        timestamp: Date.now(),
      },
      meta: {
        error: transformError(err),
        sessionID: this.sessionID,
        messageID: id,
      },
    });
  });
}

export function createOnReplyHandler() {
  const localLogger = getLogger("local", "onReply");
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);
  const io = container.get<Server>(TYPES.IO);
  return async (message: IBotMessage) => {
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
  };
}

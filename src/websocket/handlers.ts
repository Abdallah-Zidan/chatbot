import { Server, Socket } from "socket.io";
import { getLogger } from "../logger";
import {
  SessionedSocket,
  IMessageStore,
  ISessionStore,
  ContentType,
  IMessage,
  IBot,
} from "../interfaces";
import { container, TYPES } from "../container";

const localLogger = getLogger("local", "handlers");

export function attachSocketHandlers(socket: Socket) {
  socket.on("disconnect", onDisconnect);
  socket.on("message", onMessage);
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

import { Server } from "socket.io";
import {
  SessionedSocket,
  SessionableSocket,
  isSessionedSocket,
  ISessionStore,
  IMessageStore,
  IBot,
} from "../interfaces";
import { attachSocketHandlers } from "./handlers";
import { createUsersAndHistoryHandler } from "./send-history";

export function onConnection({
  messageStore,
  sessionStore,
  io,
  bot,
}: {
  messageStore: IMessageStore;
  sessionStore: ISessionStore;
  io: Server;
  bot: IBot;
}) {
  return async function onSocketConnected(socket: SessionableSocket) {
    if (isSessionedSocket(socket)) {
      await saveUserSession(sessionStore, socket);
      await pushSessionInfo(socket);
      await createUsersAndHistoryHandler({
        messageStore,
        sessionStore,
        socket,
      });
      attachSocketHandlers({ messageStore, sessionStore, socket, io, bot });
    } else {
      socket.emit("error", "invalid session");
      socket.disconnect();
    }
  };
}

function saveUserSession(sessionStore: ISessionStore, socket: SessionedSocket) {
  return sessionStore.saveSession(socket.sessionID, {
    username: socket.username,
    connected: true,
  });
}

async function pushSessionInfo(socket: SessionedSocket) {
  socket.emit("session", {
    sessionID: socket.sessionID,
  });
  socket.join(socket.sessionID);
}

import { TYPES, container } from "../container";
import {
  SessionedSocket,
  SessionableSocket,
  isSessionedSocket,
  ISessionStore,
  IMessageStore,
} from "../interfaces";
import { attachSocketHandlers } from "./handlers";
import { sendChatHistory } from "./send-history";

export async function onConnection(socket: SessionableSocket) {
  const sessionStore = container.get<ISessionStore>(TYPES.SessionStore);
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);

  if (isSessionedSocket(socket)) {
    await saveUserSession(sessionStore, socket);
    await pushSessionInfo(socket);
    await sendChatHistory({
      messageStore,
      socket,
    });
    attachSocketHandlers(socket);
  } else {
    socket.emit("error", "invalid session");
    socket.disconnect();
  }
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

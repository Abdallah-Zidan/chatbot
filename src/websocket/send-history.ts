import { ISessionStore, IMessageStore, SessionedSocket } from "../interfaces";

export async function createUsersAndHistoryHandler({
  messageStore,
  sessionStore,
  socket,
}: {
  messageStore: IMessageStore;
  sessionStore: ISessionStore;
  socket: SessionedSocket;
}) {
  const messages = await messageStore.findMessagesForUser(socket.sessionID);
  socket.emit("history", messages);
}

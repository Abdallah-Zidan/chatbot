import { IMessageStore, SessionedSocket } from "../interfaces";

export async function sendChatHistory({
  messageStore,
  socket,
}: {
  messageStore: IMessageStore;
  socket: SessionedSocket;
}) {
  const messages = await messageStore.findMessagesForUser(socket.sessionID);
  socket.emit("history", messages);
}

import { IMessageStore, SessionedSocket } from "../interfaces";
import { TYPES, container } from "../container";
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

export async function onHistory(this: SessionedSocket) {
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);
  const messages = await messageStore.findMessagesForUser(this.sessionID);
  this.emit("history", messages);
}

export async function onMissed(this: SessionedSocket) {
  const messageStore = container.get<IMessageStore>(TYPES.MessageStore);
  const messages = await messageStore.findMessagesForUser(this.sessionID);
  this.emit("missed", messages);
}

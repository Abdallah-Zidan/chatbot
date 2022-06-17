import { IMessageStore, IMessage } from "../interfaces";
import { v4 as uuid4 } from "uuid";
import { injectable } from "inversify";
@injectable()
export class InMemoryMessageStore implements IMessageStore {
  protected messages: IMessage[] = [];

  async newMessageID() {
    return uuid4();
  }

  async saveMessage(message: IMessage) {
    this.messages.push(message);
  }

  async findMessagesForUser(userID: string) {
    return this.messages.filter(({ sessionID }) => sessionID === userID);
  }
}

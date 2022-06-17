import { injectable } from "inversify";
import mongoose from "mongoose";
import { IMessageStore, IMessage } from "../../interfaces";
import { Message } from "./message.schema";
@injectable()
export class MongoMessageStore implements IMessageStore {
  async saveMessage(message: IMessage) {
    const newMessage = new Message(message);
    await newMessage.save();
  }

  async findMessagesForUser(sessionID: string) {
    return Message.find({
      sessionID: sessionID,
    });
  }

  async newMessageID() {
    return new mongoose.Types.ObjectId().toString();
  }
}

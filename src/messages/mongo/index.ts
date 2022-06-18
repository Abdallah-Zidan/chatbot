import { injectable } from "inversify";
import mongoose from "mongoose";
import config from "../../config";
import { IMessageStore, IMessage } from "../../interfaces";
import { Message } from "./message.schema";
@injectable()
export class MongoMessageStore implements IMessageStore {
  async saveMessage(message: IMessage) {
    const newMessage = new Message(message);
    await newMessage.save();
  }

  async findMessagesForUser(sessionID: string) {
    let skip = 0;
    let limit = 100;
    const count = await Message.countDocuments({ sessionID });

    if (count > limit) {
      skip = count - limit;
    }

    return Message.find({
      sessionID: sessionID,
      createdAt: {
        $gt: new Date(
          Date.now() - Number(config.env.MESSAGE_TTL) ?? 24 * 60 * 60 * 1000
        ),
      },
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });
  }

  async newMessageID() {
    return new mongoose.Types.ObjectId().toString();
  }

  async deliverMessage(id: string) {
    await Message.updateOne({ _id: id }, { delivered: true });
  }

  async findMissedMessagesForUser(userID: string) {
    return Message.find({
      sessionID: userID,
      delivered: { $or: [false, null, undefined] },
      createdAt: {
        $gt: new Date(
          Date.now() - Number(config.env.MESSAGE_TTL) ?? 24 * 60 * 60 * 1000
        ),
      },
    }).sort({ createdAt: 1 });
  }
}

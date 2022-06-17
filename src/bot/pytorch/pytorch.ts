import { injectable } from "inversify";
import { IBot, IBotMessage, ReplyHandler } from "../../interfaces";
import { rabbitmq } from "./rabbitmq";
@injectable()
export class Pytorch implements IBot {
  async onReply(handler: ReplyHandler) {
    await rabbitmq.startReceiving(handler);
  }

  async sendMessage(message: IBotMessage) {
    await rabbitmq.sendToBot(message);
    return true;
  }
}

export const pytorch = new Pytorch();

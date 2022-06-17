import amqplib from "amqplib";
import { EventEmitter, once } from "events";

import { IBotMessage } from "../../interfaces";
import config from "../../config";
import { getLogger } from "../../logger";

const BOT_QUEUE = config.env.BOT_QUEUE;
const CLIENT_QUEUE = config.env.CLIENT_QUEUE;

function connect() {
  return amqplib.connect(config.env.RABBITMQ_URL);
}

async function createChannelAndQueues(
  connection: amqplib.Connection,
  queues: string[]
) {
  const ch = await connection.createChannel();
  for (const queue of queues) {
    await ch.assertQueue(queue, { durable: true });
  }

  return ch;
}

export class RabbitMQ extends EventEmitter {
  private logger = getLogger("local", "rabbitmq");
  private botChannel!: amqplib.Channel;
  private clientChannel!: amqplib.Channel;
  private isReady = false;

  constructor() {
    super();
    this.__init__();
  }

  async sendToBot(message: IBotMessage) {
    if (!this.isReady || !this.botChannel) await this.waitForReadiness();
    this.botChannel.sendToQueue(
      BOT_QUEUE,
      Buffer.from(JSON.stringify(message))
    );
  }

  async startReceiving(handler: (message: IBotMessage) => void) {
    if (!this.isReady || !this.clientChannel) await this.waitForReadiness();
    this.clientChannel.consume(CLIENT_QUEUE, (msg) => {
      if (msg !== null && this.clientChannel) {
        handler(JSON.parse(msg.content.toString()));
        this.clientChannel.ack(msg);
      }
    });
  }

  private __init__() {
    connect()
      .then((connection) => {
        return Promise.all([
          createChannelAndQueues(connection, [BOT_QUEUE, CLIENT_QUEUE]),
          createChannelAndQueues(connection, [BOT_QUEUE, CLIENT_QUEUE]),
        ]);
      })
      .then(([botChannel, clientChannel]) => {
        this.botChannel = botChannel;
        this.clientChannel = clientChannel;
        this.isReady = true;
        this.logger.log({
          message: "RabbitMQ is ready",
          options: {
            level: "info",
          },
        });

        this.emit("ready");
      })
      .catch((err) => {
        this.emit("error", err);
      });
  }

  waitForReadiness() {
    return new Promise((resolve, reject) => {
      once(this, "ready").then(resolve);
      once(this, "error").then(reject);
    });
  }
}
export const rabbitmq = new RabbitMQ();

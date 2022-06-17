import Redis from "ioredis";
import { Pytorch } from "./bot";
import config from "./config";
import { container, TYPES } from "./container";
import { MongoMessageStore } from "./messages";
import { RedisSessionStore } from "./session";

export function registerServices() {
  container.bind(TYPES.MessageStore).to(MongoMessageStore);
  container.bind(TYPES.Bot).to(Pytorch);
  container.bind(TYPES.SessionStore).toDynamicValue(() => {
    return new RedisSessionStore(
      new Redis({
        host: config.env.REDIS_HOST,
      })
    );
  });
}

import { Redis } from "ioredis";
import { ISessionStore, Session } from "./../interfaces";
import { SessionStore } from "./abstract-store";

const mapSession = ([username, connected]: any) =>
  username ? { username, connected: connected === "true" } : undefined;

export class RedisSessionStore extends SessionStore implements ISessionStore {
  constructor(private redisClient: Redis) {
    super();
  }

  async findSession(sessionID: string): Promise<Session | undefined> {
    const result = await this.redisClient.hmget(
      `session:${sessionID}`,
      "username",
      "connected"
    );
    return mapSession(result);
  }

  async saveSession(sessionId: string, session: Session): Promise<void> {
    await this.redisClient
      .multi()
      .hset(
        `session:${sessionId}`,
        "username",
        session.username,
        "connected",
        String(session.connected)
      )
      .expire(`session:${sessionId}`, process.env.SESSION_TTL ?? 600)
      .exec();
  }

  async deleteSession(sessionID: string): Promise<void> {
    await this.redisClient.del(`session:${sessionID}`);
  }

  async findAllSessions(): Promise<Session[]> {
    const keys = new Set();
    let nextIndex = 0;
    do {
      const [nextIndexAsStr, results] = await this.redisClient.scan(
        nextIndex,
        "MATCH",
        "session:*",
        "COUNT",
        "100"
      );
      nextIndex = parseInt(nextIndexAsStr, 10);
      results.forEach((s) => keys.add(s));
    } while (nextIndex !== 0);

    // and then we retrieve the session details with multiple HMGET commands
    const commands: any[] = [];
    keys.forEach((key) => {
      commands.push(["hmget", key, "username", "connected"]);
    });
    return (await this.redisClient
      .multi(commands)
      .exec()
      .then((results) => {
        if (!results) return [];
        return results
          .map(([err, session]) => (err ? undefined : mapSession(session)))
          .filter((v) => !!v);
      })) as Session[];
  }
}

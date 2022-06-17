import { Session, ISessionStore } from "../interfaces";
import { SessionStore } from "./abstract-store";
export type SessionMap = Map<string, Session>;

export class InMemorySessionStore
  extends SessionStore
  implements ISessionStore
{
  private sessions: SessionMap = new Map();
  async findSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  async saveSession(sessionId: string, session: Session) {
    this.sessions.set(sessionId, session);
  }

  async deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  async findAllSessions() {
    return [...this.sessions.values()];
  }
}

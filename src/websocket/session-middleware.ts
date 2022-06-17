import { ISessionStore, SessionableSocket } from "../interfaces";

export function createSessionMiddleware(sessionStore: ISessionStore) {
  return async function sessionMiddleware(
    socket: SessionableSocket,
    next: (err?: Error) => void
  ) {
    const sessionID = socket.handshake.auth.sessionID;
    console.log(sessionID);

    if (sessionID) {
      const session = await sessionStore.findSession(sessionID);
      if (session) {
        socket.sessionID = sessionID;
        socket.username = session.username;
        return next();
      }
    }

    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }

    //? create new session
    const newSessionID = await sessionStore.randomID();
    socket.sessionID = newSessionID;
    socket.username = username;
    next();
  };
}

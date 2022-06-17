import { Socket } from "socket.io";

export interface Session {
  username: string;
  connected: boolean;
}

export interface ISessionStore {
  randomID(): Promise<string>;
  findSession(sessionID: string): Promise<Session | undefined>;
  saveSession(sessionId: string, session: Session): Promise<void>;
  deleteSession(sessionID: string): Promise<void>;
  findAllSessions(): Promise<Session[]>;
}

export enum ContentType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Location = "location",
}

export interface IMessage {
  _id: string;
  sessionID: string;
  type: ContentType;
  data: any;
  isBot: boolean;
  createdAt?: Date;
  timestamp?: Date;
  delivered?: boolean;
  updatedAt?: Date;
}

export interface IMessageStore {
  saveMessage: (message: IMessage) => Promise<void>;
  findMessagesForUser: (userID: string) => Promise<IMessage[]>;
  newMessageID: () => Promise<string>;
  deliverMessage: (id: string) => Promise<void>;
  findMissedMessagesForUser: (userID: string) => Promise<IMessage[]>;
}

export interface SessionableSocket extends Socket {
  sessionID?: string;
  username?: string;
}

export interface SessionedSocket extends Socket {
  sessionID: string;
  username: string;
}

export function isSessionedSocket(socket: Socket): socket is SessionedSocket {
  return "sessionID" in socket;
}

export interface ILoggable {
  message: string;
  meta?: any;
  options?: {
    timestamp?: number;
    level?: "info" | "warn" | "error" | "debug" | "trace";
  };
}

export interface ILogger {
  log: (loggedObject: ILoggable) => void;
}

export interface IBotMessage {
  body: string;
  sessionID: string;
}

export type ReplyHandler = (payload: IBotMessage) => Promise<void>;
export interface IBot {
  onReply: (handler: ReplyHandler) => void;
  sendMessage: (message: IBotMessage) => Promise<boolean>;
}

import { v4 as uuid4 } from "uuid";
export abstract class SessionStore {
  async randomID() {
    return uuid4();
  }
}

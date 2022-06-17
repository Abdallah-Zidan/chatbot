import { ILogger } from "../interfaces";
import { getRemoteLogger } from "./logdna";
import { getLocalLogger } from "./winston";
export * from "./utils";

export function getLogger(type: "local" | "remote", name: string): ILogger {
  if (type === "local") {
    return getLocalLogger(name);
  } else {
    return getRemoteLogger(name);
  }
}

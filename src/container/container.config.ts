import { Container } from "inversify";
import { TYPES } from "./types";

if (!global.__app__container) {
  global.__app__container = new Container();
}

export const container = global.__app__container;

export function configureContainer(classes: any) {
  for (const key in classes) {
    container.bind(TYPES[key as keyof typeof TYPES]).to(classes[key]);
  }
}

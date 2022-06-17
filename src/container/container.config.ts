import { Container } from "inversify";

if (!global.__app__container) {
  global.__app__container = new Container();
}

export const container = global.__app__container;

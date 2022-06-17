import { config as envConfig } from "dotenv";

if (!global.__app__config) {
  envConfig();
  global.__app__config = {
    appName: "Chat Backend",
    env: process.env,
  };
}

export default global.__app__config;

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * @default 'development'
     * @description The environment in which the app is running.
     * @example 'development'
     * @example 'production'
     * @example 'test'
     * @example 'staging'
     */
    NODE_ENV?: string;
    /**
     * @default 3000
     * @description The port on which the app is listening.
     * @example 3000
     **/
    PORT: string;

    /**
     * @description Debug option for socket.io.
     * @example *
     **/
    DEBUG?: string;

    /**
     * @default 127.0.0.1
     * @description the host name of the redis server
     * @example redis.example.net
     */
    REDIS_HOST: string;
    SESSION_TTL: number;

    MESSAGE_TTL: number;
    MONGO_URL: string;

    ALLOWED_ORIGINS?: string;
    LOGDNA_KEY: string;

    // rabbitmq
    CLIENT_QUEUE: string;
    BOT_QUEUE: string;
    RABBITMQ_URL: string;
    ENABLE_REMOTE_LOGGER: boolean;
  }
}

interface Socket extends import("socket.io").Socket {
  /**
   * @description The id of the socket.
   * @example socket.id
   * @example socket.id
   * @example socket.id
   */
  user: string;
}

interface AppConfig {
  appName: string;
  env: NodeJS.ProcessEnv;
}

declare namespace Express {
  interface Response {
    body: any;
  }
}

var __app__config: AppConfig;
var __local_logger__: any;
var __remote__logger: any;
var __app__container: import("inversify").Container;

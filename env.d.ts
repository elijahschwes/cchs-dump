declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SCHOOLOGY_CLIENT_KEY: string;
      SCHOOLOGY_CLIENT_SECRET: string;
      DISTRICT: string;
    }
  }
}

export {};

import type { Logger } from 'pino';

export interface JobContext {
  logger: Logger;
}

export interface JobDefinition {
  name: string;
  description: string;
  run: (ctx: JobContext) => Promise<void>;
}

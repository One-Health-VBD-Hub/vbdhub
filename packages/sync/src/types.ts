import type { Logger } from 'pino';

export interface JobContext {
  signal: AbortSignal;
  logger: Logger;
}

export type JobHandler = (ctx: JobContext) => Promise<void>;

export interface JobDefinition {
  name: string;
  description: string;
  run: JobHandler;
}

import type { Logger } from 'pino';

export interface JobContext {
  signal: AbortSignal;
  logger: Logger;
}

export interface JobDefinition {
  name: string;
  description: string;
  run: (ctx: JobContext) => Promise<void>;
}

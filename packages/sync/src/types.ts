import type { Logger } from 'pino';

export interface JobDefinition {
  name: string;
  description: string;
  run: (ctx: { logger: Logger }) => Promise<void>;
}

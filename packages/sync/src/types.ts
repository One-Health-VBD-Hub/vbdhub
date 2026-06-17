import type { Logger } from 'pino';

export interface JobDefinition {
  name: string;
  run: (options: { logger: Logger }) => Promise<void>;
}

import type { Logger } from 'pino';

export interface JobDefinition {
  name: string;
  run: (options: { logger: Logger }) => Promise<void>;
}

export type TemporalCoverage = {
  startDate: Date | null;
  endDate: Date | null;
  dateCount: number;
};
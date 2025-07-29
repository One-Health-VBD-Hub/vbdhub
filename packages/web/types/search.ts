import { AnyRecord } from '@/types/indexed';

export interface SearchResults {
  hits: AnyRecord[];
  count?: number;
  duration?: number;
}

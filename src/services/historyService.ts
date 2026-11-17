import type { Calculation, HistoryEntry } from '../domain/types';
import { HISTORY_LIMIT } from '../storage/localHistoryRepository';
export function prependCalculation(
  entries: HistoryEntry[],
  calculation: Calculation,
): HistoryEntry[] {
  return [
    {
      ...calculation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    },
    ...entries,
  ].slice(0, HISTORY_LIMIT);
}

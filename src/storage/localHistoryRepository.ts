import type { HistoryEntry } from '../domain/types';
import { isOperator } from '../domain/types';
import { calculate } from '../domain/arithmetic';
export const HISTORY_KEY = 'smartcalc.history.v1';
export const HISTORY_LIMIT = 50;
function isEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<HistoryEntry>;
  if (
    typeof e.id !== 'string' ||
    !e.id ||
    typeof e.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(e.createdAt)) ||
    typeof e.operandA !== 'string' ||
    typeof e.operandB !== 'string' ||
    !isOperator(e.operator) ||
    typeof e.result !== 'string'
  )
    return false;
  const result = calculate(e.operandA, e.operator, e.operandB);
  return result.success && result.value === e.result;
}
export function loadHistory(): { entries: HistoryEntry[]; available: boolean } {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw === null) return { entries: [], available: true };
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return { entries: [], available: false };
    const ids = new Set<string>();
    const entries = data
      .filter(isEntry)
      .filter((e) => {
        if (ids.has(e.id)) return false;
        ids.add(e.id);
        return true;
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, HISTORY_LIMIT);
    return {
      entries,
      available: entries.length === Math.min(data.length, HISTORY_LIMIT),
    };
  } catch {
    return { entries: [], available: false };
  }
}
export function saveHistory(entries: HistoryEntry[]): boolean {
  try {
    if (entries.length === 0) localStorage.removeItem(HISTORY_KEY);
    else
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(entries.slice(0, HISTORY_LIMIT)),
      );
    return true;
  } catch {
    return false;
  }
}

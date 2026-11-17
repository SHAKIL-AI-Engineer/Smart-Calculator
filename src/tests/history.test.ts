import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  HISTORY_KEY,
  loadHistory,
  saveHistory,
} from '../storage/localHistoryRepository';
import { prependCalculation } from '../services/historyService';
import type { HistoryEntry } from '../domain/types';
const entry: HistoryEntry = {
  id: 'one',
  operandA: '0.1',
  operator: '+',
  operandB: '0.2',
  result: '0.3',
  createdAt: '2026-11-17T15:00:00Z',
};
afterEach(() => vi.restoreAllMocks());
describe('history persistence', () => {
  it('round trips exact string values', () => {
    expect(saveHistory([entry])).toBe(true);
    expect(loadHistory().entries).toEqual([entry]);
  });
  it('clears persistent history', () => {
    saveHistory([entry]);
    saveHistory([]);
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });
  it.each(['invalid json', '{}', '[null, {"id":"bad"}]'])(
    'recovers from %s',
    (value) => {
      localStorage.setItem(HISTORY_KEY, value);
      expect(loadHistory()).toEqual({ entries: [], available: false });
    },
  );
  it('discards tampered results and duplicate IDs', () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([entry, entry, { ...entry, id: 'two', result: 'wrong' }]),
    );
    expect(loadHistory().entries).toEqual([entry]);
  });
  it('handles denied reads and writes', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw Error('quota');
    });
    expect(loadHistory().available).toBe(false);
    expect(saveHistory([entry])).toBe(false);
  });
  it('keeps only 50 newest successful calculations', () => {
    let history: HistoryEntry[] = [];
    for (let i = 0; i < 60; i++)
      history = prependCalculation(history, {
        operandA: String(i),
        operator: '+',
        operandB: '1',
        result: String(i + 1),
      });
    expect(history).toHaveLength(50);
    expect(history[0].result).toBe('60');
    expect(history[49].result).toBe('11');
  });
});

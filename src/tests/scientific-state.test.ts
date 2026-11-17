import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  initialScientificState,
  scientificReducer as reduce,
  type ScientificState,
} from '../state/scientificReducer';
import {
  loadScientificState,
  saveScientificState,
  SCIENTIFIC_KEY,
} from '../storage/scientificRepository';
import { HISTORY_KEY } from '../storage/localHistoryRepository';
const compute = (
  expression: string,
  state: ScientificState = initialScientificState,
  id = expression,
) =>
  reduce(reduce(state, { type: 'edit', expression }), {
    type: 'evaluate',
    id,
    now: Date.now(),
  });
afterEach(() => vi.restoreAllMocks());
describe('scientific state and persistence', () => {
  it('evaluates and does not duplicate repeated equals', () => {
    const state = compute('2+3');
    expect(state.result).toBe('5');
    expect(
      reduce(state, { type: 'evaluate', id: 'duplicate', now: Date.now() }),
    ).toBe(state);
  });
  it('continues from Ans after a result but starts fresh with a number', () => {
    const state = compute('2+3');
    expect(reduce(state, { type: 'insert', text: '*' }).expression).toBe(
      'Ans*',
    );
    expect(reduce(state, { type: 'insert', text: '7' }).expression).toBe('7');
  });
  it('edits a selected range', () =>
    expect(
      reduce(
        { ...initialScientificState, expression: '12+34' },
        { type: 'insert', text: '5', start: 3, end: 5 },
      ).expression,
    ).toBe('12+5'));
  it('stores, accumulates, subtracts, recalls, and clears decimal memory', () => {
    let s = compute('0.1');
    s = reduce(s, { type: 'memory', command: 'MS' });
    s = compute('0.2', s);
    s = reduce(s, { type: 'memory', command: 'M+' });
    expect(s.memory).toBe('0.3');
    s = reduce(s, { type: 'memory', command: 'M-' });
    expect(s.memory).toBe('0.1');
    expect(reduce(s, { type: 'memory', command: 'MR' }).expression).toBe(
      '(0.1)',
    );
    expect(reduce(s, { type: 'memory', command: 'MC' }).memory).toBe('0');
  });
  it('does not store failed calculations', () => {
    const state = compute('sqrt(-1)');
    expect(state.history).toHaveLength(0);
    expect(state.errorCode).toBe('DOMAIN');
  });
  it('replay restores expression, angle mode, and original Ans context', () => {
    let s = compute('5');
    s = compute('Ans+2', s);
    const entry = s.history[0];
    s = compute('99', s);
    s = reduce(s, { type: 'settings', settings: { angleMode: 'RAD' } });
    s = reduce(s, { type: 'replay', entry });
    expect(s.answer).toBe('5');
    expect(s.settings.angleMode).toBe('DEG');
    expect(
      reduce(s, { type: 'evaluate', id: 'replay', now: Date.now() }).result,
    ).toBe('7');
  });
  it('caps history at 200, protects pins, and supports deleting/clearing', () => {
    let s = compute('0');
    s = reduce(s, { type: 'pin', id: '0' });
    for (let i = 1; i < 205; i++) s = compute(String(i), s);
    expect(s.history).toHaveLength(200);
    expect(s.history.some((e) => e.id === '0' && e.pinned)).toBe(true);
    s = reduce(s, { type: 'delete', id: '0' });
    expect(s.history).toHaveLength(199);
    expect(reduce(s, { type: 'clearHistory' }).history).toEqual([]);
  });
  it('persists memory, settings, answer, and history', () => {
    const s = reduce(compute('12'), {
      type: 'settings',
      settings: {
        angleMode: 'RAD',
        precision: 16,
        theme: 'light',
        animations: false,
      },
    });
    expect(saveScientificState({ ...s, memory: '12' })).toBe(true);
    const loaded = loadScientificState();
    expect(loaded.available).toBe(true);
    expect(loaded.data).toMatchObject({
      memory: '12',
      answer: '12',
      settings: {
        angleMode: 'RAD',
        precision: 16,
        theme: 'light',
        animations: false,
      },
    });
    expect(loaded.data.history).toHaveLength(1);
  });
  it('migrates without deleting v1, and clearing does not remigrate it', () => {
    const legacy = JSON.stringify([
      {
        id: 'old',
        operandA: '1',
        operator: '+',
        operandB: '2',
        result: '3',
        createdAt: '2026-11-17T15:00:00Z',
      },
    ]);
    localStorage.setItem(HISTORY_KEY, legacy);
    const loaded = loadScientificState();
    expect(loaded.migrated).toBe(true);
    expect(loaded.data.history[0]).toMatchObject({
      expression: '1+(2)',
      result: '3',
    });
    saveScientificState({ ...loaded.data, history: [] });
    expect(loadScientificState().data.history).toHaveLength(0);
    expect(localStorage.getItem(HISTORY_KEY)).toBe(legacy);
  });
  it('recovers from corrupt storage and unavailable storage', () => {
    localStorage.setItem(SCIENTIFIC_KEY, 'invalid');
    expect(loadScientificState().available).toBe(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw Error('denied');
    });
    expect(saveScientificState(initialScientificState)).toBe(false);
  });
  it('rejects invalid entries and deduplicates persisted IDs', () => {
    const s = compute('1+1');
    saveScientificState({
      ...s,
      history: [
        s.history[0],
        s.history[0],
        { ...s.history[0], id: 'bad', result: 'NaN' },
      ],
    });
    const loaded = loadScientificState();
    expect(loaded.available).toBe(false);
    expect(loaded.data.history).toHaveLength(1);
  });
});

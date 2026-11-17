import { parseExpression } from '../domain/scientific/parser';
import { ScientificDecimal } from '../domain/scientific/evaluator';
import type {
  ScientificHistoryEntry,
  Settings,
} from '../domain/scientific/types';
import {
  defaultSettings,
  HISTORY_LIMIT_V2,
  type PersistentState,
} from '../state/scientificReducer';
import { loadHistory } from './localHistoryRepository';
export const SCIENTIFIC_KEY = 'smartcalc.workspace.v2';
const defaults = (): PersistentState => ({
  settings: { ...defaultSettings },
  memory: '0',
  answer: '0',
  history: [],
});
function numeric(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length > 80 ||
    !/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)
  )
    return false;
  const n = new ScientificDecimal(value);
  return n.isFinite() && n.abs().lte('1e1000');
}
function historyEntry(value: unknown): value is ScientificHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<ScientificHistoryEntry>;
  if (
    typeof e.id !== 'string' ||
    !e.id ||
    e.id.length > 100 ||
    typeof e.expression !== 'string' ||
    !numeric(e.result) ||
    !numeric(e.answerContext) ||
    (e.angleMode !== 'DEG' && e.angleMode !== 'RAD') ||
    typeof e.createdAt !== 'number' ||
    !Number.isFinite(e.createdAt) ||
    e.createdAt < 0 ||
    e.createdAt > 8640000000000000 ||
    typeof e.pinned !== 'boolean'
  )
    return false;
  try {
    parseExpression(e.expression);
    return true;
  } catch {
    return false;
  }
}
function settings(value: unknown): value is Settings {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<Settings>;
  return (
    (s.angleMode === 'DEG' || s.angleMode === 'RAD') &&
    [8, 12, 16].includes(s.precision ?? 0) &&
    ['dark', 'light'].includes(s.theme ?? '') &&
    typeof s.animations === 'boolean' &&
    ['standard', 'scientific'].includes(s.mode ?? '')
  );
}
export function loadScientificState(): {
  data: PersistentState;
  available: boolean;
  migrated: boolean;
} {
  try {
    const raw = localStorage.getItem(SCIENTIFIC_KEY);
    if (raw === null) {
      const legacy = loadHistory();
      const data = defaults();
      data.history = legacy.entries.map((e) => ({
        id: e.id,
        expression: `${e.operandA}${e.operator}(${e.operandB})`,
        result: e.result,
        angleMode: 'DEG',
        createdAt: Date.parse(e.createdAt),
        pinned: false,
        answerContext: '0',
      }));
      return {
        data,
        available: legacy.available,
        migrated: data.history.length > 0,
      };
    }
    if (raw.length > 600000) throw Error('Storage too large');
    const data = JSON.parse(raw);
    if (
      !data ||
      data.version !== 2 ||
      !settings(data.settings) ||
      !numeric(data.memory) ||
      !numeric(data.answer) ||
      !Array.isArray(data.history)
    )
      throw Error('Invalid saved state');
    const ids = new Set<string>();
    const valid = data.history
      .filter(historyEntry)
      .filter((e: ScientificHistoryEntry) => {
        if (ids.has(e.id)) return false;
        ids.add(e.id);
        return true;
      });
    const history = valid
      .sort(
        (a: ScientificHistoryEntry, b: ScientificHistoryEntry) =>
          b.createdAt - a.createdAt,
      )
      .slice(0, HISTORY_LIMIT_V2);
    return {
      data: {
        settings: data.settings,
        memory: data.memory,
        answer: data.answer,
        history,
      },
      available: valid.length === data.history.length,
      migrated: false,
    };
  } catch {
    return { data: defaults(), available: false, migrated: false };
  }
}
export function saveScientificState(data: PersistentState): boolean {
  try {
    localStorage.setItem(
      SCIENTIFIC_KEY,
      JSON.stringify({
        version: 2,
        ...data,
        history: data.history.slice(0, HISTORY_LIMIT_V2),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
export function exportHistory(entries: ScientificHistoryEntry[]) {
  const blob = new Blob(
    [
      JSON.stringify(
        { version: 2, exportedAt: new Date().toISOString(), history: entries },
        null,
        2,
      ),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'smartcalc-history.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

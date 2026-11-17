import {
  evaluateExpression,
  ScientificDecimal,
} from '../domain/scientific/evaluator';
import type {
  ErrorCode,
  ScientificHistoryEntry,
  Settings,
} from '../domain/scientific/types';
export interface PersistentState {
  settings: Settings;
  memory: string;
  answer: string;
  history: ScientificHistoryEntry[];
}
export interface ScientificState extends PersistentState {
  expression: string;
  result: string;
  phase: 'editing' | 'result';
  error: string;
  errorCode: ErrorCode | null;
}
export const defaultSettings: Settings = {
  angleMode: 'DEG',
  precision: 12,
  theme: 'dark',
  animations: true,
  mode: 'scientific',
};
export const initialScientificState: ScientificState = {
  settings: defaultSettings,
  memory: '0',
  answer: '0',
  history: [],
  expression: '',
  result: '0',
  phase: 'editing',
  error: '',
  errorCode: null,
};
export const HISTORY_LIMIT_V2 = 200;
export type ScientificAction =
  | { type: 'edit'; expression: string }
  | { type: 'insert'; text: string; start?: number; end?: number }
  | { type: 'evaluate'; id: string; now: number }
  | { type: 'clear' | 'backspace' | 'sign' }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'memory'; command: 'MC' | 'MR' | 'MS' | 'M+' | 'M-' }
  | { type: 'replay'; entry: ScientificHistoryEntry }
  | { type: 'pin' | 'delete'; id: string }
  | { type: 'clearHistory' };
const editing = { error: '', errorCode: null, phase: 'editing' as const };
export function scientificReducer(
  state: ScientificState,
  action: ScientificAction,
): ScientificState {
  switch (action.type) {
    case 'edit':
      return action.expression.length > 512
        ? { ...state, error: 'Use at most 512 characters.', errorCode: 'LIMIT' }
        : { ...state, ...editing, expression: action.expression };
    case 'insert': {
      const continues =
        /^[+*/^!%]|^ mod /.test(action.text) || action.text === '-';
      const source =
        state.phase === 'result' ? (continues ? 'Ans' : '') : state.expression;
      const start =
        state.phase === 'result'
          ? source.length
          : (action.start ?? source.length);
      const end = state.phase === 'result' ? start : (action.end ?? start);
      return scientificReducer(state, {
        type: 'edit',
        expression: source.slice(0, start) + action.text + source.slice(end),
      });
    }
    case 'clear':
      return { ...state, ...editing, expression: '', result: '0' };
    case 'backspace':
      return {
        ...state,
        ...editing,
        expression:
          state.phase === 'result' ? '' : state.expression.slice(0, -1),
      };
    case 'sign':
      return {
        ...state,
        ...editing,
        expression:
          state.phase === 'result'
            ? '-Ans'
            : state.expression.startsWith('-(') &&
                state.expression.endsWith(')')
              ? state.expression.slice(2, -1)
              : state.expression
                ? `-(${state.expression})`
                : '-',
      };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'evaluate': {
      if (state.phase === 'result') return state;
      const evaluated = evaluateExpression(state.expression, {
        angleMode: state.settings.angleMode,
        answer: state.answer,
      });
      if (!evaluated.success)
        return {
          ...state,
          error: evaluated.error.message,
          errorCode: evaluated.error.code,
        };
      const entry: ScientificHistoryEntry = {
        id: action.id,
        createdAt: action.now,
        expression: state.expression,
        result: evaluated.value,
        angleMode: state.settings.angleMode,
        pinned: false,
        answerContext: state.answer,
      };
      // Pins survive normal eviction; if all 200 are pinned, retain the newest 199 pins plus this calculation.
      const history = [entry, ...state.history];
      if (history.length > HISTORY_LIMIT_V2) {
        let index = history.length - 1;
        while (index > 1 && history[index].pinned) index--;
        if (history[index].pinned) index = history.length - 1;
        history.splice(index, 1);
      }
      return {
        ...state,
        result: evaluated.value,
        answer: evaluated.value,
        phase: 'result',
        error: '',
        errorCode: null,
        history,
      };
    }
    case 'memory': {
      if (action.command === 'MC') return { ...state, memory: '0' };
      if (action.command === 'MR')
        return scientificReducer(state, {
          type: 'insert',
          text: `(${state.memory})`,
        });
      const evaluated =
        state.phase === 'result'
          ? { success: true as const, value: state.result }
          : evaluateExpression(state.expression || '0', {
              angleMode: state.settings.angleMode,
              answer: state.answer,
            });
      if (!evaluated.success)
        return {
          ...state,
          error: evaluated.error.message,
          errorCode: evaluated.error.code,
        };
      const memory =
        action.command === 'MS'
          ? evaluated.value
          : (action.command === 'M+'
              ? new ScientificDecimal(state.memory).plus(evaluated.value)
              : new ScientificDecimal(state.memory).minus(evaluated.value)
            ).toString();
      if (
        !new ScientificDecimal(memory).isFinite() ||
        new ScientificDecimal(memory).abs().gt('1e1000')
      )
        return {
          ...state,
          error: 'Memory exceeds the supported range.',
          errorCode: 'LIMIT',
        };
      return { ...state, memory, error: '', errorCode: null };
    }
    case 'replay':
      return {
        ...state,
        ...editing,
        expression: action.entry.expression,
        answer: action.entry.answerContext,
        settings: { ...state.settings, angleMode: action.entry.angleMode },
      };
    case 'pin':
      return {
        ...state,
        history: state.history.map((e) =>
          e.id === action.id ? { ...e, pinned: !e.pinned } : e,
        ),
      };
    case 'delete':
      return {
        ...state,
        history: state.history.filter((e) => e.id !== action.id),
      };
    case 'clearHistory':
      return { ...state, history: [] };
  }
}

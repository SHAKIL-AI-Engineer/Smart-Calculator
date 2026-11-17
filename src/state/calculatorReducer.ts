import { calculate } from '../domain/arithmetic';
import type { Calculation, Operator } from '../domain/types';
import { validateOperand } from '../domain/validation';
export type Phase = 'first' | 'operator' | 'second' | 'result';
export interface CalculatorState {
  input: string;
  operandA: string;
  operator: Operator | null;
  phase: Phase;
  error: string;
  completed: Calculation | null;
  revision: number;
}
export type Action =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' | 'clear' | 'backspace' | 'sign' };
export const initialState: CalculatorState = {
  input: '0',
  operandA: '',
  operator: null,
  phase: 'first',
  error: '',
  completed: null,
  revision: 0,
};
export function calculatorReducer(
  state: CalculatorState,
  action: Action,
): CalculatorState {
  if (action.type === 'clear')
    return { ...initialState, revision: state.revision };
  if (action.type === 'equals') {
    if (state.phase === 'result') return state;
    if (!state.operator || state.phase !== 'second')
      return { ...state, error: 'Enter two numbers and choose an operator.' };
    const result = calculate(state.operandA, state.operator, state.input);
    if (!result.success) return { ...state, error: result.error };
    return {
      ...state,
      input: result.value,
      phase: 'result',
      error: '',
      revision: state.revision + 1,
      completed: {
        operandA: state.operandA,
        operator: state.operator,
        operandB: state.input,
        result: result.value,
      },
    };
  }
  if (action.type === 'operator') {
    if (state.phase === 'second')
      return {
        ...state,
        error: 'Press equals to finish this calculation first.',
      };
    if (!validateOperand(state.input))
      return {
        ...state,
        error:
          'This result exceeds the 16-digit input limit. Press AC to start again.',
      };
    return {
      ...state,
      operandA: state.input,
      operator: action.operator,
      phase: 'operator',
      error: '',
      completed: null,
    };
  }
  const fresh = state.phase === 'result';
  const waiting = state.phase === 'operator';
  let input = fresh || waiting ? '0' : state.input;
  if (action.type === 'digit') {
    if (!/^\d$/.test(action.digit)) return state;
    input =
      input === '0'
        ? action.digit
        : input === '-0'
          ? `-${action.digit}`
          : input + action.digit;
  } else if (action.type === 'decimal') {
    if (input.includes('.')) return state;
    input += '.';
  } else if (action.type === 'sign') {
    // Sign changes after equals start a new first operand using the result.
    input = fresh ? state.input : input;
    input = input.startsWith('-') ? input.slice(1) : `-${input}`;
  } else if (action.type === 'backspace') {
    input = input.slice(0, -1);
    if (!input || input === '-') input = '0';
  }
  if (!validateOperand(input))
    return {
      ...state,
      error: 'Limit: 16 significant digits and 10 decimal places.',
    };
  return {
    ...(fresh ? { ...initialState, revision: state.revision } : state),
    input,
    phase: fresh ? 'first' : waiting ? 'second' : state.phase,
    error: '',
    completed: null,
  };
}

import { describe, expect, it } from 'vitest';
import {
  calculatorReducer as reduce,
  initialState,
  type Action,
  type CalculatorState,
} from '../state/calculatorReducer';
function run(actions: Action[], start: CalculatorState = initialState) {
  return actions.reduce(reduce, start);
}
const digits = (text: string): Action[] =>
  [...text].map((digit) =>
    digit === '.' ? { type: 'decimal' } : { type: 'digit', digit },
  );
const sum: Action[] = [
  ...digits('0.1'),
  { type: 'operator', operator: '+' },
  ...digits('0.2'),
  { type: 'equals' },
];
describe('calculator transitions', () => {
  it('calculates a decimal sum', () =>
    expect(run(sum)).toMatchObject({
      input: '0.3',
      phase: 'result',
      revision: 1,
    }));
  it('ignores duplicate decimal points', () =>
    expect(
      run([...digits('1.'), { type: 'decimal' }, ...digits('5')]).input,
    ).toBe('1.5'));
  it('replaces repeated operators before the second operand', () =>
    expect(
      run([
        ...digits('5'),
        { type: 'operator', operator: '+' },
        { type: 'operator', operator: '*' },
        ...digits('3'),
        { type: 'equals' },
      ]).input,
    ).toBe('15'));
  it('requires a second operand', () =>
    expect(
      run([
        ...digits('5'),
        { type: 'operator', operator: '+' },
        { type: 'equals' },
      ]).error,
    ).toContain('two numbers'));
  it('requires equals before a third operator', () =>
    expect(
      run([
        ...digits('5'),
        { type: 'operator', operator: '+' },
        ...digits('3'),
        { type: 'operator', operator: '*' },
      ]).error,
    ).toContain('equals'));
  it('does not repeat equals or duplicate completion', () => {
    const result = run(sum);
    expect(reduce(result, { type: 'equals' })).toBe(result);
  });
  it('starts fresh after a result', () =>
    expect(run(digits('7'), run(sum))).toMatchObject({
      input: '7',
      phase: 'first',
      operator: null,
      completed: null,
    }));
  it('can reuse a result as the first operand', () =>
    expect(
      run(
        [
          { type: 'operator', operator: '*' },
          ...digits('3'),
          { type: 'equals' },
        ],
        run(sum),
      ).input,
    ).toBe('0.9'));
  it('backspaces safely through negative numbers', () =>
    expect(
      run([...digits('5'), { type: 'sign' }, { type: 'backspace' }]).input,
    ).toBe('0'));
  it('supports a negative second operand', () =>
    expect(
      run([
        ...digits('5'),
        { type: 'operator', operator: '+' },
        { type: 'sign' },
        ...digits('3'),
        { type: 'equals' },
      ]).input,
    ).toBe('2'));
  it('keeps the previous value when an input limit is exceeded', () =>
    expect(run(digits('12345678901234567'))).toMatchObject({
      input: '1234567890123456',
      error: expect.stringContaining('Limit'),
    }));
  it('clears all calculation state', () =>
    expect(reduce(run(sum), { type: 'clear' })).toEqual({
      ...initialState,
      revision: 1,
    }));
  it('can correct a zero divisor after an error', () =>
    expect(
      run([
        ...digits('5'),
        { type: 'operator', operator: '/' },
        ...digits('0'),
        { type: 'equals' },
        ...digits('2'),
        { type: 'equals' },
      ]).input,
    ).toBe('2.5'));
});

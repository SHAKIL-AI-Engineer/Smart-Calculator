import { describe, it, expect } from 'vitest';
import {
  evaluateExpression,
  formatScientific,
} from '../domain/scientific/evaluator';
import { parseExpression } from '../domain/scientific/parser';
import type { AngleMode } from '../domain/scientific/types';
function answer(
  expression: string,
  angleMode: AngleMode = 'DEG',
  previous = '0',
) {
  const result = evaluateExpression(expression, {
    angleMode,
    answer: previous,
  });
  if (!result.success) throw result.error;
  return formatScientific(result.value, 16);
}
describe('scientific expressions', () => {
  it.each([
    ['2+3*4', '14'],
    ['(2+3)*4', '20'],
    ['2^3^2', '512'],
    ['-2^2', '-4'],
    ['(-2)^2', '4'],
    ['2^-2', '0.25'],
    ['1--2', '3'],
    ['0.1+0.2', '0.3'],
    ['5!', '120'],
    ['0!', '1'],
    ['3!^2', '36'],
    ['200*10%', '20'],
    ['200+10%', '200.1'],
    ['17 mod 5', '2'],
    ['sqrt(81)', '9'],
    ['cbrt(-27)', '-3'],
    ['root(27,3)', '3'],
    ['root(-32,5)', '-2'],
    ['root(4,-2)', '0.5'],
    ['root(0,2)', '0'],
    ['sin(30)', '0.5'],
    ['cos(60)', '0.5'],
    ['tan(45)', '1'],
    ['sin(180)', '0'],
    ['cos(90)', '0'],
    ['sin(-90)', '-1'],
    ['asin(0.5)', '30'],
    ['acos(0.5)', '60'],
    ['atan(1)', '45'],
    ['log(1000)', '3'],
    ['ln(e)', '1'],
    ['exp(1)', '2.718281828459045'],
    ['square(12)', '144'],
    ['cube(3)', '27'],
    ['pow10(3)', '1000'],
    ['inv(4)', '0.25'],
    ['abs(-7)', '7'],
    ['floor(-1.2)', '-2'],
    ['ceil(-1.2)', '-1'],
    ['round(-1.5)', '-2'],
    ['trunc(-1.9)', '-1'],
    ['sign(-23)', '-1'],
    ['sqrt(square(3)+square(4))', '5'],
    ['1e3+2e-3', '1000.002'],
    ['2×3−1÷2', '5.5'],
    ['√(81)+π-pi', '9'],
  ])('%s = %s', (expression, value) => expect(answer(expression)).toBe(value));
  it('supports radians and nested inverse trigonometry', () => {
    expect(answer('sin(pi/2)', 'RAD')).toBe('1');
    expect(answer('sin(asin(0.5))', 'RAD')).toBe('0.5');
    expect(answer('tan(pi)', 'RAD')).toBe('0');
  });
  it('retains very small nonzero angles', () => {
    const result = evaluateExpression('sin(1e-30)');
    expect(result.success && result.value).not.toBe('0');
  });
  it('uses the supplied previous answer context', () =>
    expect(answer('Ans*2', 'DEG', '7.5')).toBe('15'));
  it('keeps 24 internal digits and formats presentation independently', () => {
    const result = evaluateExpression('1/3');
    expect(result).toEqual({
      success: true,
      value: '0.333333333333333333333333',
    });
    if (result.success) {
      expect(formatScientific(result.value, 8)).toBe('0.33333333');
      expect(formatScientific(result.value, 12)).toBe('0.333333333333');
      expect(formatScientific(result.value, 16)).toBe('0.3333333333333333');
    }
  });
  it('parses exponentiation as right-associative', () =>
    expect(parseExpression('2^3^2')).toMatchObject({
      kind: 'binary',
      op: '^',
      right: { kind: 'binary', op: '^' },
    }));
  it.each([
    '10/0',
    'inv(0)',
    '5 mod 0',
    'sqrt(-9)',
    'log(0)',
    'ln(-1)',
    'asin(2)',
    'acos(-2)',
    'tan(90)',
    'tan(270)',
    'root(-4,2)',
    'root(4,0)',
    'root(0,-2)',
    '2^1001',
    '(-2)^0.5',
    '0^0',
    '201!',
    '(-1)!',
    '1.5!',
    'foo(1)',
    'sin(1,2)',
    'root(3)',
    '1e1001',
    '1e-1001',
    '1234567890123456789012345',
  ])('rejects invalid real calculation %s', (expression) =>
    expect(evaluateExpression(expression).success).toBe(false),
  );
  it.each([
    '',
    '1+',
    '1..2',
    '2(3)',
    'sin()',
    '(1+2',
    '1,2',
    'alert(1)',
    'window.location',
    '2;3',
    '2**3',
    '1 constructor 2',
  ])('rejects malformed syntax %j', (expression) =>
    expect(evaluateExpression(expression).success).toBe(false),
  );
  it('limits length, token count, and nesting', () => {
    expect(evaluateExpression('1'.repeat(513)).success).toBe(false);
    expect(evaluateExpression(Array(140).fill('1').join('+')).success).toBe(
      false,
    );
    expect(
      evaluateExpression('('.repeat(34) + '1' + ')'.repeat(34)).success,
    ).toBe(false);
  });
  it('returns typed failures', () => {
    const result = evaluateExpression('1/0');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('DIVISION_BY_ZERO');
  });
});

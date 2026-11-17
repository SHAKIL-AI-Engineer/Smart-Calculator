import { describe, expect, it } from 'vitest';
import { calculate } from '../domain/arithmetic';
import { validateOperand } from '../domain/validation';
import type { Operator } from '../domain/types';
describe('decimal arithmetic and policy', () => {
  it.each<[string, Operator, string, string]>([
    ['10', '+', '5', '15'],
    ['-10', '-', '-15', '5'],
    ['12', '*', '4', '48'],
    ['100', '/', '4', '25'],
    ['0.1', '+', '0.2', '0.3'],
    ['10', '/', '3', '3.3333333333'],
    ['2', '/', '3', '0.6666666667'],
    ['-5', '*', '3', '-15'],
    ['0005', '+', '2', '7'],
    ['-0', '*', '1', '0'],
    ['123', '*', '0', '0'],
    ['0.0000000001', '*', '0.5', '0.0000000001'],
    ['-0.0000000001', '*', '0.5', '-0.0000000001'],
    ['9999999999999999', '-', '1', '9999999999999998'],
    ['0.0000000001', '*', '0.0000000001', '0'],
    ['9999999999999999', '*', '1', '9999999999999999'],
  ])('%s %s %s = %s', (a, op, b, value) =>
    expect(calculate(a, op, b)).toEqual({ success: true, value }),
  );
  it.each(['0', '-0', '0.000'])('rejects division by %s', (zero) =>
    expect(calculate('10', '/', zero)).toEqual({
      success: false,
      error: 'Cannot divide by zero.',
    }),
  );
  it('rejects overflow', () =>
    expect(calculate('9999999999999999', '+', '1')).toEqual({
      success: false,
      error: 'Result too large. Use smaller numbers.',
    }));
  it.each([
    '',
    '-',
    '.',
    'NaN',
    'Infinity',
    '1..5',
    '1e3',
    ' 1',
    '0x10',
    '1;alert(1)',
    '12345678901234567',
    '0.12345678901',
  ])('rejects %j', (value) => {
    expect(validateOperand(value)).toBe(false);
    expect(calculate(value, '+', '1').success).toBe(false);
  });
  it.each([
    '0',
    '-0',
    '0.',
    '9999999999999999',
    '0.0000000001',
    '-123456.1234567890',
  ])('accepts %s', (value) => expect(validateOperand(value)).toBe(true));
});

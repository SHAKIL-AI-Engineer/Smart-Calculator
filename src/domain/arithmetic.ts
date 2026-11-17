import Decimal from 'decimal.js';
import type { CalculationResult, Operator } from './types';
import { isOperator } from './types';
import { validateOperand } from './validation';
import { formatResult } from './formatting';
// Two operands have at most 16 significant digits each; 50 digits keep products exact.
const Exact = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
export const add = (a: string, b: string): string =>
  new Exact(a).plus(b).toFixed();
export const subtract = (a: string, b: string): string =>
  new Exact(a).minus(b).toFixed();
export const multiply = (a: string, b: string): string =>
  new Exact(a).times(b).toFixed();
export const divide = (a: string, b: string): string =>
  new Exact(a).div(b).toFixed();
const operations = { '+': add, '-': subtract, '*': multiply, '/': divide };
export function calculate(
  a: string,
  operator: Operator,
  b: string,
): CalculationResult {
  if (!validateOperand(a) || !validateOperand(b))
    return {
      success: false,
      error:
        'Enter valid numbers: up to 16 significant digits and 10 decimal places.',
    };
  if (!isOperator(operator))
    return { success: false, error: 'Choose a supported operator.' };
  if (operator === '/' && new Exact(b).isZero())
    return { success: false, error: 'Cannot divide by zero.' };
  const value = formatResult(new Exact(operations[operator](a, b)));
  if (value.replace('-', '').split('.')[0].length > 16)
    return { success: false, error: 'Result too large. Use smaller numbers.' };
  return { success: true, value };
}

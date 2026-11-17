export type Operator = '+' | '-' | '*' | '/';
export type CalculationResult =
  { success: true; value: string } | { success: false; error: string };
export interface Calculation {
  operandA: string;
  operator: Operator;
  operandB: string;
  result: string;
}
export interface HistoryEntry extends Calculation {
  id: string;
  createdAt: string;
}
export const operatorLabels: Record<Operator, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};
export function isOperator(value: unknown): value is Operator {
  return value === '+' || value === '-' || value === '*' || value === '/';
}

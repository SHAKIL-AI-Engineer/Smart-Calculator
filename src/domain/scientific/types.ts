export type AngleMode = 'DEG' | 'RAD';
export type Precision = 8 | 12 | 16;
export interface EvaluationContext {
  angleMode: AngleMode;
  answer: string;
}
export type ErrorCode = 'SYNTAX' | 'DOMAIN' | 'DIVISION_BY_ZERO' | 'LIMIT';
export class CalculationError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public position?: number,
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}
export type ExpressionResult =
  | { success: true; value: string }
  | { success: false; error: CalculationError };
export type Ast =
  | { kind: 'number'; value: string }
  | { kind: 'constant'; name: string }
  | { kind: 'unary'; op: string; argument: Ast }
  | { kind: 'binary'; op: string; left: Ast; right: Ast }
  | { kind: 'postfix'; op: string; argument: Ast }
  | { kind: 'call'; name: string; args: Ast[] };
export interface ScientificHistoryEntry {
  id: string;
  expression: string;
  result: string;
  angleMode: AngleMode;
  createdAt: number;
  pinned: boolean;
  answerContext: string;
}
export interface Settings {
  angleMode: AngleMode;
  precision: Precision;
  theme: 'dark' | 'light';
  animations: boolean;
  mode: 'standard' | 'scientific';
}

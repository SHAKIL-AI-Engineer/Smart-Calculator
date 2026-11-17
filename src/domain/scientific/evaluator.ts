import Decimal from 'decimal.js';
import { parseExpression } from './parser';
import {
  CalculationError,
  type Ast,
  type EvaluationContext,
  type ExpressionResult,
  type Precision,
} from './types';
export const ScientificDecimal = Decimal.clone({
  precision: 24,
  rounding: Decimal.ROUND_HALF_UP,
  maxE: 1000,
  minE: -1000,
});
const D = ScientificDecimal;
const pi = () => D.acos(-1);
const domain = (message: string): never => {
  throw new CalculationError('DOMAIN', message);
};
function checked(n: Decimal): Decimal {
  if (!n.isFinite() || n.abs().gt('1e1000'))
    throw new CalculationError(
      'LIMIT',
      'Result exceeds the supported range (±1e1000).',
    );
  return n;
}
function divide(a: Decimal, b: Decimal) {
  if (b.isZero())
    throw new CalculationError('DIVISION_BY_ZERO', 'Cannot divide by zero.');
  return a.div(b);
}
function power(a: Decimal, b: Decimal) {
  if (b.abs().gt(1000))
    throw new CalculationError(
      'LIMIT',
      'Power must be between −1000 and 1000.',
    );
  if (a.isZero() && b.lte(0)) domain('Zero requires a positive power.');
  if (a.isNegative() && !b.isInteger())
    domain('A negative base needs an integer power in real-number mode.');
  return checked(a.pow(b));
}
function root(x: Decimal, n: Decimal) {
  if (!n.isInteger() || n.isZero() || n.abs().gt(1000))
    domain('Root degree must be a non-zero integer from −1000 to 1000.');
  if (x.isNegative() && n.abs().mod(2).isZero())
    domain('An even root needs a non-negative value.');
  const value = x.isNegative()
    ? x.neg().pow(new D(1).div(n)).neg()
    : x.pow(new D(1).div(n));
  if (x.isZero() && n.isNegative())
    throw new CalculationError('DIVISION_BY_ZERO', 'Cannot divide by zero.');
  return checked(value);
}
function trig(name: string, x: Decimal, context: EvaluationContext) {
  const radians =
    context.angleMode === 'DEG'
      ? x.mod(360).times(pi()).div(180)
      : x.mod(pi().times(2));
  const cosine = radians.cos();
  if (name === 'tan' && cosine.abs().lt('1e-22'))
    domain('Tangent is undefined at this angle.');
  const value =
    name === 'sin' ? radians.sin() : name === 'cos' ? cosine : radians.tan();
  // Stabilize finite-precision π boundaries without erasing small nonzero angles.
  const quadrant = radians.div(pi().div(2)).toNearest(1);
  const onBoundary =
    (context.angleMode === 'DEG' && x.mod(90).isZero()) ||
    (!quadrant.isZero() &&
      radians
        .minus(quadrant.times(pi().div(2)))
        .abs()
        .lt('1e-22')) ||
    x.isZero();
  return onBoundary && value.abs().lt('1e-22') ? new D(0) : value;
}
export const functionNames = [
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'log',
  'ln',
  'sqrt',
  'cbrt',
  'root',
  'abs',
  'inv',
  'square',
  'cube',
  'pow10',
  'exp',
  'floor',
  'ceil',
  'round',
  'trunc',
  'sign',
] as const;
function call(
  name: string,
  args: Decimal[],
  context: EvaluationContext,
): Decimal {
  if (!(functionNames as readonly string[]).includes(name))
    domain(`Unknown function “${name}”.`);
  const count = name === 'root' ? 2 : 1;
  if (args.length !== count)
    domain(`${name} requires ${count} argument${count === 1 ? '' : 's'}.`);
  const [x, n] = args;
  if (['sin', 'cos', 'tan'].includes(name)) return trig(name, x, context);
  if (['asin', 'acos', 'atan'].includes(name)) {
    if (name !== 'atan' && x.abs().gt(1))
      domain(`${name} requires a value between −1 and 1.`);
    const radians =
      name === 'asin' ? x.asin() : name === 'acos' ? x.acos() : x.atan();
    return context.angleMode === 'DEG' ? radians.times(180).div(pi()) : radians;
  }
  switch (name) {
    case 'sqrt':
      if (x.isNegative()) domain('Square root requires a non-negative value.');
      return x.sqrt();
    case 'cbrt':
      return x.cbrt();
    case 'root':
      return root(x, n);
    case 'ln':
    case 'log':
      if (x.lte(0)) domain('Logarithms require a positive value.');
      return name === 'ln' ? x.ln() : x.log(10);
    case 'abs':
      return x.abs();
    case 'inv':
      return divide(new D(1), x);
    case 'square':
      return power(x, new D(2));
    case 'cube':
      return power(x, new D(3));
    case 'pow10':
      return power(new D(10), x);
    case 'exp':
      return power(D.exp(1), x);
    case 'floor':
      return x.floor();
    case 'ceil':
      return x.ceil();
    case 'round':
      return x.toDecimalPlaces(0, D.ROUND_HALF_UP);
    case 'trunc':
      return x.trunc();
    case 'sign':
      return new D(x.isZero() ? 0 : x.isNegative() ? -1 : 1);
    default:
      return domain('Unsupported function.');
  }
}
function evaluate(node: Ast, context: EvaluationContext): Decimal {
  let value: Decimal;
  switch (node.kind) {
    case 'number':
      {
        const literal = new Decimal(node.value);
        if (
          !literal.isFinite() ||
          (!literal.isZero() &&
            (literal.e < -1000 || literal.abs().gt('1e1000')))
        )
          throw new CalculationError(
            'LIMIT',
            'Number exceeds the supported range.',
          );
        value = new D(node.value);
      }
      break;
    case 'constant':
      value =
        node.name === 'pi'
          ? pi()
          : node.name === 'e'
            ? D.exp(1)
            : new D(context.answer);
      break;
    case 'unary':
      value = evaluate(node.argument, context);
      if (node.op === '-') value = value.neg();
      break;
    case 'call':
      value = call(
        node.name,
        node.args.map((arg) => evaluate(arg, context)),
        context,
      );
      break;
    case 'postfix': {
      const x = evaluate(node.argument, context);
      if (node.op === '%') {
        value = x.div(100);
        break;
      }
      if (!x.isInteger() || x.isNegative() || x.gt(200))
        domain('Factorial requires an integer from 0 to 200.');
      value = new D(1);
      for (let i = 2; i <= x.toNumber(); i++) value = value.times(i);
      break;
    }
    case 'binary': {
      const a = evaluate(node.left, context),
        b = evaluate(node.right, context);
      switch (node.op) {
        case '+':
          value = a.plus(b);
          break;
        case '-':
          value = a.minus(b);
          break;
        case '*':
          value = a.times(b);
          break;
        case '/':
          value = divide(a, b);
          break;
        case '^':
          value = power(a, b);
          break;
        case 'mod':
          if (b.isZero())
            throw new CalculationError(
              'DIVISION_BY_ZERO',
              'Cannot take modulo by zero.',
            );
          value = a.mod(b);
          break;
        default:
          return domain('Unsupported operation.');
      }
    }
  }
  return checked(value);
}
export function evaluateExpression(
  expression: string,
  context: EvaluationContext = { angleMode: 'DEG', answer: '0' },
): ExpressionResult {
  try {
    if (
      !/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(context.answer) ||
      context.answer.length > 80
    )
      domain('Previous answer is invalid.');
    const value = evaluate(parseExpression(expression), context);
    return { success: true, value: value.isZero() ? '0' : value.toString() };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof CalculationError
          ? error
          : new CalculationError(
              'DOMAIN',
              'This expression cannot be evaluated as a real number.',
            ),
    };
  }
}
export function formatScientific(value: string, precision: Precision): string {
  const rounded = new D(value).toSignificantDigits(precision, D.ROUND_HALF_UP);
  return rounded.isZero() ? '0' : rounded.toString();
}

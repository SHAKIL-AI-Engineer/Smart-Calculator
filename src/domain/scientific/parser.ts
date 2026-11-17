import { tokenize } from './tokenizer';
import { CalculationError, type Ast } from './types';
export function parseExpression(source: string): Ast {
  const tokens = tokenize(source);
  let cursor = 0;
  const peek = () => tokens[cursor];
  const take = () => tokens[cursor++];
  function expected(text: string) {
    if (peek().text !== text)
      throw new CalculationError(
        'SYNTAX',
        `Expected “${text}”.`,
        peek().position,
      );
    take();
  }
  function expression(min = 0, depth = 0): Ast {
    if (depth > 32)
      throw new CalculationError('LIMIT', 'Use at most 32 levels of nesting.');
    const token = take();
    let node: Ast;
    if (token.kind === 'number') node = { kind: 'number', value: token.text };
    else if (token.text === '+' || token.text === '-')
      node = {
        kind: 'unary',
        op: token.text,
        argument: expression(30, depth + 1),
      };
    else if (token.text === '(') {
      node = expression(0, depth + 1);
      expected(')');
    } else if (token.kind === 'name' && ['pi', 'e', 'ans'].includes(token.text))
      node = { kind: 'constant', name: token.text };
    else if (token.kind === 'name' && token.text !== 'mod') {
      expected('(');
      const args: Ast[] = [expression(0, depth + 1)];
      while (peek().text === ',') {
        take();
        args.push(expression(0, depth + 1));
      }
      expected(')');
      node = { kind: 'call', name: token.text, args };
    } else
      throw new CalculationError(
        'SYNTAX',
        token.kind === 'end'
          ? 'Enter a complete expression.'
          : `Unexpected “${token.text}”.`,
        token.position,
      );
    while (true) {
      const op = peek().text;
      if ((op === '!' || op === '%') && 50 >= min) {
        take();
        node = { kind: 'postfix', op, argument: node };
        continue;
      }
      const binding: Record<string, [number, number]> = {
        '+': [10, 11],
        '-': [10, 11],
        '*': [20, 21],
        '/': [20, 21],
        mod: [20, 21],
        '^': [40, 40],
      };
      const powers = Object.hasOwn(binding, op) ? binding[op] : undefined;
      if (!powers || powers[0] < min) break;
      take();
      node = {
        kind: 'binary',
        op,
        left: node,
        right: expression(powers[1], depth + 1),
      };
    }
    return node;
  }
  const ast = expression();
  if (peek().kind !== 'end')
    throw new CalculationError(
      'SYNTAX',
      `Unexpected “${peek().text}”. Use an operator between values.`,
      peek().position,
    );
  return ast;
}

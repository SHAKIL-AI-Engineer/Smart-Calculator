import { CalculationError } from './types';
export interface Token {
  kind: 'number' | 'name' | 'symbol' | 'end';
  text: string;
  position: number;
}
export const MAX_EXPRESSION_LENGTH = 512;
export function tokenize(source: string): Token[] {
  if (source.length > MAX_EXPRESSION_LENGTH)
    throw new CalculationError('LIMIT', 'Use at most 512 characters.');
  const tokens: Token[] = [];
  let position = 0;
  while (position < source.length) {
    const rest = source.slice(position);
    if (/^\s/.test(rest)) {
      position++;
      continue;
    }
    const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (number) {
      const significant = number[0]
        .split(/[eE]/)[0]
        .replace('.', '')
        .replace(/^0+/, '');
      if (significant.length > 24)
        throw new CalculationError(
          'LIMIT',
          'Numbers may contain at most 24 significant digits.',
          position,
        );
      tokens.push({ kind: 'number', text: number[0], position });
      position += number[0].length;
    } else {
      const name = rest.match(/^[a-zA-Z][a-zA-Z0-9]*/);
      if (name) {
        tokens.push({ kind: 'name', text: name[0].toLowerCase(), position });
        position += name[0].length;
      } else if ('+-*/^()!,%×÷−π√'.includes(rest[0])) {
        const text =
          (
            { '×': '*', '÷': '/', '−': '-', π: 'pi', '√': 'sqrt' } as Record<
              string,
              string
            >
          )[rest[0]] ?? rest[0];
        tokens.push({
          kind: text === 'pi' || text === 'sqrt' ? 'name' : 'symbol',
          text,
          position,
        });
        position++;
      } else
        throw new CalculationError(
          'SYNTAX',
          `Unsupported character “${rest[0]}”.`,
          position,
        );
    }
    if (tokens.length > 256)
      throw new CalculationError(
        'LIMIT',
        'Expression is too complex (maximum 256 tokens).',
      );
  }
  tokens.push({ kind: 'end', text: '', position });
  return tokens;
}

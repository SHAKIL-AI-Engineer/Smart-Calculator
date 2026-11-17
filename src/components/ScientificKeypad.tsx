interface Props {
  scientific: boolean;
  onInsert: (text: string) => void;
  onAction: (action: 'clear' | 'backspace' | 'sign' | 'evaluate') => void;
}
const scientificKeys = [
  ['sin', 'sin('],
  ['cos', 'cos('],
  ['tan', 'tan('],
  ['sin⁻¹', 'asin('],
  ['cos⁻¹', 'acos('],
  ['tan⁻¹', 'atan('],
  ['log', 'log('],
  ['ln', 'ln('],
  ['√', 'sqrt('],
  ['x²', 'square('],
  ['x³', 'cube('],
  ['xʸ', '^'],
  ['10ˣ', 'pow10('],
  ['eˣ', 'exp('],
  ['∛', 'cbrt('],
  ['ʸ√x', 'root('],
  ['|x|', 'abs('],
  ['1/x', 'inv('],
  ['x!', '!'],
  ['mod', ' mod '],
  ['π', 'pi'],
  ['e', 'e'],
  ['(', '('],
  [')', ')'],
  [',', ','],
  ['floor', 'floor('],
  ['ceil', 'ceil('],
  ['round', 'round('],
  ['trunc', 'trunc('],
  ['sign', 'sign('],
] as const;
const labels: Record<string, string> = {
  'sin⁻¹': 'Inverse sine',
  'cos⁻¹': 'Inverse cosine',
  'tan⁻¹': 'Inverse tangent',
  '√': 'Square root',
  'x²': 'Square',
  'x³': 'Cube',
  xʸ: 'Power',
  '10ˣ': 'Ten to the power',
  eˣ: 'Exponential',
  '∛': 'Cube root',
  'ʸ√x': 'Nth root',
  '|x|': 'Absolute value',
  '1/x': 'Reciprocal',
  'x!': 'Factorial',
  π: 'Pi',
  e: 'Euler constant',
  '(': 'Open parenthesis',
  ')': 'Close parenthesis',
  mod: 'Modulo',
  ',': 'Argument separator',
};
export function ScientificKeypad({ scientific, onInsert, onAction }: Props) {
  return (
    <div className="pro-keypad">
      {scientific && (
        <div
          className="science-keys"
          role="group"
          aria-label="Scientific functions"
        >
          {scientificKeys.map(([label, text]) => (
            <button
              className="pro-key pro-key--science"
              key={label}
              aria-label={labels[label] ?? label}
              onClick={() => onInsert(text)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="number-keys" role="group" aria-label="Number keypad">
        <button
          className="pro-key pro-key--clear"
          aria-label="All clear"
          onClick={() => onAction('clear')}
        >
          AC
        </button>
        <button
          className="pro-key pro-key--utility"
          aria-label="Toggle sign"
          onClick={() => onAction('sign')}
        >
          ±
        </button>
        <button
          className="pro-key pro-key--utility"
          aria-label="Percentage"
          onClick={() => onInsert('%')}
        >
          %
        </button>
        <button
          className="pro-key pro-key--operator"
          aria-label="Divide"
          onClick={() => onInsert('/')}
        >
          ÷
        </button>
        {['7', '8', '9'].map((n) => (
          <button className="pro-key" key={n} onClick={() => onInsert(n)}>
            {n}
          </button>
        ))}
        <button
          className="pro-key pro-key--operator"
          aria-label="Multiply"
          onClick={() => onInsert('*')}
        >
          ×
        </button>
        {['4', '5', '6'].map((n) => (
          <button className="pro-key" key={n} onClick={() => onInsert(n)}>
            {n}
          </button>
        ))}
        <button
          className="pro-key pro-key--operator"
          aria-label="Subtract"
          onClick={() => onInsert('-')}
        >
          −
        </button>
        {['1', '2', '3'].map((n) => (
          <button className="pro-key" key={n} onClick={() => onInsert(n)}>
            {n}
          </button>
        ))}
        <button
          className="pro-key pro-key--operator"
          aria-label="Add"
          onClick={() => onInsert('+')}
        >
          +
        </button>
        <button
          className="pro-key pro-key--sub"
          onClick={() => onInsert('Ans')}
        >
          Ans
        </button>
        <button className="pro-key" onClick={() => onInsert('0')}>
          0
        </button>
        <button
          className="pro-key"
          aria-label="Decimal point"
          onClick={() => onInsert('.')}
        >
          .
        </button>
        <button
          className="pro-key pro-key--equals"
          aria-label="Equals"
          onClick={() => onAction('evaluate')}
        >
          =
        </button>
      </div>
      {scientific && (
        <p className="keypad-note">
          Functions use parentheses: <code>sin(30)</code> · nth root:{' '}
          <code>root(27,3)</code> · percentage divides by 100
        </p>
      )}
    </div>
  );
}

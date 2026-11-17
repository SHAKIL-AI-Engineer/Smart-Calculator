import type { Dispatch } from 'react';
import type { Action } from '../state/calculatorReducer';
import type { Operator } from '../domain/types';
import { operatorLabels } from '../domain/types';
import { CalculatorButton } from './CalculatorButton';
export function CalculatorKeypad({
  dispatch,
  selected,
}: {
  dispatch: Dispatch<Action>;
  selected: Operator | null;
}) {
  const digit = (n: string) => (
    <CalculatorButton
      key={n}
      onClick={() => dispatch({ type: 'digit', digit: n })}
    >
      {n}
    </CalculatorButton>
  );
  const operator = (op: Operator, name: string) => (
    <CalculatorButton
      key={op}
      tone="operator"
      aria-label={name}
      aria-pressed={selected === op}
      onClick={() => dispatch({ type: 'operator', operator: op })}
    >
      {operatorLabels[op]}
    </CalculatorButton>
  );
  return (
    <div className="keypad" role="group" aria-label="Calculator keypad">
      <CalculatorButton
        tone="utility"
        aria-label="All clear"
        onClick={() => dispatch({ type: 'clear' })}
      >
        AC
      </CalculatorButton>
      <CalculatorButton
        tone="utility"
        aria-label="Toggle sign"
        onClick={() => dispatch({ type: 'sign' })}
      >
        ±
      </CalculatorButton>
      <CalculatorButton
        tone="utility"
        aria-label="Backspace"
        onClick={() => dispatch({ type: 'backspace' })}
      >
        ⌫
      </CalculatorButton>
      {operator('/', 'Divide')}
      {['7', '8', '9'].map(digit)}
      {operator('*', 'Multiply')}
      {['4', '5', '6'].map(digit)}
      {operator('-', 'Subtract')}
      {['1', '2', '3'].map(digit)}
      {operator('+', 'Add')}
      <CalculatorButton
        wide
        onClick={() => dispatch({ type: 'digit', digit: '0' })}
      >
        0
      </CalculatorButton>
      <CalculatorButton
        aria-label="Decimal point"
        onClick={() => dispatch({ type: 'decimal' })}
      >
        .
      </CalculatorButton>
      <CalculatorButton
        tone="equals"
        aria-label="Equals"
        onClick={() => dispatch({ type: 'equals' })}
      >
        =
      </CalculatorButton>
    </div>
  );
}

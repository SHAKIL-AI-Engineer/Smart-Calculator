import type { CalculatorState } from '../state/calculatorReducer';
import { displayNumber } from '../domain/formatting';
import { operatorLabels } from '../domain/types';
export function CalculatorDisplay({ state }: { state: CalculatorState }) {
  const expression = state.completed
    ? `${displayNumber(state.completed.operandA)} ${operatorLabels[state.completed.operator]} ${displayNumber(state.completed.operandB)} =`
    : state.operator
      ? `${displayNumber(state.operandA)} ${operatorLabels[state.operator]}`
      : 'Ready when you are';
  return (
    <div className="display">
      <div className="display__meta">
        <span>STANDARD</span>
        <span className="precision">
          <i /> Decimal precision
        </span>
      </div>
      <div className="expression" aria-label="Expression">
        {expression}
      </div>
      <output
        className={state.input.length > 15 ? 'result result--small' : 'result'}
        aria-label="Calculator display"
        aria-live="off"
      >
        {displayNumber(state.input)}
      </output>
      <div
        className="display__status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.error ? (
          <span className="error">{state.error}</span>
        ) : state.phase === 'result' ? (
          `Result: ${displayNumber(state.input)}`
        ) : (
          'Two numbers. One clear answer.'
        )}
      </div>
    </div>
  );
}

import { useEffect, useReducer, useRef, useState } from 'react';
import {
  calculatorReducer,
  initialState,
  type Action,
} from '../state/calculatorReducer';
import { isOperator } from '../domain/types';
import {
  loadHistory,
  saveHistory,
  HISTORY_LIMIT,
} from '../storage/localHistoryRepository';
import { prependCalculation } from '../services/historyService';
import { CalculatorDisplay } from './CalculatorDisplay';
import { CalculatorKeypad } from './CalculatorKeypad';
import { HistoryPanel } from './HistoryPanel';
export function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [loaded] = useState(loadHistory);
  const [history, setHistory] = useState(loaded.entries);
  const [available, setAvailable] = useState(loaded.available);
  const handledRevision = useRef(0);
  const savedHistory = useRef(history);
  useEffect(() => {
    if (!state.completed || handledRevision.current === state.revision) return;
    handledRevision.current = state.revision;
    const [entry] = prependCalculation([], state.completed);
    setHistory((previous) => [entry, ...previous].slice(0, HISTORY_LIMIT));
  }, [state.completed, state.revision]);
  useEffect(() => {
    if (savedHistory.current === history) return;
    savedHistory.current = history;
    setAvailable(saveHistory(history));
  }, [history]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        event.isComposing
      )
        return;
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
      )
        return;
      // Enter activates a focused native button; do not also perform a calculation.
      if (
        event.key === 'Enter' &&
        event.target instanceof HTMLElement &&
        event.target.closest('button')
      )
        return;
      let action: Action | undefined;
      if (/^\d$/.test(event.key)) action = { type: 'digit', digit: event.key };
      else if (isOperator(event.key))
        action = { type: 'operator', operator: event.key };
      else if (event.key === '.') action = { type: 'decimal' };
      else if (event.key === '=' || event.key === 'Enter')
        action = { type: 'equals' };
      else if (event.key === 'Escape' || event.key === 'Delete')
        action = { type: 'clear' };
      else if (event.key === 'Backspace') action = { type: 'backspace' };
      else if (event.key.toLowerCase() === 'n') action = { type: 'sign' };
      if (action) {
        event.preventDefault();
        dispatch(action);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  return (
    <div className="workspace">
      <section className="calculator" aria-label="Standard calculator">
        <CalculatorDisplay state={state} />
        <CalculatorKeypad
          dispatch={dispatch}
          selected={
            state.phase === 'operator' || state.phase === 'second'
              ? state.operator
              : null
          }
        />
      </section>
      <HistoryPanel
        entries={history}
        available={available}
        onClear={() => setHistory([])}
      />
    </div>
  );
}

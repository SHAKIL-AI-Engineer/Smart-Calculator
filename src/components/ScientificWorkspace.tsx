import { useEffect, useReducer, useRef, useState } from 'react';
import { formatScientific } from '../domain/scientific/evaluator';
import {
  initialScientificState,
  scientificReducer,
  type ScientificAction,
} from '../state/scientificReducer';
import {
  loadScientificState,
  saveScientificState,
} from '../storage/scientificRepository';
import { ScientificKeypad } from './ScientificKeypad';
import { ScientificHistory } from './ScientificHistory';
import type { Precision } from '../domain/scientific/types';
export function ScientificWorkspace() {
  const [loaded] = useState(loadScientificState);
  const [state, dispatch] = useReducer(scientificReducer, {
    ...initialScientificState,
    ...loaded.data,
  });
  const [available, setAvailable] = useState(loaded.available);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const expressionRef = useRef<HTMLTextAreaElement>(null);
  const historyToggle = useRef<HTMLButtonElement>(null);
  const selection = useRef<{ start: number; end: number } | null>(null);
  useEffect(() => {
    setAvailable(
      saveScientificState({
        settings: state.settings,
        memory: state.memory,
        answer: state.answer,
        history: state.history,
      }),
    );
  }, [state.settings, state.memory, state.answer, state.history]);
  function evaluate() {
    dispatch({ type: 'evaluate', id: crypto.randomUUID(), now: Date.now() });
  }
  function insert(text: string) {
    const range = selection.current;
    if (/^[a-z]+[0-9]*\($/.test(text)) {
      const source = state.phase === 'result' ? 'Ans' : state.expression;
      const name = text.slice(0, -1);
      if (range && range.end > range.start && state.phase !== 'result') {
        const selected = source.slice(range.start, range.end);
        const wrapped = `${name}(${selected}${name === 'root' ? ',' : ')'}`;
        dispatch({
          type: 'insert',
          text: wrapped,
          start: range.start,
          end: range.end,
        });
        selection.current = null;
        return;
      }
      if (source && !/[+\-*/^(,]\s*$/.test(source)) {
        dispatch({
          type: 'edit',
          expression: `${name}(${source}${name === 'root' ? ',' : ')'}`,
        });
        selection.current = null;
        return;
      }
    }
    dispatch({ type: 'insert', text, start: range?.start, end: range?.end });
    if (range)
      selection.current = {
        start: range.start + text.length,
        end: range.start + text.length,
      };
  }
  function action(type: 'clear' | 'backspace' | 'sign' | 'evaluate') {
    selection.current = null;
    if (type === 'evaluate') evaluate();
    else dispatch({ type });
  }
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
        return;
      const target = event.target;
      const editable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'].includes(target.tagName));
      if (event.key === 'Escape') {
        if (showHistory) {
          setShowHistory(false);
          historyToggle.current?.focus();
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (!editable) {
          event.preventDefault();
          dispatch({ type: 'clear' });
        }
        return;
      }
      if (editable) return;
      if (
        event.key === 'Enter' &&
        target instanceof HTMLElement &&
        target.closest('button')
      )
        return;
      let next: ScientificAction | undefined;
      if (event.key === 'Enter' || event.key === '=')
        next = { type: 'evaluate', id: crypto.randomUUID(), now: Date.now() };
      else if (event.key === 'Backspace') next = { type: 'backspace' };
      else if (event.key === 'Delete') next = { type: 'clear' };
      else if (event.key === 'F9') next = { type: 'sign' };
      else if (/^[\da-zA-Z.+\-*/^()%!,]$/.test(event.key))
        next = { type: 'insert', text: event.key };
      if (next) {
        event.preventDefault();
        selection.current = null;
        dispatch(next);
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [showHistory, showSettings]);
  const result = formatScientific(state.result, state.settings.precision);
  function closeHistory() {
    setShowHistory(false);
    historyToggle.current?.focus();
  }
  return (
    <div
      className={`pro-app pro-app--${state.settings.theme} ${!state.settings.animations ? 'motion-off' : ''}`}
    >
      <header className="pro-header">
        <a className="pro-brand" href="./">
          <span className="pro-mark" aria-hidden="true">
            s<span>c</span>
          </span>
          SmartCalc <span className="pro-badge">PRO</span>
        </a>
        <div className="header-right">
          <span className="local-badge">
            <i /> All calculations stay local
          </span>
          <button
            className="icon-button"
            aria-label={`Use ${state.settings.theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={() =>
              dispatch({
                type: 'settings',
                settings: {
                  theme: state.settings.theme === 'dark' ? 'light' : 'dark',
                },
              })
            }
          >
            {state.settings.theme === 'dark' ? '☼' : '☾'}
          </button>
          <button
            className={`icon-button ${showSettings ? 'selected' : ''}`}
            aria-label="Settings"
            aria-expanded={showSettings}
            aria-controls="settings-panel"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙︎
          </button>
        </div>
      </header>
      <main className="pro-main">
        <div className="workspace-title">
          <div>
            <span className="section-kicker">THINK BIG. WORK IT OUT.</span>
            <h1>Your everyday, elevated.</h1>
            <p>A little more possibility in every calculation.</p>
          </div>
          <span className="edition">
            SCIENTIFIC EDITION <span>VERSION 2.0</span>
          </span>
        </div>
        {showSettings && (
          <section
            className="settings-panel"
            id="settings-panel"
            aria-label="Calculator settings"
          >
            <label>
              Result precision
              <select
                aria-label="Result precision"
                value={state.settings.precision}
                onChange={(e) =>
                  dispatch({
                    type: 'settings',
                    settings: {
                      precision: Number(e.target.value) as Precision,
                    },
                  })
                }
              >
                <option value={8}>8 significant digits</option>
                <option value={12}>12 significant digits</option>
                <option value={16}>16 significant digits</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={state.settings.animations}
                onChange={(e) =>
                  dispatch({
                    type: 'settings',
                    settings: { animations: e.target.checked },
                  })
                }
              />{' '}
              Enable animations
            </label>
            <p>
              24-digit internal precision · Real numbers · 512-character
              expressions
            </p>
          </section>
        )}
        {!available && (
          <p className="storage-banner" role="status">
            Browser storage is unavailable or damaged. You can keep calculating;
            changes may not survive a reload. Your v1 history backup is
            unchanged.
          </p>
        )}
        <div className="pro-workspace">
          <section
            className="pro-calculator"
            aria-label="Scientific calculator"
          >
            <div className="calculator-topbar">
              <div
                className="segmented"
                role="group"
                aria-label="Calculator mode"
              >
                {(['standard', 'scientific'] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={state.settings.mode === mode}
                    className={state.settings.mode === mode ? 'active' : ''}
                    onClick={() =>
                      dispatch({ type: 'settings', settings: { mode } })
                    }
                  >
                    {mode === 'standard' ? 'Standard' : 'Scientific'}
                  </button>
                ))}
              </div>
              <div className="calculator-topbar-right">
                <div
                  className="angle-toggle"
                  role="group"
                  aria-label="Angle mode"
                >
                  {(['DEG', 'RAD'] as const).map((angleMode) => (
                    <button
                      key={angleMode}
                      aria-pressed={state.settings.angleMode === angleMode}
                      className={
                        state.settings.angleMode === angleMode ? 'active' : ''
                      }
                      onClick={() =>
                        dispatch({ type: 'settings', settings: { angleMode } })
                      }
                    >
                      {angleMode}
                    </button>
                  ))}
                </div>
                <button
                  ref={historyToggle}
                  className="icon-button mobile-history-toggle"
                  aria-label="Open history"
                  aria-expanded={showHistory}
                  aria-controls="history-panel"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  ↶
                </button>
              </div>
            </div>
            <div
              className={`pro-display ${state.error ? 'pro-display--error' : ''}`}
            >
              <div className="display-topline">
                <span>
                  {state.settings.mode.toUpperCase()}{' '}
                  <span className="subtle-dot">·</span>{' '}
                  {state.settings.angleMode}
                </span>
                <span
                  title={`Memory: ${state.memory}`}
                  className={
                    state.memory !== '0'
                      ? 'memory-indicator active'
                      : 'memory-indicator'
                  }
                >
                  M {state.memory !== '0' ? '●' : '○'}
                </span>
              </div>
              <label className="sr-only" htmlFor="expression">
                Expression
              </label>
              <textarea
                ref={expressionRef}
                id="expression"
                className="expression-input"
                rows={2}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Enter an expression…"
                value={state.expression}
                maxLength={512}
                onChange={(e) =>
                  dispatch({ type: 'edit', expression: e.target.value })
                }
                onSelect={(e) => {
                  selection.current = {
                    start: e.currentTarget.selectionStart,
                    end: e.currentTarget.selectionEnd,
                  };
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === '=') {
                    e.preventDefault();
                    action('evaluate');
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    action('clear');
                  } else if (e.key === 'F9') {
                    e.preventDefault();
                    action('sign');
                  }
                }}
                aria-describedby="expression-help calculation-status"
                aria-invalid={Boolean(state.error)}
              />
              <div className="pro-result-row">
                <span className="result-equals" aria-hidden="true">
                  =
                </span>
                <output
                  key={state.result}
                  className={`pro-result ${result.length > 15 ? 'pro-result--long' : ''}`}
                  aria-label="Calculator display"
                  aria-live="off"
                >
                  {result}
                </output>
              </div>
              <div className="display-bottomline">
                <span id="expression-help">
                  {state.phase === 'result'
                    ? 'Calculated with 24-digit precision'
                    : 'Write it your way. Enter to calculate.'}
                </span>
                <button
                  className="icon-button backspace-button"
                  aria-label="Backspace"
                  onClick={() => action('backspace')}
                >
                  ⌫
                </button>
              </div>
              <p
                id="calculation-status"
                className={state.error ? 'pro-error' : 'sr-only'}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.error ||
                  (state.phase === 'result' ? `Result: ${result}` : '')}
              </p>
            </div>
            <div
              className="memory-bar"
              role="group"
              aria-label="Memory controls"
            >
              {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((command) => (
                <button
                  key={command}
                  disabled={command === 'MC' && state.memory === '0'}
                  title={
                    {
                      MC: 'Clear memory',
                      MR: 'Recall memory',
                      'M+': 'Add to memory',
                      'M-': 'Subtract from memory',
                      MS: 'Store in memory',
                    }[command]
                  }
                  aria-label={
                    {
                      MC: 'Clear memory',
                      MR: 'Recall memory',
                      'M+': 'Add to memory',
                      'M-': 'Subtract from memory',
                      MS: 'Store in memory',
                    }[command]
                  }
                  onClick={() => {
                    selection.current = null;
                    dispatch({ type: 'memory', command });
                  }}
                >
                  {command === 'M-' ? 'M−' : command}
                </button>
              ))}
              <span>MEMORY</span>
            </div>
            <ScientificKeypad
              scientific={state.settings.mode === 'scientific'}
              onInsert={insert}
              onAction={action}
            />
            <div className="calculator-footnote">
              <span className="keyboard-symbol" aria-hidden="true">
                ⌨
              </span>
              <span>Keyboard friendly</span>
              <kbd>Enter</kbd>
              <span>to calculate</span>
              <kbd>Esc</kbd>
              <span>to clear</span>
            </div>
          </section>
          <ScientificHistory
            entries={state.history}
            precision={state.settings.precision}
            open={showHistory}
            onClose={closeHistory}
            onReplay={(entry) => {
              selection.current = null;
              dispatch({ type: 'replay', entry });
              setShowHistory(false);
              expressionRef.current?.focus();
            }}
            onPin={(id) => dispatch({ type: 'pin', id })}
            onDelete={(id) => dispatch({ type: 'delete', id })}
            onClear={() => dispatch({ type: 'clearHistory' })}
          />
        </div>
        <div className="workspace-bottom">
          <span>
            <i /> Ready for your next idea
          </span>
          <details>
            <summary>
              Expression guide <span aria-hidden="true">↗</span>
            </summary>
            <p>
              Try <code>sin(30)</code> in DEG, <code>sin(pi/2)</code> in RAD,{' '}
              <code>2^3^2</code>, <code>5!</code>, <code>root(27,3)</code>, or{' '}
              <code>200*10%</code>. Use explicit multiplication:{' '}
              <code>2*pi</code>. Buttons insert at the last text selection; Tab
              reaches every control. F9 changes sign. Replay restores the
              original angle and Ans context.
            </p>
          </details>
        </div>
      </main>
      <footer className="pro-footer">
        <span>Small tool. Limitless curiosity.</span>
        <span>
          SmartCalc Pro <span>v2.0</span>
          <span className="subtle-dot">/</span> Built for clarity.
        </span>
      </footer>
    </div>
  );
}

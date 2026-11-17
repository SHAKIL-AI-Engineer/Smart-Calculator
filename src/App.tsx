import { useState } from 'react';
import { Calculator } from './components/Calculator';
export default function App() {
  const [dark, setDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  );
  return (
    <div className={`app ${dark ? 'app--dark' : ''}`}>
      <header className="site-header">
        <a className="brand" href="./" aria-label="SmartCalc home">
          <span className="brand__mark" aria-hidden="true">
            s<span>c</span>
          </span>
          SmartCalc<span className="version">v1.0</span>
        </a>
        <button
          className="theme-toggle"
          aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          onClick={() => setDark(!dark)}
        >
          <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
          <span>{dark ? 'Light' : 'Dark'} mode</span>
        </button>
      </header>
      <main>
        <div className="intro">
          <span className="eyebrow">
            <span className="small-line" /> LESS FRICTION, MORE FOCUS
          </span>
          <h1>
            A little clarity.
            <br />
            <span>In every calculation.</span>
          </h1>
          <p>
            From quick sums to decimal details.
            <br className="mobile-break" /> A thoughtful space to work things
            out.
          </p>
        </div>
        <Calculator />
        <details className="shortcuts">
          <summary>
            <span aria-hidden="true">⌨</span> Made for your keyboard{' '}
            <span className="shortcut-arrow">⌄</span>
          </summary>
          <div className="shortcuts__body">
            <span>
              <kbd>0–9</kbd> Numbers
            </span>
            <span>
              <kbd>+ − * /</kbd> Operators
            </span>
            <span>
              <kbd>Enter / =</kbd> Calculate
            </span>
            <span>
              <kbd>Backspace</kbd> Undo digit
            </span>
            <span>
              <kbd>Esc</kbd> Clear
            </span>
            <span>
              <kbd>N</kbd> Change sign
            </span>
            <p>
              When a button has focus, Enter activates that button. Use = to
              calculate from anywhere.
            </p>
          </div>
        </details>
      </main>
      <footer>
        <span>Small tool. Clear thinking.</span>
        <span>
          Built with precision <span className="footer-dot">·</span> Runs in
          your browser
        </span>
      </footer>
    </div>
  );
}

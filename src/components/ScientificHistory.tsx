import { useState } from 'react';
import { formatScientific } from '../domain/scientific/evaluator';
import type {
  Precision,
  ScientificHistoryEntry,
} from '../domain/scientific/types';
import { exportHistory } from '../storage/scientificRepository';
interface Props {
  entries: ScientificHistoryEntry[];
  precision: Precision;
  onReplay: (entry: ScientificHistoryEntry) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  open: boolean;
}
export function ScientificHistory({
  entries,
  precision,
  onReplay,
  onPin,
  onDelete,
  onClear,
  onClose,
  open,
}: Props) {
  const [query, setQuery] = useState('');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportError, setExportError] = useState('');
  const filtered = entries
    .filter(
      (e) =>
        (!onlyPinned || e.pinned) &&
        `${e.expression} ${e.result}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt,
    );
  return (
    <aside
      className={`pro-history ${open ? 'pro-history--open' : ''}`}
      aria-label="Calculation history"
      id="history-panel"
    >
      <div className="history-heading">
        <div>
          <span className="section-kicker">YOUR WORK, REMEMBERED</span>
          <h2>
            History <span>{entries.length}</span>
          </h2>
        </div>
        <button
          className="icon-button close-history"
          aria-label="Close history"
          onClick={onClose}
        >
          ×
        </button>
        <span className="history-limit">LOCAL / 200</span>
      </div>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          aria-label="Search history"
          placeholder="Search calculations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="history-toolbar">
        <button
          className={!onlyPinned ? 'filter active' : 'filter'}
          onClick={() => setOnlyPinned(false)}
          aria-pressed={!onlyPinned}
        >
          All
        </button>
        <button
          className={onlyPinned ? 'filter active' : 'filter'}
          onClick={() => setOnlyPinned(true)}
          aria-pressed={onlyPinned}
        >
          Pinned
        </button>
        <button
          className="text-control export-button"
          disabled={!entries.length}
          onClick={() => {
            try {
              exportHistory(entries);
              setExportError('');
            } catch {
              setExportError('Export is unavailable in this browser.');
            }
          }}
        >
          Export ↗
        </button>
      </div>
      {exportError && (
        <p className="pro-error" role="status">
          {exportError}
        </p>
      )}
      {filtered.length ? (
        <ol className="pro-history-list">
          {filtered.map((e) => (
            <li key={e.id}>
              <div className="entry-meta">
                <span>
                  {e.angleMode} {e.pinned ? '· PINNED' : ''}
                </span>
                <time dateTime={new Date(e.createdAt).toISOString()}>
                  {new Date(e.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <button
                className="history-replay"
                aria-label={`Replay ${e.expression}`}
                onClick={() => onReplay(e)}
              >
                <span className="entry-expression">{e.expression}</span>
                <strong>= {formatScientific(e.result, precision)}</strong>
              </button>
              <div className="entry-actions">
                <button
                  className="text-control"
                  aria-label={`${e.pinned ? 'Unpin' : 'Pin'} ${e.expression}`}
                  onClick={() => onPin(e.id)}
                >
                  {e.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  className="text-control"
                  aria-label={`Delete ${e.expression}`}
                  onClick={() => onDelete(e.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="pro-history-empty">
          <span aria-hidden="true">↶</span>
          <h3>
            {query || onlyPinned
              ? 'No matching calculations'
              : 'Room for your next idea.'}
          </h3>
          <p>
            {query || onlyPinned
              ? 'Try a different search or filter.'
              : 'Your calculations appear here. Pin a favorite or pick up where you left off.'}
          </p>
        </div>
      )}
      <div className="history-bottom">
        {confirmClear ? (
          <div className="clear-confirm">
            <span>Delete all {entries.length} entries, including pins?</span>
            <button
              onClick={() => {
                onClear();
                setConfirmClear(false);
              }}
              className="text-control danger"
            >
              Delete all
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="text-control"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="text-control"
            disabled={!entries.length}
            onClick={() => setConfirmClear(true)}
          >
            Clear history
          </button>
        )}
        <p>
          <span aria-hidden="true">▣</span> On this device. Just for you.
        </p>
      </div>
    </aside>
  );
}

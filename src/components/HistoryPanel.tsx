import type { HistoryEntry } from '../domain/types';
import { operatorLabels } from '../domain/types';
import { displayNumber } from '../domain/formatting';
export function HistoryPanel({
  entries,
  available,
  onClear,
}: {
  entries: HistoryEntry[];
  available: boolean;
  onClear: () => void;
}) {
  return (
    <aside className="history" aria-labelledby="history-title">
      <div className="history__header">
        <div>
          <span className="eyebrow">YOUR SCRATCHPAD</span>
          <h2 id="history-title">
            Recent calculations <span className="count">{entries.length}</span>
          </h2>
        </div>
        <button
          className="text-button"
          disabled={!entries.length}
          onClick={onClear}
        >
          Clear history
        </button>
      </div>
      {!available && (
        <p className="storage-notice" role="status">
          History storage is unavailable or damaged. Calculations still work;
          new history stays in this tab until storage recovers.
        </p>
      )}
      {entries.length ? (
        <ol className="history__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="history__expression">
                {displayNumber(entry.operandA)} {operatorLabels[entry.operator]}{' '}
                {displayNumber(entry.operandB)}
              </div>
              <div
                className={`history__answer ${entry.result.length > 15 ? 'history__answer--long' : ''}`}
              >
                <span>= {displayNumber(entry.result)}</span>
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="history__empty">
          <span className="empty-icon" aria-hidden="true">
            ↶
          </span>
          <h3>A fresh start.</h3>
          <p>
            Your completed calculations will
            <br />
            find a home here.
          </p>
          <span className="empty-rule" />
        </div>
      )}
      <p className="history__privacy">
        <span aria-hidden="true">▣</span> Stored on this device. Just for you.
      </p>
    </aside>
  );
}

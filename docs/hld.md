# High-level design

## Runtime flow

1. Touch, mouse, or keyboard creates a typed action.
2. The React controller dispatches to the calculator reducer.
3. The reducer validates state/input and calls the domain arithmetic engine on equals.
4. The domain validates operands, computes with decimal.js, checks overflow, and formats the result.
5. React renders the expression, result, or controlled error.
6. For each successful completion revision, the history service creates a timestamped UUID entry.
7. The repository serializes the latest 50 entries in one localStorage write. Failures produce a storage notice.

All modules execute in the browser. No calculation API or database server is needed. Static assets are served by Vite during development or by a static host in production. Optional external font loading uses Google Fonts; system fonts remain usable offline.

## Components

| Module                  | Responsibility                                                 |
| ----------------------- | -------------------------------------------------------------- |
| App                     | Page shell, theme, keyboard guide                              |
| Calculator              | Reducer, keyboard listener, history orchestration              |
| CalculatorDisplay       | Expression, number display, accessible status                  |
| CalculatorKeypad/Button | Native semantic buttons dispatching actions                    |
| HistoryPanel            | Local entries, clear action, persistence notice                |
| Domain                  | Input validation, arithmetic, formatting, shared types         |
| History service         | Create newest-first history entries with metadata              |
| Local repository        | Validate loaded records, bound history, catch storage failures |

## Failure handling

Validation and arithmetic errors stay in the current calculation so users can correct the operand. A successful calculation alone increments the completion revision. Storage failures preserve in-memory history. Invalid stored records are discarded; the repository does not trust JSON shape or result values.

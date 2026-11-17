# SmartCalc v2 requirements

The uploaded Scientific Calculator Complete Upgrade is the source specification. Implement v2 on its own branch while retaining v1 domain/state/repository code and its storage key.

| Area            | Acceptance                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Expressions     | Explicit multiplication, parentheses, precedence, nested functions, right-associative powers, unary minus below exponentiation |
| Scientific math | Trig/inverse trig, logarithms, powers, roots, factorial, reciprocal, abs, percentage, modulo, constants, Ans                   |
| Precision       | Isolated 24-digit decimal arithmetic; independent 8/12/16 significant-digit presentation                                       |
| Modes           | Persistent DEG/RAD and standard/scientific keypad settings                                                                     |
| Memory          | Persistent MS/MR/MC/M+/M− using unformatted decimal results                                                                    |
| History         | 200 local successful entries; search, pin, replay, delete, confirm clear, JSON export                                          |
| Replay          | Restore original expression, angle mode, and previous-answer context                                                           |
| Persistence     | Versioned schema; v1 migration without deleting original data; handle malformed/blocked storage                                |
| UI              | Graphite/violet scientific workspace, light/dark themes, desktop sidebar, compact mobile keys and history panel                |
| Accessibility   | Editable labelled expression, native controls, visible focus, result/error status, keyboard controls, reduced motion           |
| Verification    | Domain/state/storage/component/browser tests; strict TypeScript and production build                                           |

Real-number calculations only. No cloud data, authentication, complex arithmetic, symbolic algebra, graphing, or installed/offline PWA assets are part of v2. Calculations themselves require no network after loading the app.

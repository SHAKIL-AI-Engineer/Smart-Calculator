# SmartCalc Pro v2.0

**Your everyday, elevated.** A scientific calculator with a dedicated expression parser, 24-digit decimal mathematics, persistent memory/settings, and a private 200-entry history. React + TypeScript + Vite + decimal.js; no backend, account, or API key.

বাংলায়: আগের ক্যালকুলেটরের ওপর ভিত্তি করে Scientific Engine, DEG/RAD, মেমরি এবং সার্চযোগ্য হিস্টরি যোগ করা হয়েছে। v1-এর হিস্টরি অক্ষত রেখে নতুন সংস্করণে কপি করা হয়।

## Run on Windows 11 / VS Code

Install Node.js **24 LTS** and Git. In the VS Code PowerShell terminal:

```sh
git clone https://github.com/SHAKIL-AI-Engineer/Smart-Calculator.git
cd Smart-Calculator
git switch feat/smartcalc-v2
npm ci
npm run dev
```

The v2 implementation is on its own feature branch while release PRs are reviewed. Open the Vite URL, usually http://localhost:5173.

## Calculate

Type directly into the expression field or use the keypad. Press Enter or = to calculate. Functions use parentheses; multiplication is explicit.

| Expression        | Mode   | Result                               |
| ----------------- | ------ | ------------------------------------ |
| `2+3*4`           | Either | `14`                                 |
| `2^3^2`           | Either | `512`                                |
| `-2^2`            | Either | `-4`                                 |
| `sin(30)`         | DEG    | `0.5`                                |
| `sin(pi/2)`       | RAD    | `1`                                  |
| `sqrt(81)` / `5!` | Either | `9` / `120`                          |
| `root(27,3)`      | Either | `3`                                  |
| `0.1+0.2`         | Either | `0.3`                                |
| `200*10%`         | Either | `20`                                 |
| `Ans*2`           | Either | Twice the previous successful answer |

Functions: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `log` (base 10), `ln`, `sqrt`, `cbrt`, `root(value,degree)`, `abs`, `inv`, `square`, `cube`, `pow10`, `exp`, `floor`, `ceil`, `round`, `trunc`, `sign`. Constants: `pi`/`π`, `e`, `Ans`. Operators: `+ - * / ^ mod`, postfix `!` and `%`, parentheses, scientific notation such as `1e-3`. Unicode ×, ÷, −, √ are accepted.

Keypad function buttons wrap an existing complete expression or selected text; otherwise they start a function call. Use `)` to close a call; `root` takes two comma-separated arguments. Number/operator buttons insert at the last selected text range. After a result, an operator continues from full-precision Ans; a number starts a new expression. Standard mode hides the scientific keys while keeping the expression engine available.

## Memory, history, and settings

- **MS / MR / MC / M+ / M−** store, recall, clear, add, and subtract full-precision memory. Clear input does not clear memory or Ans.
- Successful calculations store expression, full result, DEG/RAD, timestamp, pin state, and the original Ans context. Replay restores that context and angle before evaluating again.
- Search by expression/result; filter pins; replay, delete, clear with confirmation, or export all stored entries as JSON. Pins sort first and are protected from normal eviction; if all 200 entries are pinned, the oldest pin is evicted to admit a new calculation.
- DEG/RAD, 8/12/16 significant display digits, theme, animation preference, memory, Ans, and history persist in `smartcalc.workspace.v2`.
- The original `smartcalc.history.v1` key is preserved as a backup. V2 reads it once when no v2 workspace exists. Clearing v2 history writes an empty workspace rather than remigrating the backup. Export uses a local download; no data is uploaded.

Desktop uses a persistent history sidebar. Below 1024px, use the history toggle to open an inline history panel; no modal traps keyboard focus. Below 640px, scientific keys use a compact six-column layout. Motion uses CSS only and respects system reduced-motion settings as well as the app toggle. Calculations run entirely offline once the app is loaded; this release does not install a PWA or service worker. Optional Google Fonts requests have system-font fallbacks.

## Numerical and safety policy

The scientific engine uses an isolated decimal.js constructor with **24 significant digits**, half-up rounding, and presentation at 8, 12, or 16 significant digits. Scientific functions are numerical approximations; v2 is a real-number calculator. Non-real roots/powers, invalid logs/inverse trig, tangent poles, and division/modulo by zero return typed errors. Percentage always divides its operand by 100: `200+10% = 200.1`.

Limits: 512 expression characters, 256 tokens, 32 recursive parser levels, 24 significant digits per literal, absolute values at most `1e1000`, minimum exponent −1000 (arithmetic underflow becomes zero), factorial integers 0–200, integer root degrees −1000–1000 excluding zero, and exponents with absolute value ≤1000. Negative bases require integer powers; use odd roots for negative fractional roots. `0^0` is rejected. Remainder follows dividend sign. `round` uses half-up; `trunc` moves toward zero. Trigonometric values near finite-precision π quadrant boundaries are stabilized at zero; tangent is rejected when its cosine magnitude is below `1e-22`.

Input passes through tokenizer → Pratt parser → AST → evaluator, using allowlisted operations. There is no `eval`, `new Function`, variable assignment, network access, or arbitrary property access. The scientific engine does not import React or storage. V1 arithmetic, reducer, and repository modules remain available with regression tests.

## Keyboard and verification

Type numbers/functions/operators in the expression field. **Enter / =** calculates, **Escape** clears input or closes an open panel, **F9** toggles sign, and **Backspace** edits. Native text selection, copy/paste, and Tab navigation work. Enter/Space activates focused buttons; result/error announcements use a dedicated live status.

```sh
npm test
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run preview
```

Linux may require `npx playwright install --with-deps chromium`. The production build is `dist/` and supports static hosting. Build/test artifacts, dependencies, and local environment files are ignored by Git. CI runs unit/component tests, the build, and desktop/mobile browser tests.

## Architecture and learning guide

- [Requirements](docs/requirements.md)
- [Architecture decisions and migration](docs/architecture.md)
- [High-level design](docs/hld.md)
- [Low-level design and schema](docs/lld.md)
- [Test plan](docs/test-plan.md)
- [Preserved v1 architecture](docs/v1/architecture.md)

বাংলায়: `domain/scientific/`-এ tokenizer, parser ও evaluator আছে। `state/scientificReducer.ts` ইনপুট, মেমরি ও হিস্টরি নিয়ন্ত্রণ করে। `storage/scientificRepository.ts` ব্রাউজারে ডেটা সংরক্ষণ করে। UI এই স্তরগুলো ব্যবহার করে, কিন্তু গণনার নিয়ম UI-এর ওপর নির্ভর করে না।

Complex numbers, matrices, graphing, symbolic algebra, login, and cloud synchronization remain future modules.

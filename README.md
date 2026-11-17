# Smart-Calculator

**A little clarity. In every calculation.** A responsive, browser-only calculator built from the SmartCalc v1.0 architecture masterplan with React, TypeScript, Vite, and `decimal.js`.

বাংলায়: সঠিক দশমিক গণনা, কিবোর্ড নিয়ন্ত্রণ ও ডিভাইসে সংরক্ষিত হিস্টরিসহ একটি ক্যালকুলেটর। গণনার জন্য সার্ভার বা লগইন প্রয়োজন নেই।

## Run locally (Windows 11 / VS Code)

Install **Node.js 24 LTS** and Git. Open the VS Code terminal (PowerShell or Bash):

```sh
git clone https://github.com/SHAKIL-AI-Engineer/Smart-Calculator.git
cd Smart-Calculator
npm ci
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173. No API key, database, or environment variables are needed.

## Features

- Addition, subtraction, multiplication, and division with decimal-safe arithmetic.
- Clear, backspace, decimal input, negative numbers, and controlled validation errors.
- Keyboard and touch controls, visible focus, screen-reader result announcements.
- Up to 50 successful calculations saved locally, newest first, with clear-history control.
- Light/dark themes; initial theme follows your system. Theme changes last for the current page session.
- Responsive layout, including 320px-wide screens.

| Key                | Action                      |
| ------------------ | --------------------------- |
| `0–9`, `.`         | Enter a number              |
| `+`, `-`, `*`, `/` | Choose an operator          |
| `Enter`, `=`       | Calculate                   |
| `Backspace`        | Remove last digit           |
| `Escape`, `Delete` | Reset calculator            |
| `N`                | Toggle sign                 |
| `Tab`, `Shift+Tab` | Move focus between controls |

Enter activates a focused button using normal browser behavior; `=` always calculates. Use `N` or the ± button for negative operands; `-` selects subtraction.

## Arithmetic policy

One operation uses two operands. Enter `5 + 3 =`, then choose another operator to reuse the result; expressions and precedence are outside v1. Repeated operators replace the pending operator before the second operand. Repeated equals does nothing.

Inputs allow 16 significant digits and 10 fractional digits. Results allow 16 integer digits. The engine uses 50-digit decimal precision; all displayed/stored results round to at most 10 fractional digits using half-up rounding, and negative zero becomes `0`. This consistently applies the division display policy to other operations whose result has more than 10 fractional digits. Trailing fractional zeros are removed from results. For example, `0.1 + 0.2 = 0.3` and `10 / 3 = 3.3333333333`.

A result may have more than 16 significant digits while still meeting the result integer limit. Such a result can be viewed and saved, but reusing it as an operand is rejected with an explanation. Start a new calculation with AC or a digit.

History uses the versioned localStorage key `smartcalc.history.v1`. Storage denial, quota errors, and malformed records are handled without interrupting calculation. Stored entries are validated before use. History is local to this browser and origin; clearing browser data removes it. Fonts are requested from Google Fonts with local fallbacks; calculation data is never sent there.

## Verify and build

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

On Linux, Playwright may also need `npx playwright install --with-deps chromium`. Unit/component tests use Vitest and Testing Library. Browser tests cover desktop/mobile calculation, reload persistence, clearing, recovery, and layout overflow. CI runs tests and the production build on pushes and pull requests.

`npm run build` produces `dist/`, ready for a static host. Relative asset paths support hosting in a subdirectory. No live deployment is configured by this repository.

## Architecture and learning guide

Dependencies flow from **UI → reducer → domain**. The domain has no React or storage imports. A separate history service creates entries; the storage adapter validates, serializes, and handles failures. React effects save successful completions once, including in StrictMode.

- [Requirements and acceptance criteria](docs/requirements.md)
- [Architecture decisions](docs/architecture.md)
- [High-level design](docs/hld.md)
- [Low-level design and data model](docs/lld.md)
- [Test plan and manual checks](docs/test-plan.md)

বাংলায়: প্রথমে `domain/`-এর বিশুদ্ধ ফাংশনগুলো পড়ুন। তারপর `state/`-এর reducer, `storage/`-এর সংরক্ষণ পদ্ধতি এবং শেষে `components/`-এর UI দেখুন। এতে প্রতিটি স্তরের দায়িত্ব আলাদা করে বোঝা সহজ হবে।

Scientific operations, expression parsing, accounts, and cloud synchronization are future work.

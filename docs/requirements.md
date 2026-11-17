# Requirements — SmartCalc v1.0

## Scope

A browser-only, responsive React/TypeScript utility for two operands and one operator. No backend, accounts, or cloud synchronization. The supplied architecture masterplan is the source for this implementation.

## Functional acceptance

| Requirement           | Acceptance criterion                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| FR-01–04 arithmetic   | Correct signed decimal add/subtract/multiply/divide                                       |
| FR-05 decimals        | One decimal point per operand, maximum 10 fractional digits                               |
| FR-06 validation      | Reject malformed/non-finite inputs, >16 significant digits, result overflow, zero divisor |
| FR-07 clear/backspace | AC resets input and pending calculation; backspace safely removes a digit                 |
| FR-08 sign            | ± and N toggle active operand sign; negative zero results normalize to 0                  |
| FR-09 feedback        | Expression, result, and text errors remain readable; results/errors are announced         |
| FR-10 keyboard        | Digits, operators, decimal, Enter/equals, Backspace, Escape/Delete, N                     |
| FR-11 history         | Last 50 successful entries, newest first; restore on reload; clear persistent history     |
| FR-12 theme           | Light/dark toggle and system-based initial theme                                          |

## Quality requirements

- Pure arithmetic and validation functions; predictable immutable reducer transitions.
- All calculations run locally; no unsafe expression evaluation.
- Storage exceptions never interrupt arithmetic.
- Controls have descriptive names, visible focus, and at least 44px touch targets.
- Single-column mobile layout and no horizontal overflow at 320px.
- Performance target: normal operations below 100ms on typical desktop hardware. Automated tests verify behavior, not a hardware-independent timing guarantee.
- Modern browsers supporting ES2022, crypto.randomUUID, and localStorage (persistence optional if unavailable).

বাংলায়: হিস্টরি সংরক্ষণ করা না গেলেও গণনা চালু থাকবে। একটি গণনা শেষ করতে অবশ্যই দুটি সংখ্যা, একটি অপারেটর এবং সমান বোতাম প্রয়োজন।

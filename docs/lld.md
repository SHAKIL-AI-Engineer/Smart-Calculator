# Low-level design

## Domain contracts

`Operator` is one of +, -, *, /. `CalculationResult` is a discriminated union: success with a decimal string or failure with a text error. `calculate(a, operator, b)` validates operands and operator, rejects zero division, computes using isolated decimal.js precision 50, formats half-up to 10 decimal places, then checks the 16-integer-digit result limit. Exported primitive operations assume valid numeric strings; use `calculate` at application boundaries.

Input syntax: optional leading minus, required integer digits, optional decimal point/fraction. Exponents, whitespace, JavaScript syntax, Infinity, and NaN are rejected. Leading zeros do not count as significant digits. All fractional characters count toward the 10-place fraction limit. Result formatting normalizes zeros and removes trailing fractional zeros. Display grouping is separate and does not change stored values.

## State transitions

| Phase    | Digit/decimal           | Operator                                | Equals                                 |
| -------- | ----------------------- | --------------------------------------- | -------------------------------------- |
| first    | Edit first operand      | Capture first operand; move to operator | Missing-input message                  |
| operator | Begin second operand    | Replace pending operator                | Missing-input message                  |
| second   | Edit second operand     | Ask user to finish with equals          | Calculate; result or recoverable error |
| result   | Begin fresh calculation | Reuse result if it meets operand policy | No-op                                  |

AC resets calculator data while retaining the monotonically increasing completion revision. Backspace on result starts fresh at 0. Sign on result begins a new first operand from the negated result, subject to input limits. Sign after an operator begins a negative second operand at -0. Editing a valid operand clears its previous error.

`completed` contains the two operands, operator, and result only after successful equals. `revision` increments once per success. The controller's revision ref ensures effect replays do not add a duplicate history item. Keyboard listeners have cleanup, skip editable targets and modified shortcuts, and preserve Enter for focused native buttons.

## Local data model

| Field     | Type            | Purpose                    |
| --------- | --------------- | -------------------------- |
| id        | UUID string     | Stable history key         |
| operandA  | decimal string  | Original first operand     |
| operator  | Operator        | Arithmetic operation       |
| operandB  | decimal string  | Original second operand    |
| result    | decimal string  | Validated formatted result |
| createdAt | ISO-8601 string | Creation timestamp         |

The versioned key `smartcalc.history.v1` stores a JSON array with at most 50 entries. Reads validate field types, timestamps, operands, operators, and recomputed results; remove duplicate IDs; sort newest first; and cap length. Writes replace the complete array atomically with setItem. Clear removes the key. Quota, blocked storage, and JSON errors return controlled availability flags.

No relational entities are implemented in v1. A future session could have one-to-many calculation entries with session/user foreign keys; adding that requires a separate authentication and synchronization design.

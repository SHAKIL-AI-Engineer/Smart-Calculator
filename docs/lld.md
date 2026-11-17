# Low-level design — scientific edition

## Grammar and numerical rules

Pratt binding powers: addition/subtraction 10, multiplication/division/modulo 20, prefix sign 30, right-associative exponentiation 40, postfix factorial/percentage 50. Function calls require parentheses and explicit arguments; identifiers are case-insensitive. Constants are pi/e/Ans. Multiplication between values must be explicit. Scientific notation is allowed in numeric literals. Symbols ×/÷/−/π/√ normalize to internal tokens.

Tokenizer bounds length to 512 and tokens to 256. Parser recursion is capped at 32. Literal mantissas allow 24 significant digits. Evaluator checks magnitude, real-number domains, zero division, exponent/root bounds, and factorial bounds. See README for the complete numerical policy. Function/operator lookup is allowlisted and never invokes user-provided code.

## State

Persistent data: settings, memory string, answer string, history array. Session-only data: editable expression, displayed result string, editing/result phase, error text/code. Evaluate is a no-op in result phase until the expression is edited. Failure preserves previous result, answer, and history. Operator input after a result continues from Ans; digit/function input begins a new calculation. AC clears expression/result but retains memory/Ans/history. Sign negates the whole expression. Native textarea editing supports selection and paste.

Function keys wrap selected text or a completed expression; with an empty expression or trailing operator they insert an opening function call. Nth-root wrapping inserts a comma for the degree. MR inserts a parenthesized full-precision memory value. Replayed history restores its expression, angle mode, and answerContext before any new evaluation.

## Stored schema

Key: `smartcalc.workspace.v2`.

```json
{
  "version": 2,
  "settings": {
    "angleMode": "DEG",
    "precision": 12,
    "theme": "dark",
    "animations": true,
    "mode": "scientific"
  },
  "memory": "0",
  "answer": "7",
  "history": [
    {
      "id": "uuid",
      "expression": "Ans+2",
      "result": "7",
      "angleMode": "DEG",
      "createdAt": 1794931200000,
      "pinned": false,
      "answerContext": "5"
    }
  ]
}
```

Reads validate numeric strings, settings enums, timestamps, IDs, expression syntax, and record shape, deduplicate IDs, and cap/sort the collection. Invalid JSON returns safe defaults and an availability flag. Stored records are treated as local historical data, not instructions; replay re-evaluates and applies full domain validation. Pins sort first in the UI; normal eviction drops the oldest unpinned record. With 200 pins, the oldest pin can be evicted for a new result.

The versioned v2 object is written in one setItem call. V1's original array is retained unchanged. Exports download all current records as versioned JSON through a Blob URL, then revoke that URL. No relational database is implemented; a future cloud user would own many history entries through an authenticated ownership relationship.

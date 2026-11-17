# High-level design — scientific edition

## Calculation flow

1. Editable expression, keypad, or keyboard dispatches a typed reducer action.
2. Tokenizer accepts numeric literals, identifiers, and known symbols within limits.
3. Pratt parser creates a bounded abstract syntax tree.
4. Evaluator walks the AST with a DEG/RAD and Ans context, using decimal.js.
5. Validation returns a typed error or a canonical full-precision decimal string.
6. UI formats the result to the selected display precision and announces completion/errors.
7. Successful evaluation updates Ans and adds one timestamped history entry with its original context.
8. The repository atomically stores settings, memory, Ans, and the latest 200 history entries.

## Module responsibilities

| Module               | Role                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| ScientificWorkspace  | Persistent-state lifecycle, expression selection, settings, keyboard, layout |
| ScientificKeypad     | Scientific and numeric controls, function templates                          |
| ScientificHistory    | Search/filter, replay, pin, deletion, clear confirmation, export             |
| Tokenizer/parser     | Safe syntax and precedence; no browser dependencies                          |
| Evaluator            | Real-number functions, decimal precision, domain/range checks                |
| scientificReducer    | Editing/result transitions, memory, context replay, history cap              |
| scientificRepository | Schema validation, v1 migration, local serialization, local download         |

All calculation and persistence logic runs in the browser. Hosting serves static assets. The only optional external asset is Google Fonts; fonts fall back locally. Future cloud sync would add a separate repository boundary and authenticated ownership checks, not rewrite scientific mathematics.

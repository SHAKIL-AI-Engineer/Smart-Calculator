# Test plan

## Automated coverage

| Masterplan cases                                                 | Evidence                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| TC-01–05 arithmetic, signed values, zero, decimals               | arithmetic.test.ts parameterized domain tests          |
| TC-06 duplicate decimal                                          | reducer.test.ts                                        |
| TC-07 backspace / TC-08 clear                                    | reducer.test.ts and calculator.test.tsx                |
| TC-09 missing operand                                            | reducer.test.ts                                        |
| TC-10 successful history / TC-11 reload                          | calculator.test.tsx; Playwright browser reload journey |
| TC-12 storage unavailable                                        | history.test.ts and calculator.test.tsx                |
| TC-13 keyboard operation                                         | calculator.test.tsx and Playwright                     |
| TC-14 input limit / TC-15 overflow                               | arithmetic.test.ts and reducer.test.ts                 |
| Repeated operators/equals, result reuse, zero-divisor correction | reducer.test.ts                                        |
| StrictMode duplicates and corrupted stored entries               | calculator.test.tsx and history.test.ts                |
| Mobile touch flow and long-number horizontal overflow            | Playwright mobile project                              |

Run `npm test`, `npm run build`, and `npm run test:e2e` after installing dependencies and the Chromium browser. See the README for installation commands.

## Manual release checks

- At desktop, 390px, and 320px widths, verify layout, readable results, and no sideways scrolling.
- Tab through every control: focus is visible; Enter/Space activates the focused native button; equals remains available via `=`.
- Use a screen reader to confirm a completed result and error are announced without reading every digit as a new live message.
- Check light and dark themes, browser zoom at 200%, and large values.
- Deny storage or exceed quota, verify calculations continue, and verify the storage notice is understandable.
- Confirm font fallback works if external font requests are blocked.

Automated role/name tests and browser layout checks provide partial accessibility evidence. A screen-reader session and broad browser/device checks remain manual release work. No live hosting deployment is part of this change.

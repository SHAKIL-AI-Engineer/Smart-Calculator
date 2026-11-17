# Architecture decisions

| Decision       | Choice                                    | Rationale                                          |
| -------------- | ----------------------------------------- | -------------------------------------------------- |
| Application    | Static browser app                        | Works on desktop/mobile with no server             |
| Language/build | TypeScript + Vite                         | Strict contracts and small development setup       |
| UI             | React components and plain CSS            | Reusable controls; no unnecessary UI framework     |
| State          | useReducer                                | Explicit phases and predictable edge cases         |
| Arithmetic     | decimal.js, isolated 50-digit constructor | Exact decimal inputs and products; stable rounding |
| Persistence    | Versioned localStorage repository         | Fits 50 local entries, no personal data collection |
| Tests          | Vitest, Testing Library, Playwright       | Domain, interactions, browser journeys             |
| Delivery       | Static dist build                         | Portable to static hosting; no runtime secrets     |

The domain depends on decimal.js only. State depends on domain. Components depend on state, a history service, and the repository. Storage does not affect arithmetic results.

## Boundary decisions

The supplied specification defines a division rounding policy and a maximum of 10 input decimal places. For consistent display, every completed result is rounded half-up to 10 fractional places. Internal arithmetic is exact within its 50-digit precision before formatting. Historical result strings contain this formatted value.

A result may have 16 integer digits and 10 fractional digits. The stricter operand policy still applies when reusing it: values over 16 significant digits cannot become a new input. The UI explains this rather than silently losing precision.

React's reducer is pure: it creates no UUIDs, timestamps, or storage writes. The controller observes completion revisions, creates one history entry outside state updater callbacks, and persists history in a separate effect. A revision guard prevents duplicate StrictMode entries.

## Future changes

An expression parser belongs in domain modules for precedence/brackets. Authentication and synchronized history would add a backend repository with ownership controls; they would not change arithmetic responsibilities. SQL decimal precision and scale would need to match an explicitly revised calculation policy.

বাংলায়: গণনার নিয়ম UI বা স্টোরেজের ওপর নির্ভর করে না। তাই পরে ডিজাইন পরিবর্তন বা ব্যাকএন্ড যোগ করলেও মূল গণনার নিয়ম আলাদা রাখা সম্ভব।

# SmartCalc v2 test plan

## Automated checks

- **scientific-engine.test.ts**: precedence/AST shape, 24-digit precision, DEG/RAD, nested scientific functions, roots, powers, factorial, percent, constants, Ans, malformed syntax, unsupported inputs, domain/range/resource limits, and tiny nonzero angles.
- **scientific-state.test.ts**: result transitions, selection replacement, memory, context replay, 200-entry eviction/pins, schema validation, corrupted/blocked storage, v1 migration and non-resurrection after clear.
- **scientific-ui.test.tsx**: StrictMode deduplication, typed and keypad evaluation, DEG/RAD, errors, history search/pin/replay/delete/clear/export, persistent settings/memory, and storage denial.
- **V1 regression suites**: existing decimal arithmetic, validation, reducer, repository, and original calculator interaction tests stay in place.
- **Playwright**: desktop/mobile expressions, memory and reload, history search/pin/replay/export/clear, v1 migration, original Ans restoration, domain errors, touch function keys, 320px overflow, 44px minimum keys, reduced-motion CSS, and browser runtime errors.

Run `npm test`, `npm run build`, `npm run format:check`, and `npm run test:e2e` (after installing Chromium).

## Manual release checks

Verify desktop/tablet/mobile screenshots in both themes, keyboard focus and text editing, 200% zoom, screen-reader announcements, and font fallback. Screen-reader sessions and broad cross-browser/device coverage remain manual; automated roles and live-status checks do not certify full accessibility. Verify the hosted build after deployment and report the actual URL/state/commit.

# V2 verification evidence

- 171 unit/component tests passed across the v1 regression and v2 engine/state/storage/UI suites.
- Strict TypeScript checking and the Vite production build passed.
- Six Playwright journeys passed across Chromium desktop and mobile emulation.
- Browser journeys verify scientific arithmetic, DEG/RAD, memory/settings persistence, history migration/search/pin/replay/export/delete/clear, restored Ans context, domain errors, reduced motion, minimum 44px keypad height, and no 320px horizontal overflow.
- Dark desktop, dark mobile, and light mobile screenshots were visually inspected. Secondary text contrast and desktop scientific key density were adjusted during review.
- Formatting and whitespace checks passed.

Screen-reader sessions, broad cross-browser/device checks, and installed-PWA behavior are not claimed. V2 runs scientific calculations offline after loading; it does not install a service worker.

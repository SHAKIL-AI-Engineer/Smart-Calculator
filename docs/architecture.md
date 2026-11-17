# SmartCalc v2 architecture decisions

## Upgrade boundary

V2 adds `domain/scientific/`, `scientificReducer`, `scientificRepository`, and scientific UI components. Existing v1 domain, reducer, history service/repository, and UI components remain for compatibility tests. The application entry renders the scientific workspace. Historical v1 docs are in `docs/v1/`.

## Decisions

| Choice                           | Reason                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------- |
| Custom Pratt parser and AST      | Controlled grammar, correct precedence, explicit allowlist                        |
| decimal.js precision 24          | Decimal-safe arithmetic and scientific functions without native Number conversion |
| Pure reducer                     | Predictable expression, result, memory, history, settings transitions             |
| Metadata supplied in actions     | UUID/time generation stays outside pure reducer execution                         |
| Versioned localStorage workspace | Persist history/context/settings together in one atomic write                     |
| Preserve v1 storage key          | Existing data remains available for rollback or manual export                     |
| Plain CSS + CSS transitions      | Matches the supplied package direction without extra UI/motion dependencies       |
| Inline mobile history panel      | Keyboard-accessible secondary region without modal focus trapping                 |
| Static build                     | Existing Vercel/static-host workflow stays usable                                 |

Scientific errors use SYNTAX, DOMAIN, DIVISION_BY_ZERO, and LIMIT codes. Storage errors are availability flags and never interrupt arithmetic. Failed calculations do not become history or overwrite Ans. Display rounding does not change Ans, memory, or replay values.

The core domain imports neither React nor localStorage. UI dispatches typed actions; state invokes domain functions; the storage boundary validates/serializes persisted state. No arbitrary JavaScript expression execution occurs.

## Migration and release

With no v2 key, valid v1 entries become expression entries with DEG and answer context 0. The original key is never removed. The next v2 save persists a version-2 workspace, even when empty. Thus clearing history does not restore legacy entries on reload. LocalStorage can fail; users receive a notice while in-memory calculation continues.

Keep v2 in its own branch and review its diff against v1. The main branch requires explicit publication approval from the user; this change does not bypass that existing restriction. Deploy the verified v2 source through the existing Vercel project when releasing. Git auto-deployment additionally requires Vercel GitHub integration access to the repository.

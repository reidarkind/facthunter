# FactHunter

Norwegian-language mobile PWA. Vite 8 + React 19 + TypeScript. No backend.
Wikipedia GeoSearch (`no` then `en`) overlaid as AR signposts. Collection in IndexedDB.
Hosted on GitHub Pages at `/facthunter/` (repo name, not the local folder `fact_hunter`).

## Commands

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run dev          # HTTP, fine on localhost
npm run dev:https    # required for phone camera/compass
```

Single test: `npx vitest run src/lib/geo.test.ts`

## Code style

UI copy is Norwegian. App name is **FactHunter**. No TypeScript enums. Use `import type`. Named exports except `src/App.tsx` (Vite default).

```ts
// CORRECT
import type { SavedFact } from '../types'
export function scoreFor(facts: SavedFact[]): number { /* ... */ }

// WRONG
enum Lang { No, En }
export default function scoreFor(facts: SavedFact[]) { /* ... */ }
```

Keep hunt numbers in `src/lib/constants.ts`. Do not scatter 500/50/40/150.

```ts
// id format — callers must String(pageId)
factId('no', String(page.pageid)) // wikipedia:no:123
```

## Architecture

```
src/lib/*            pure logic; tests sit beside the module
src/hunt/*           camera, compass, GPS, AR signs
src/facts/FactSheet  extract + share
src/collection/*     search, filter, export/import
src/install/*        privacy + home-screen steps
src/app/AppShell     tabs Jakt | Samling, hash `#/install`
```

Data flow: sensors → Wikipedia fetch → AR signs → unlock writes IndexedDB → collection reads the same `SavedFact[]`. Score is derived (`10` unlock + `5` read), never stored.

Hunt must not start until camera stream + one GPS fix + one heading exist, all from one **Start jakt** tap. Video: `playsInline` + muted, `facingMode: environment`.

Install copy lives in `InstallPage` and `README.md`. Keep those two in sync.

## Tests

TDD for `src/lib/*`: write the failing test, then the function. UI tests use Testing Library, not enzyme. Do not hit the live Wikipedia API in tests — inject `fetch`. IndexedDB tests import `fake-indexeddb/auto`.

## Boundaries

- Never add a backend, accounts, cloud sync, or leaderboards.
- Never add WikiStrinda.
- Never change Vite `base` / PWA `start_url` / `scope` away from `/facthunter/`.
- Never commit `.env` or secrets.
- Do not push to `main` or force-push unless the user asks.
- Do not commit unless the user asks.
- Spec: `docs/superpowers/specs/2026-09-11-fact-hunter-design.md`. If code and spec disagree, stop and ask.
- Update this file in the same change that alters a convention.

## Git

Branch from `feat/fact-hunter` (or `feat/<short>`). Conventional commits matching history: `feat:`, `fix:`, `test:`. Quality gate: Husky pre-commit runs oxlint + `tsc`; GitHub Actions on PR/`main` runs lint, typecheck, test, build. Pages deploy is the `deploy` job on `main` (repo must be **public**).

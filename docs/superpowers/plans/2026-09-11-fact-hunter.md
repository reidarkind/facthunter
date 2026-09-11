# FactHunter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Norwegian-language PWA that overlays Wikipedia GeoSearch as AR signposts in the phone camera, unlocks facts locally, scores unlock/read, and lets the user share Wikipedia links plus export/import a JSON collection.

**Architecture:** Static Vite + React PWA with no backend. Camera, compass, and GPS are required to hunt. Nearby pages come from `no.wikipedia.org` and `en.wikipedia.org`. Collection, read state, and derived points live in IndexedDB. GitHub Pages hosts the app shell.

**Tech Stack:** React 19, TypeScript, Vite 8, vitest, vite-plugin-pwa, @vitejs/plugin-basic-ssl, IndexedDB, Wikipedia Action API (`origin=*`).

**Spec:** `docs/superpowers/specs/2026-09-11-fact-hunter-design.md`

## Global Constraints

- App name in UI: **FactHunter**. UI language: Norwegian.
- No backend, no account, no cloud sync of user data. Wikipedia is read-only from the device.
- WikiStrinda is out of scope.
- Vite `base` and service worker scope: `/fact_hunter/`.
- Hunt does not start until camera stream, one GPS fix, and one valid compass heading exist, requested from one **Start jakt** tap.
- Visible in camera: distance ≤ **500 m**. Unlock: distance ≤ **50 m** AND GPS `accuracy` ≤ **50 m**. FOV ±**30°**.
- Wikipedia fetch radius **1000 m**. Refetch after **150 m** of movement. Cross-language merge **40 m**, keep `no`.
- Points: **10** unlock, **5** read (scroll to bottom or ≥80% of extract). Never twice per `id`. Score is derived, not stored separately.
- Share text must contain Wikipedia `pageUrl`, `FactHunter`, and `installUrl` from origin + base + `install`.
- Export JSON: `{ "app": "FactHunter", "version": 1, "exportedAt", "facts" }`. Import merges by `id`, never deletes local facts. Invalid files leave storage unchanged.
- Video: `playsinline` and muted. Rear camera `facingMode: "environment"`.
- TypeScript: no enums (`erasableSyntaxOnly`). Use `import type` (`verbatimModuleSyntax`).
- This folder is **not** a git repository yet. **Skip all `git commit` steps** until the user has initialized git. Do **not** `git init` or contact GitHub until Task 10 (user gate).
- Windows + PowerShell. Run tests with `npm test`. Do not use bash-only syntax.

## File map

- Create: `src/types.ts` — `SavedFact`, `NearbyPlace`, `ExportPayload`
- Create: `src/lib/geo.ts` — haversine, bearing, heading diff, visible/unlockable, AR layout, compass parse
- Create: `src/lib/collection.ts` — score, search, filter, read threshold, unlock helper
- Create: `src/lib/backup.ts` — export payload, parse import, merge facts
- Create: `src/lib/share.ts` — share body + install URL
- Create: `src/lib/wikipedia.ts` — GeoSearch + extracts + no/en merge
- Create: `src/lib/storage.ts` — IndexedDB for `SavedFact[]`
- Create: `src/lib/constants.ts` — numeric/copy constants from the spec
- Create: `src/hunt/useHuntSensors.ts` — one-tap camera + GPS + heading
- Create: `src/hunt/HuntView.tsx` — camera, gate, AR signs
- Create: `src/hunt/ArSign.tsx` — signpost graphic
- Create: `src/facts/FactSheet.tsx` — extract, scroll-to-read, share
- Create: `src/collection/CollectionView.tsx` — search, filter, export/import
- Create: `src/install/InstallPage.tsx` — three sections from spec §7.1
- Create: `src/app/AppShell.tsx` — tabs Jakt/Samling, hash route `#/install`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/index.css`, `index.html`, `vite.config.ts`, `package.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `src/**/*.test.ts` next to the lib they test
- Copy: generated `fact-hunter-icon.png`, `empty-journal.png`, `hunter-badge.png` into `public/`
- Delete leftover Vite template UI: `src/App.css`, default hero assets unused by the app

---

### Task 1: Constants, geo, hunt rules, AR math, vitest

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/geo.ts`
- Create: `src/lib/geo.test.ts`
- Modify: `package.json` (add `test` script, vitest, jsdom)
- Modify: `vite.config.ts` (vitest `test` block + keep react plugin)
- Modify: `tsconfig.app.json` (`types`: `vite/client`, `vitest/globals`)
- Modify: `tsconfig.node.json` include `vite.config.ts` only (vitest config lives in vite.config)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `VISIBLE_RADIUS_M = 500`, `UNLOCK_RADIUS_M = 50`, `UNLOCK_ACCURACY_M = 50`, `FETCH_RADIUS_M = 1000`, `FOV_HALF_DEG = 30`, `MERGE_RADIUS_M = 40`, `REFETCH_MOVE_M = 150`, `POINTS_UNLOCK = 10`, `POINTS_READ = 5`
  - `distanceMeters(a: Coord, b: Coord): number`
  - `bearingDegrees(from: Coord, to: Coord): number`
  - `headingDiffDegrees(heading: number, bearing: number): number` (shortest, range -180..180)
  - `isVisible(distanceM: number): boolean`
  - `isUnlockable(distanceM: number, accuracyM: number): boolean`
  - `inFieldOfView(heading: number, bearing: number): boolean`
  - `headingFromEvent(event: { webkitCompassHeading?: number | null; alpha?: number | null; absolute?: boolean }, screenAngleDeg: number, preferAbsolute: boolean): number | null`
  - `arLayout(input: { headingDeg: number; bearingDeg: number; pitchDeg: number; distanceM: number }): { xPct: number; yPct: number; scale: number } | null`

- [ ] **Step 1: Add vitest**

```powershell
npm install
npm install -D vitest jsdom
```

In `package.json` scripts add `"test": "vitest run"` and `"test:watch": "vitest"`.

In `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/fact_hunter/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
```

Add `"vitest/globals"` to `tsconfig.app.json` `compilerOptions.types` alongside `"vite/client"`.

- [ ] **Step 2: Write the failing geo tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  arLayout,
  bearingDegrees,
  distanceMeters,
  headingDiffDegrees,
  headingFromEvent,
  inFieldOfView,
  isUnlockable,
  isVisible,
} from './geo'

describe('distanceMeters', () => {
  it('is ~0 for the same point', () => {
    const p = { lat: 63.4305, lon: 10.3951 }
    expect(distanceMeters(p, p)).toBeLessThan(1)
  })

  it('is ~111 m for 0.001 deg latitude', () => {
    const a = { lat: 63.43, lon: 10.39 }
    const b = { lat: 63.431, lon: 10.39 }
    expect(distanceMeters(a, b)).toBeGreaterThan(100)
    expect(distanceMeters(a, b)).toBeLessThan(120)
  })
})

describe('bearing and FOV', () => {
  it('bearing north is ~0', () => {
    const from = { lat: 63.43, lon: 10.39 }
    const to = { lat: 63.44, lon: 10.39 }
    const b = bearingDegrees(from, to)
    expect((b + 360) % 360).toBeLessThan(5)
  })

  it('headingDiff wraps across 359/1', () => {
    expect(headingDiffDegrees(359, 1)).toBeCloseTo(2, 5)
    expect(headingDiffDegrees(1, 359)).toBeCloseTo(-2, 5)
  })

  it('FOV is ±30 degrees', () => {
    expect(inFieldOfView(0, 30)).toBe(true)
    expect(inFieldOfView(0, 31)).toBe(false)
  })
})

describe('visibility and unlock', () => {
  it('visible at 500 m, not at 501', () => {
    expect(isVisible(500)).toBe(true)
    expect(isVisible(501)).toBe(false)
  })

  it('unlock only within 50 m and accuracy 50 m', () => {
    expect(isUnlockable(50, 50)).toBe(true)
    expect(isUnlockable(51, 10)).toBe(false)
    expect(isUnlockable(10, 51)).toBe(false)
  })
})

describe('headingFromEvent', () => {
  it('prefers webkitCompassHeading', () => {
    expect(
      headingFromEvent({ webkitCompassHeading: 42, alpha: 10 }, 0, false),
    ).toBe(42)
  })

  it('uses 360-alpha for absolute events', () => {
    expect(
      headingFromEvent({ alpha: 90, absolute: true }, 0, true),
    ).toBe(270)
  })

  it('returns null without data', () => {
    expect(headingFromEvent({ alpha: null }, 0, true)).toBeNull()
  })
})

describe('arLayout', () => {
  it('returns null outside FOV', () => {
    expect(
      arLayout({ headingDeg: 0, bearingDeg: 40, pitchDeg: 90, distanceM: 40 }),
    ).toBeNull()
  })

  it('centers a target straight ahead', () => {
    const p = arLayout({
      headingDeg: 0,
      bearingDeg: 0,
      pitchDeg: 90,
      distanceM: 40,
    })
    expect(p).not.toBeNull()
    expect(p!.xPct).toBeCloseTo(50, 0)
    expect(p!.scale).toBeGreaterThan(0.8)
  })

  it('places a right-hand target to the right', () => {
    const p = arLayout({
      headingDeg: 0,
      bearingDeg: 20,
      pitchDeg: 90,
      distanceM: 100,
    })
    expect(p!.xPct).toBeGreaterThan(50)
  })
})
```

- [ ] **Step 3: Run tests, expect FAIL**

```powershell
npm test
```

Expected: FAIL, `geo` not found.

- [ ] **Step 4: Implement `constants.ts` and `geo.ts`**

`src/lib/constants.ts`:

```ts
export const VISIBLE_RADIUS_M = 500
export const UNLOCK_RADIUS_M = 50
export const UNLOCK_ACCURACY_M = 50
export const FETCH_RADIUS_M = 1000
export const FOV_HALF_DEG = 30
export const MERGE_RADIUS_M = 40
export const REFETCH_MOVE_M = 150
export const POINTS_UNLOCK = 10
export const POINTS_READ = 5
export const APP_NAME = 'FactHunter'
```

`src/lib/geo.ts` — use haversine (`R = 6371000`). Bearing: `atan2(sin Δλ · cos φ2, cos φ1 · sin φ2 − sin φ1 · cos φ2 · cos Δλ)` in degrees, normalized 0..360.

`headingDiffDegrees(heading, bearing)`: `(((bearing - heading + 540) % 360) - 180)`.

`headingFromEvent`: if `webkitCompassHeading` is a finite number, use it (add `screenAngleDeg`, mod 360). Else if `preferAbsolute` or `event.absolute`, and `alpha` is finite, use `(360 - alpha + screenAngleDeg) % 360`. Else null.

`arLayout`: if `!inFieldOfView` return null. `xPct = 50 + (headingDiffDegrees(heading, bearing) / FOV_HALF_DEG) * 50`. `t = clamp(distanceM / VISIBLE_RADIUS_M, 0, 1)`. `yPct = clamp(52 + (90 - pitchDeg) * 0.35 + t * 16, 18, 82)`. `scale = 1.2 - t * 0.55`.

- [ ] **Step 5: Run tests, expect PASS**

```powershell
npm test
```

- [ ] **Step 6: Commit if git exists, otherwise skip**

```powershell
git add src/lib/constants.ts src/lib/geo.ts src/lib/geo.test.ts package.json package-lock.json vite.config.ts tsconfig.app.json
git commit -m "test: add hunt geo rules and AR layout"
```

---

### Task 2: Types, score, search, read threshold

**Files:**
- Create: `src/types.ts`
- Create: `src/lib/collection.ts`
- Create: `src/lib/collection.test.ts`

**Interfaces:**
- Consumes: `POINTS_UNLOCK`, `POINTS_READ` from `src/lib/constants.ts`
- Produces:
  - `type SavedFact` with fields exactly: `id`, `title`, `extract`, `thumbnailUrl?: string`, `pageUrl`, `lang: 'no' | 'en'`, `lat`, `lon`, `unlockedAt`, `readAt?: string`, `source: 'wikipedia'`
  - `factId(lang, pageId) => \`wikipedia:${lang}:${pageId}\``
  - `scoreFor(facts: SavedFact[]): number`
  - `searchFacts(facts, query: string): SavedFact[]`
  - `filterFacts(facts, filter: 'all' | 'unread' | 'read'): SavedFact[]`
  - `isExtractRead(scrollTop, clientHeight, scrollHeight): boolean`
  - `withUnlocked(facts, fact, nowIso): SavedFact[]` (no-op if id exists)
  - `withRead(facts, id, nowIso): SavedFact[]` (no-op if missing or already read)

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  filterFacts,
  isExtractRead,
  scoreFor,
  searchFacts,
  withRead,
  withUnlocked,
} from './collection'
import type { SavedFact } from '../types'

function fact(over: Partial<SavedFact> = {}): SavedFact {
  return {
    id: 'wikipedia:no:1',
    title: 'Stiftsgården',
    extract: 'En bygning i Trondheim',
    pageUrl: 'https://no.wikipedia.org/wiki/Stiftsg%C3%A5rden',
    lang: 'no',
    lat: 63.43,
    lon: 10.39,
    unlockedAt: '2026-01-01T00:00:00.000Z',
    source: 'wikipedia',
    ...over,
  }
}

describe('scoreFor', () => {
  it('is 10 unlocked and +5 when read', () => {
    expect(scoreFor([fact()])).toBe(10)
    expect(scoreFor([fact({ readAt: '2026-01-02T00:00:00.000Z' })])).toBe(15)
  })
})

describe('withUnlocked / withRead', () => {
  it('does not double-unlock or double-read', () => {
    const once = withUnlocked([], fact(), '2026-01-01T00:00:00.000Z')
    const twice = withUnlocked(once, fact({ title: 'Annet' }), '2026-01-03T00:00:00.000Z')
    expect(twice).toHaveLength(1)
    expect(twice[0].title).toBe('Stiftsgården')
    const read = withRead(twice, 'wikipedia:no:1', '2026-01-04T00:00:00.000Z')
    const readAgain = withRead(read, 'wikipedia:no:1', '2026-01-05T00:00:00.000Z')
    expect(readAgain[0].readAt).toBe('2026-01-04T00:00:00.000Z')
    expect(scoreFor(readAgain)).toBe(15)
  })
})

describe('search and filter', () => {
  it('searches title and extract, case-insensitive', () => {
    const facts = [fact(), fact({ id: 'wikipedia:no:2', title: 'Nidelva', extract: 'Elv' })]
    expect(searchFacts(facts, 'stifts').map((f) => f.id)).toEqual(['wikipedia:no:1'])
  })

  it('filters unread vs read', () => {
    const facts = [fact(), fact({ id: 'wikipedia:no:2', readAt: '2026-01-02T00:00:00.000Z' })]
    expect(filterFacts(facts, 'unread')).toHaveLength(1)
    expect(filterFacts(facts, 'read')).toHaveLength(1)
  })
})

describe('isExtractRead', () => {
  it('true at 80% or at bottom', () => {
    expect(isExtractRead(0, 80, 100)).toBe(true)
    expect(isExtractRead(19, 80, 100)).toBe(true)
    expect(isExtractRead(0, 79, 100)).toBe(false)
    expect(isExtractRead(20, 80, 100)).toBe(true)
  })
})
```

- [ ] **Step 2: Run `npm test` — FAIL on missing module**

- [ ] **Step 3: Implement `types.ts` and `collection.ts`**

`isExtractRead`: `scrollHeight <= 0` → false. If `scrollTop + clientHeight >= scrollHeight - 1` → true. Else `(scrollTop + clientHeight) / scrollHeight >= 0.8`.

`searchFacts`: trim query; empty query returns all. Compare with `toLocaleLowerCase('nb')`.

- [ ] **Step 4: `npm test` — PASS**

- [ ] **Step 5: Commit if git exists** (`feat: collection score search and read threshold`)

---

### Task 3: Export / import merge

**Files:**
- Create: `src/lib/backup.ts`
- Create: `src/lib/backup.test.ts`

**Interfaces:**
- Consumes: `SavedFact`, `APP_NAME`
- Produces:
  - `type ExportPayload = { app: 'FactHunter'; version: 1; exportedAt: string; facts: SavedFact[] }`
  - `buildExportPayload(facts, exportedAt): ExportPayload`
  - `parseImportPayload(raw: unknown): { ok: true; facts: SavedFact[] } | { ok: false }`
  - `mergeFacts(local: SavedFact[], incoming: SavedFact[]): { facts: SavedFact[]; newCount: number }`

- [ ] **Step 1: Write failing tests** covering: payload `app` + `version: 1`; reject `{}` and `{ app: 'FactHunter', version: 2, facts: [] }`; merge inserts new ids; merge does not drop local-only facts; same id keeps earliest `unlockedAt`, earliest `readAt` if either read; `newCount` is number of new ids.

Use a helper `fact()` like Task 2.

- [ ] **Step 2: `npm test` — FAIL**

- [ ] **Step 3: Implement**

`parseImportPayload` checks `raw` is object, `app === 'FactHunter'`, `version === 1`, `facts` is array. Map each item through a field guard (required: `id`, `title`, `extract`, `pageUrl`, `lang` in `no|en`, `lat`/`lon` numbers, `unlockedAt` string, `source === 'wikipedia'`). If any item fails, `{ ok: false }` for the whole file (no partial write).

`mergeFacts`: copy local by id. For each incoming: if missing, insert and increment `newCount`. If present: `unlockedAt = min(local, incoming)`; `readAt = min of defined readAts`; keep local `extract`/`thumbnailUrl`/`title` unless they are empty and incoming has values.

- [ ] **Step 4: `npm test` — PASS**

- [ ] **Step 5: Commit if git exists** (`feat: local JSON export import merge`)

---

### Task 4: Share text and install URL

**Files:**
- Create: `src/lib/share.ts`
- Create: `src/lib/share.test.ts`

**Interfaces:**
- Produces:
  - `installUrl(origin: string, base: string): string`
  - `shareText(pageUrl: string, installUrl: string): string`

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { installUrl, shareText } from './share'

it('joins origin, base, install without double slashes', () => {
  expect(installUrl('https://ada.github.io', '/fact_hunter/')).toBe(
    'https://ada.github.io/fact_hunter/install',
  )
})

it('share text has wiki url, FactHunter, and install url', () => {
  const wiki = 'https://no.wikipedia.org/wiki/Nidarosdomen'
  const install = 'https://ada.github.io/fact_hunter/install'
  const text = shareText(wiki, install)
  expect(text).toContain(wiki)
  expect(text).toContain('FactHunter')
  expect(text).toContain(install)
  expect(text).toContain('Se hva jeg fant via FactHunter!')
})
```

Exact body:

```
Se hva jeg fant via FactHunter!
{pageUrl}

Installer appen: {installUrl}
```

- [ ] **Step 2–4: FAIL, implement `installUrl` via `new URL(base, origin)` then `new URL('install', baseUrl).href` (ensure base ends with `/`), PASS**

- [ ] **Step 5: Commit if git exists** (`feat: FactHunter share copy`)

---

### Task 5: Wikipedia client (merge + fetch, mocked)

**Files:**
- Create: `src/lib/wikipedia.ts`
- Create: `src/lib/wikipedia.test.ts`
- Create: `src/types.ts` addition: `NearbyPlace` `{ id, title, extract, thumbnailUrl?: string, pageUrl, lang, lat, lon, pageId: number, source: 'wikipedia' }`

**Interfaces:**
- Consumes: `FETCH_RADIUS_M`, `MERGE_RADIUS_M`, `distanceMeters`, `factId`
- Produces:
  - `mergeWikiPlaces(no: NearbyPlace[], en: NearbyPlace[]): NearbyPlace[]`
  - `shouldRefetch(prev: Coord | null, next: Coord): boolean` — true if prev is null or distance ≥ 150 m
  - `fetchNearbyPlaces(coord: Coord, fetchFn: typeof fetch): Promise<NearbyPlace[]>` — always hits no then en, then merge. On one wiki failing, keep the other. If both fail, throw.

- [ ] **Step 1: Failing tests for merge** (no network): English place 10 m from a Norwegian place is dropped; English place 100 m away is kept; two Norwegian places 10 m apart are both kept.

- [ ] **Step 2: Failing tests for `fetchNearbyPlaces`** with a fake `fetch`:

First call URL contains `no.wikipedia.org` and `ggscoord` / `gscoord` and radius 1000. Second contains `en.wikipedia.org`. Return a generator-geosearch shaped JSON:

```json
{
  "query": {
    "pages": {
      "1": {
        "pageid": 1,
        "title": "Torvet (Trondheim)",
        "extract": "Torget i Trondheim.",
        "canonicalurl": "https://no.wikipedia.org/wiki/Torvet_(Trondheim)",
        "coordinates": [{ "lat": 63.4305, "lon": 10.395, "primary": true }],
        "thumbnail": { "source": "https://example.com/t.jpg" }
      }
    }
  }
}
```

Assert mapped `id` is `wikipedia:no:1`.

- [ ] **Step 3: Implement**

Use one query per language:

`https://${lang}.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=1000&ggslimit=50&prop=extracts|coordinates|pageimages|info&exintro=1&explaintext=1&exchars=400&colimit=1&piprop=thumbnail&pithumbsize=400&inprop=url&format=json&origin=*`

Skip pages without coordinates. `lang` on each place is the host language.

- [ ] **Step 4: `npm test` — PASS**

- [ ] **Step 5: Commit if git exists** (`feat: wikipedia geosearch merge`)

---

### Task 6: IndexedDB storage

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`

**Interfaces:**
- Produces async:
  - `loadFacts(): Promise<SavedFact[]>`
  - `saveFacts(facts: SavedFact[]): Promise<void>`
  - DB name `facthunter`, store `facts`, version `1`, keyPath unused (store a single record `{ key: 'all', facts }`)

- [ ] **Step 1: Add `fake-indexeddb`**

```powershell
npm install -D fake-indexeddb
```

At top of `storage.test.ts`: `import 'fake-indexeddb/auto'`

Test: save two facts, load them back. After `parseImportPayload` failure path is already in backup tests; here only persistence.

- [ ] **Step 2: FAIL, implement open/read/write with IDB promises, PASS**

Open:

```ts
const DB_NAME = 'facthunter'
const STORE = 'facts'
```

`onupgradeneeded`: `createObjectStore(STORE)`. Put `{ id: 'all', facts }`. Get `'all'`.

- [ ] **Step 3: Commit if git exists** (`feat: indexeddb fact collection`)

---

### Task 7: App shell, CSS, install page, assets

**Files:**
- Create: `src/install/InstallPage.tsx`
- Create: `src/install/InstallPage.test.tsx`
- Create: `src/app/AppShell.tsx`
- Modify: `src/App.tsx` (render `AppShell`)
- Modify: `src/index.css` (replace template; mobile full-bleed; teal/cream/gold; safe-area)
- Modify: `index.html` (lang=`nb`, title FactHunter, apple-mobile-web-app, theme-color `#0a2f2e`, viewport-fit=cover, icon)
- Copy PNGs from `C:\Users\reidarki\.cursor\projects\c-Users-reidarki-repos-gitlab-fact-hunter\assets\` to `public/icon.png`, `public/empty-journal.png`, `public/hunter-badge.png`
- Delete: `src/App.css` and stop importing it
- Add: `@testing-library/react` `@testing-library/user-event` `@testing-library/jest-dom`

**Interfaces:**
- Consumes: nothing from hunt yet. `AppShell` takes `tab: 'hunt' | 'collection'`, `onTab`, and `children`. Hash `#/install` shows `InstallPage` instead of tabs.
- Produces install page copy covering: tynt lag over Wikipedia; ingen sky; kun lokalt; flytting bare via eksportfil.

- [ ] **Step 1: Install testing-library and write InstallPage test** that `render(<InstallPage />)` text matches `/Wikipedia/`, `/skyen/`, `/lokalt/`, `/eksporter/`.

- [ ] **Step 2: FAIL, implement the three sections from spec §7.1 plus iOS/Android home-screen steps. PASS**

Install page structure (Norwegian, plain language):

1. Hva dette er
2. Personvern (no cloud, local only, transfer only via export file)
3. Legg til på hjem-skjermen (iOS: Del → Legg til på Hjem-skjerm. Android: meny → Installer app)

- [ ] **Step 3: CSS theme**

```css
:root {
  --ink: #1c1916;
  --paper: #f3ead7;
  --teal: #0f4c4a;
  --teal-deep: #0a2f2e;
  --gold: #c9a227;
}
```

`#root` and `body` height `100dvh`, `overflow: hidden` on hunt. Tab bar with `padding-bottom: env(safe-area-inset-bottom)`.

- [ ] **Step 4: `npm test` and `npx tsc -b --pretty false`**

- [ ] **Step 5: Commit if git exists** (`feat: install page and explorer chrome`)

---

### Task 8: Fact sheet + hunt UI

**Files:**
- Create: `src/facts/FactSheet.tsx`
- Create: `src/facts/FactSheet.test.tsx`
- Create: `src/hunt/ArSign.tsx`
- Create: `src/hunt/HuntView.tsx`
- Create: `src/hunt/useHuntSensors.ts`

**Interfaces:**
- Consumes: `arLayout`, `isVisible`, `isUnlockable`, `inFieldOfView`, `fetchNearbyPlaces`, `loadFacts`/`saveFacts`, `withUnlocked`/`withRead`, `shareText`, `installUrl`, `distanceMeters`, `bearingDegrees`
- Produces:
  - `FactSheet` props: `{ fact: SavedFact | NearbyPlace & { unlocked?: boolean; readAt?: string; distanceM?: number }, onClose, onRead, onShare }`
  - Extract container `onScroll` calls `onRead` once when `isExtractRead(...)`
  - `HuntView` renders permission gate until sensors live, then video + signs
  - `useHuntSensors().startFromUserGesture()` requests geolocation watch, `getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })`, then iOS `DeviceOrientationEvent.requestPermission()` if it is a function, then listens `deviceorientationabsolute` and `deviceorientation`
  - Video: `autoPlay playsInline muted` (React: `playsInline`)
  - Signs only if `isVisible` and `arLayout` non-null
  - Sign state: `locked` (not unlockable), `ready` (unlockable), `owned` (id in collection)
  - Tap ready → persist via `withUnlocked` + open sheet. Tap owned → open sheet without new points. Tap locked → do nothing except the label «Gå nærmere» is visible
  - If `accuracy > 50`: banner «GPS usikker»
  - Wikipedia error banner; empty: «Ingen steder her — gå litt»
  - Compass rose rotated by heading

- [ ] **Step 1: FactSheet test** — render a fact with a short extract in a 50px-high scroll box (mock layout by calling the same `isExtractRead` from a test of the handler, or fire scroll on a div with `data-testid="extract"`). Simpler: unit-test is already in collection; here test that share button exists with name `/Del/` and that the extract is shown.

- [ ] **Step 2: Implement FactSheet share actions:** `navigator.share` if present; always also buttons Kopier (`navigator.clipboard.writeText`), SMS (`sms:?body=`), E-post (`mailto:?subject=FactHunter&body=`). Encode URI for sms/mailto.

- [ ] **Step 3: Implement ArSign** as a column: pole + plaque. CSS: `.sign.ready` gold glow; `.sign.locked` opacity 0.65; `.sign.owned` teal check. Position `left: xPct%; top: yPct%; transform: translate(-50%, -100%) scale(scale)`.

- [ ] **Step 4: Implement HuntView + useHuntSensors** as specified. Do not start hunt without all three. Gate copy: missing camera / kompass / posisjon, **Prøv igjen**, HTTPS hint, iPhone «Bevegelse og retning».

Camera overlay: full-viewport `<video>` `object-fit: cover`, signs in an absolutely positioned layer `pointer-events: none` except `.sign { pointer-events: auto }`.

Refetch nearby when `shouldRefetch`.

- [ ] **Step 5: `npm test` + typecheck**

- [ ] **Step 6: Commit if git exists** (`feat: camera hunt with AR signposts`)

---

### Task 9: Collection view + export/import wiring

**Files:**
- Create: `src/collection/CollectionView.tsx`
- Create: `src/collection/CollectionView.test.tsx`
- Modify: `src/app/AppShell.tsx` to host HuntView / CollectionView / InstallPage

**Interfaces:**
- Consumes: `loadFacts`, `saveFacts`, `searchFacts`, `filterFacts`, `scoreFor`, `buildExportPayload`, `parseImportPayload`, `mergeFacts`
- Produces: search field, filter alle/ulest/lest, score, list, empty state using `/fact_hunter/empty-journal.png` (or `import.meta.env.BASE_URL + 'empty-journal.png'`), Eksporter / Importer, opens FactSheet

- [ ] **Step 1: Test** render with injected facts (prop `facts` + `onChange` to keep storage out of the unit test). Query `stifts` hides the other card. Filter `Lest` shows only read.

- [ ] **Step 2: Implement export** as Blob download `facthunter-samling-YYYY-MM-DD.json` plus `navigator.share({ files: [file] })` when `canShare` allows files.

- [ ] **Step 3: Implement import** `<input type="file" accept="application/json,.json">`. On failure show «Kunne ikke lese filen» and do not call `onChange`. On success merge, `onChange(merged)`, alert/text «Importerte N nye fakta».

- [ ] **Step 4: Wire App.tsx**: load IndexedDB on boot; pass facts to hunt + collection; hashchange for `#/install`. Tab **Jakt** | **Samling**. Link «Om appen» → `#/install`.

- [ ] **Step 5: `npm test`**

- [ ] **Step 6: Commit if git exists** (`feat: searchable collection with backup`)

---

### Task 10: PWA, HTTPS dev, README — then STOP for GitHub

**Files:**
- Modify: `vite.config.ts` — `VitePWA` + `basicSsl` in `dev` when `process.env.HTTPS === '1'`
- Modify: `package.json` scripts: `"dev": "vite --host"`, `"dev:https": "set HTTPS=1&& vite --host"` (PowerShell: `"dev:https": "vite --host --https"` via plugin)
- Modify: `README.md` replace the Vite template with how to run and that GitHub Pages is the host
- Create: `.github/workflows/pages.yml` (ready, unused until the user creates GitHub)

**PWA manifest:** name FactHunter, `display: standalone`, `start_url: /fact_hunter/`, icons `icon.png`, theme `#0a2f2e`, background `#f3ead7`.

Use `vite-plugin-pwa`:

```powershell
npm install -D vite-plugin-pwa @vitejs/plugin-basic-ssl
```

```ts
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: '/fact_hunter/',
  plugins: [
    react(),
    process.env.HTTPS === '1' ? basicSsl() : null,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'empty-journal.png', 'hunter-badge.png'],
      manifest: {
        name: 'FactHunter',
        short_name: 'FactHunter',
        lang: 'nb',
        start_url: '/fact_hunter/',
        scope: '/fact_hunter/',
        display: 'standalone',
        background_color: '#f3ead7',
        theme_color: '#0a2f2e',
        icons: [{ src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
      },
    }),
  ].filter(Boolean),
})
```

GitHub Action (do not run until repo exists):

```yaml
name: GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

README must say: phone testing needs `npm run dev:https`; camera/compass will not work on `http://192.168...`.

- [ ] **Step 1: Implement PWA + HTTPS plugin + README + workflow file**

- [ ] **Step 2: `npm test` and `npm run build`** (build output in `dist/`, assets prefixed `/fact_hunter/`)

- [ ] **Step 3: STOP. Do not `git init`. Do not create a GitHub repo. Tell the user:**

> Appen er klar lokalt. For GitHub Pages trenger jeg at du (1) gjør mappen til et git-repo, (2) lager et GitHub-repo der jeg har push-tilgang, (3) slår på Pages via GitHub Actions. Si ifra når det er gjort.

---

## Self-review (spec coverage)

| Spec | Task |
| --- | --- |
| PWA, GitHub Pages base `/fact_hunter/` | 1, 10 |
| Start jakt camera+GPS+compass, playsinline | 8 |
| 500 / 50 / accuracy 50 / FOV 60 | 1, 8 |
| AR signpost layout | 1, 8 |
| Wikipedia no+en merge 40 m | 5 |
| Unlock 10, read 5, no double, derived score | 2, 8, 9 |
| Collection search/filter | 2, 9 |
| Share copy + install URL | 4, 8 |
| Install page privacy + thin Wikipedia layer | 7 |
| Export/import merge, invalid file safe | 3, 9 |
| IndexedDB only | 6 |
| No WikiStrinda / no server | all |
| Unit tests listed in spec §10 | 1–6, 7, 9 |
| Manual phone + GitHub | 10, user gate |

No TBD. Types use `SavedFact.id` as `wikipedia:<lang>:<pageId>` throughout.

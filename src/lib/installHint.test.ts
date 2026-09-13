import { describe, expect, it } from 'vitest'
import {
  isDesktopLike,
  isStandaloneDisplay,
  parseInstallHintDismissed,
  readDisplayMode,
  shouldShowInstallHint,
  shouldShowInstallHintFromWindow,
} from './installHint'

describe('isStandaloneDisplay', () => {
  it('treats standalone, fullscreen, minimal-ui and iOS standalone as installed', () => {
    expect(isStandaloneDisplay({ displayMode: 'standalone' })).toBe(true)
    expect(isStandaloneDisplay({ displayMode: 'fullscreen' })).toBe(true)
    expect(isStandaloneDisplay({ displayMode: 'minimal-ui' })).toBe(true)
    expect(
      isStandaloneDisplay({ displayMode: 'browser', navigatorStandalone: true }),
    ).toBe(true)
  })

  it('treats a regular browser tab as not installed', () => {
    expect(isStandaloneDisplay({ displayMode: 'browser' })).toBe(false)
    expect(
      isStandaloneDisplay({
        displayMode: 'browser',
        navigatorStandalone: false,
      }),
    ).toBe(false)
  })
})

describe('shouldShowInstallHint', () => {
  it('shows on a phone browser tab that has not dismissed the hint', () => {
    expect(
      shouldShowInstallHint({
        standalone: false,
        desktopLike: false,
        dismissed: false,
      }),
    ).toBe(true)
  })

  it('hides when installed, on desktop, or after dismiss', () => {
    expect(
      shouldShowInstallHint({
        standalone: true,
        desktopLike: false,
        dismissed: false,
      }),
    ).toBe(false)
    expect(
      shouldShowInstallHint({
        standalone: false,
        desktopLike: true,
        dismissed: false,
      }),
    ).toBe(false)
    expect(
      shouldShowInstallHint({
        standalone: false,
        desktopLike: false,
        dismissed: true,
      }),
    ).toBe(false)
  })
})

describe('parseInstallHintDismissed', () => {
  it('is dismissed only for the stored dismissed value', () => {
    expect(parseInstallHintDismissed(null)).toBe(false)
    expect(parseInstallHintDismissed('')).toBe(false)
    expect(parseInstallHintDismissed('dismissed')).toBe(true)
  })
})

describe('readDisplayMode', () => {
  it('picks the first matching display-mode query', () => {
    expect(
      readDisplayMode((query) => ({
        matches: query.includes('standalone'),
      })),
    ).toBe('standalone')
    expect(
      readDisplayMode((query) => ({
        matches: query.includes('fullscreen'),
      })),
    ).toBe('fullscreen')
    expect(readDisplayMode(() => ({ matches: false }))).toBe('browser')
  })
})

describe('isDesktopLike', () => {
  it('is true for hover plus fine pointer', () => {
    expect(
      isDesktopLike((query) => ({
        matches: query.includes('hover: hover') && query.includes('pointer: fine'),
      })),
    ).toBe(true)
    expect(isDesktopLike(() => ({ matches: false }))).toBe(false)
  })
})

describe('shouldShowInstallHintFromWindow', () => {
  it('shows in a phone-like browser tab', () => {
    expect(
      shouldShowInstallHintFromWindow(
        { matchMedia: () => ({ matches: false }), navigator: {} },
        null,
      ),
    ).toBe(true)
  })

  it('hides when iOS reports navigator.standalone', () => {
    expect(
      shouldShowInstallHintFromWindow(
        {
          matchMedia: () => ({ matches: false }),
          navigator: { standalone: true },
        },
        null,
      ),
    ).toBe(false)
  })
})

export const INSTALL_HINT_STORAGE_KEY = 'facthunter-install-hint'
export const INSTALL_HINT_DISMISSED = 'dismissed'

export type DisplayMode = 'browser' | 'standalone' | 'fullscreen' | 'minimal-ui'

export type MediaMatch = { matches: boolean }

export function isStandaloneDisplay(opts: {
  displayMode: DisplayMode
  navigatorStandalone?: boolean
}): boolean {
  if (opts.navigatorStandalone === true) return true
  return (
    opts.displayMode === 'standalone' ||
    opts.displayMode === 'fullscreen' ||
    opts.displayMode === 'minimal-ui'
  )
}

export function shouldShowInstallHint(opts: {
  standalone: boolean
  desktopLike: boolean
  dismissed: boolean
}): boolean {
  return !opts.standalone && !opts.desktopLike && !opts.dismissed
}

export function parseInstallHintDismissed(value: string | null): boolean {
  return value === INSTALL_HINT_DISMISSED
}

export function readDisplayMode(
  matchMedia: (query: string) => MediaMatch,
): DisplayMode {
  if (matchMedia('(display-mode: standalone)').matches) return 'standalone'
  if (matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen'
  if (matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui'
  return 'browser'
}

export function isDesktopLike(
  matchMedia: (query: string) => MediaMatch,
): boolean {
  return matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function shouldShowInstallHintFromWindow(
  win: {
    matchMedia?: (query: string) => MediaMatch
    navigator: { standalone?: boolean }
  },
  stored: string | null,
): boolean {
  const matchMedia = win.matchMedia ?? (() => ({ matches: false }))
  return shouldShowInstallHint({
    standalone: isStandaloneDisplay({
      displayMode: readDisplayMode(matchMedia),
      navigatorStandalone: win.navigator.standalone,
    }),
    desktopLike: isDesktopLike(matchMedia),
    dismissed: parseInstallHintDismissed(stored),
  })
}

export function readStoredInstallHint(): string | null {
  try {
    return localStorage.getItem(INSTALL_HINT_STORAGE_KEY)
  } catch {
    return null
  }
}

export function dismissInstallHint(): void {
  try {
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, INSTALL_HINT_DISMISSED)
  } catch {
    /* private mode */
  }
}

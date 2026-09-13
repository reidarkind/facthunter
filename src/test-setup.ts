import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { INSTALL_HINT_STORAGE_KEY } from './lib/installHint'
import { LOCALE_STORAGE_KEY } from './lib/locale'
import { WIKI_LIMIT_STORAGE_KEY } from './lib/prefs'

Object.defineProperty(navigator, 'languages', {
  configurable: true,
  get: () => ['nb-NO'],
})

afterEach(() => {
  cleanup()
  localStorage.removeItem(LOCALE_STORAGE_KEY)
  localStorage.removeItem(WIKI_LIMIT_STORAGE_KEY)
  localStorage.removeItem(INSTALL_HINT_STORAGE_KEY)
  document.documentElement.lang = 'nb'
})

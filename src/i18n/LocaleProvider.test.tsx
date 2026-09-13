import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PrefsProvider } from '../app/PrefsProvider'
import { SettingsPage } from '../app/SettingsPage'
import { LOCALE_STORAGE_KEY } from '../lib/locale'
import { LocaleProvider } from './LocaleProvider'

function stubLanguages(tags: readonly string[]) {
  Object.defineProperty(navigator, 'languages', {
    configurable: true,
    get: () => tags,
  })
}

afterEach(() => {
  stubLanguages(['nb-NO'])
})

it('uses the phone language when nothing is stored', () => {
  stubLanguages(['de-DE'])
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(
    screen.getByRole('heading', { name: 'Einstellungen' }),
  ).toBeInTheDocument()
  expect(document.documentElement.lang).toBe('de')
})

it('keeps a stored locale over the phone language', () => {
  localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
  stubLanguages(['de-DE'])
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  expect(document.documentElement.lang).toBe('en')
})

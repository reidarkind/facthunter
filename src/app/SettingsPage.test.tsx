import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { buildExportPayload } from '../lib/backup'
import type { SavedFact } from '../types'
import { PrefsProvider } from './PrefsProvider'
import { SettingsPage } from './SettingsPage'

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

it('lists UI languages with native names', () => {
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const language = screen.getByLabelText('Språk')
  expect(language.tagName).toBe('SELECT')
  expect(language).toHaveValue('no')
  const options = within(language)
  expect(options.getByRole('option', { name: 'Norsk' })).toBeInTheDocument()
  expect(options.getByRole('option', { name: 'English' })).toBeInTheDocument()
  expect(options.getByRole('option', { name: 'Deutsch' })).toBeInTheDocument()
  expect(options.getByRole('option', { name: 'Español' })).toBeInTheDocument()
  expect(options.getByRole('option', { name: 'Português' })).toBeInTheDocument()
  expect(options.getByRole('option', { name: 'Français' })).toBeInTheDocument()
  expect(screen.getByText(/språket til appen/i)).toBeInTheDocument()
  expect(screen.getByText(/faktaene du finner/)).toBeInTheDocument()
})

it('switches the settings heading for each UI language', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Innstillinger' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Språk'), 'en')
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Language'), 'de')
  expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Sprache'), 'es')
  expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Idioma'), 'pt')
  expect(screen.getByRole('heading', { name: 'Definições' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Idioma'), 'fr')
  expect(screen.getByRole('heading', { name: 'Réglages' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Langue'), 'no')
  expect(screen.getByRole('heading', { name: 'Innstillinger' })).toBeInTheDocument()
})

it('offers export and import next to collection reset', async () => {
  const user = userEvent.setup()
  const onFactsChange = vi.fn()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={() => {}}
          facts={[]}
          onFactsChange={onFactsChange}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Wikipedia-samling' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Eksporter' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Importer' })).toBeInTheDocument()
  expect(screen.getByText(/Eksporter først/)).toBeInTheDocument()

  const file = new File(
    [JSON.stringify(buildExportPayload([fact()], '2026-09-11T12:00:00.000Z'))],
    'samling.json',
    { type: 'application/json' },
  )
  const input = document.querySelector('input[type="file"]')
  expect(input).toBeInstanceOf(HTMLInputElement)
  await user.upload(input as HTMLInputElement, file)
  expect(onFactsChange).toHaveBeenCalledTimes(1)
  expect(onFactsChange.mock.calls[0]?.[0]).toEqual([fact()])
  expect(screen.getByText('Importerte 1 nye fakta')).toBeInTheDocument()
})

it('asks to merge or replace when importing into a non-empty collection', async () => {
  const user = userEvent.setup()
  const onFactsChange = vi.fn()
  const local = fact({ id: 'wikipedia:no:local', title: 'Lokal' })
  const incoming = fact({ id: 'wikipedia:no:2', title: 'Nidelva' })
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={() => {}}
          facts={[local]}
          onFactsChange={onFactsChange}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const file = new File(
    [JSON.stringify(buildExportPayload([incoming], '2026-09-11T12:00:00.000Z'))],
    'samling.json',
    { type: 'application/json' },
  )
  await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file)
  expect(onFactsChange).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Flett inn' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Erstatt' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Flett inn' }))
  expect(onFactsChange).toHaveBeenCalledTimes(1)
  expect(onFactsChange.mock.calls[0]?.[0].map((item: SavedFact) => item.id)).toEqual([
    'wikipedia:no:local',
    'wikipedia:no:2',
  ])
})

it('replaces the collection when the user chooses replace on import', async () => {
  const user = userEvent.setup()
  const onFactsChange = vi.fn()
  const local = fact({ id: 'wikipedia:no:local', title: 'Lokal' })
  const incoming = fact({ id: 'wikipedia:no:2', title: 'Nidelva' })
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={() => {}}
          facts={[local]}
          onFactsChange={onFactsChange}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const file = new File(
    [JSON.stringify(buildExportPayload([incoming], '2026-09-11T12:00:00.000Z'))],
    'samling.json',
    { type: 'application/json' },
  )
  await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file)
  await user.click(screen.getByRole('button', { name: 'Erstatt' }))
  expect(onFactsChange.mock.calls[0]?.[0]).toEqual([incoming])
  expect(screen.getByText('Samlingen er erstattet.')).toBeInTheDocument()
})

it('cancels a pending import without changing facts', async () => {
  const user = userEvent.setup()
  const onFactsChange = vi.fn()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={() => {}}
          facts={[fact()]}
          onFactsChange={onFactsChange}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const file = new File(
    [JSON.stringify(buildExportPayload([fact({ id: 'wikipedia:no:2' })], '2026-09-11T12:00:00.000Z'))],
    'samling.json',
    { type: 'application/json' },
  )
  await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file)
  await user.click(screen.getByRole('button', { name: 'Avbryt' }))
  expect(onFactsChange).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: 'Flett inn' })).not.toBeInTheDocument()
})

it('names the Wikipedia collection in each UI language', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={() => {}}
          facts={[]}
          onFactsChange={() => {}}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Wikipedia-samling' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Språk'), 'en')
  expect(screen.getByRole('heading', { name: 'Wikipedia collection' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Language'), 'de')
  expect(screen.getByRole('heading', { name: 'Wikipedia-Sammlung' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Sprache'), 'es')
  expect(screen.getByRole('heading', { name: 'Colección de Wikipedia' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Idioma'), 'pt')
  expect(screen.getByRole('heading', { name: 'Coleção da Wikipedia' })).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Idioma'), 'fr')
  expect(screen.getByRole('heading', { name: 'Collection Wikipédia' })).toBeInTheDocument()
})

it('clears the collection only after confirm', async () => {
  const user = userEvent.setup()
  const onClearCollection = vi.fn()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          onClearCollection={onClearCollection}
          facts={[]}
          onFactsChange={() => {}}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(
    screen.queryByText(/Slette alle opplåste steder/),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Tøm samling' }))
  expect(onClearCollection).not.toHaveBeenCalled()
  expect(screen.getByText(/Slette alle opplåste steder/)).toBeInTheDocument()
  expect(screen.getByText(/Eksporter først/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Avbryt' }))
  expect(onClearCollection).not.toHaveBeenCalled()
  expect(
    screen.queryByRole('button', { name: 'Tøm samlingen' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Tøm samling' }))
  await user.click(screen.getByRole('button', { name: 'Tøm samlingen' }))
  expect(onClearCollection).toHaveBeenCalledTimes(1)
})

it('hides collection reset when it cannot clear', () => {
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(
    screen.queryByRole('button', { name: 'Tøm samling' }),
  ).not.toBeInTheDocument()
})

it('checks for an app update from settings', async () => {
  const user = userEvent.setup()
  const checkUpdate = vi.fn(async () => 'current' as const)
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage checkUpdate={checkUpdate} applyUpdate={() => {}} />
      </PrefsProvider>
    </LocaleProvider>,
  )
  await user.click(screen.getByRole('button', { name: 'Sjekk for oppdateringer' }))
  expect(checkUpdate).toHaveBeenCalledTimes(1)
  expect(screen.getByText('Du har nyeste versjon.')).toBeInTheDocument()
})

it('offers to load a waiting app update', async () => {
  const user = userEvent.setup()
  const applyUpdate = vi.fn()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage
          checkUpdate={async () => 'available'}
          applyUpdate={applyUpdate}
        />
      </PrefsProvider>
    </LocaleProvider>,
  )
  await user.click(screen.getByRole('button', { name: 'Sjekk for oppdateringer' }))
  expect(screen.getByText(/Ny versjon/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Last inn ny versjon' }))
  expect(applyUpdate).toHaveBeenCalledTimes(1)
})

it('lets the user raise the Wikipedia result cap', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const twoFifty = screen.getByRole('button', { name: '250' })
  expect(twoFifty).toHaveAttribute('aria-pressed', 'false')
  await user.click(twoFifty)
  expect(twoFifty).toHaveAttribute('aria-pressed', 'true')
})

it('lets the user pick Wikipedia source languages', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  const primary = screen.getByLabelText('Første')
  expect(primary).toHaveValue('no')
  expect(screen.getByLabelText('Andre')).toHaveValue('en')
  expect(screen.getByLabelText('Tredje')).toHaveValue('')
  await user.selectOptions(primary, 'es')
  expect(primary).toHaveValue('es')
  expect(screen.getByLabelText('Andre')).toHaveValue('en')
  expect(screen.getByLabelText('Tredje')).toHaveValue('')
  await user.selectOptions(screen.getByLabelText('Tredje'), 'sv')
  expect(screen.getByLabelText('Tredje')).toHaveValue('sv')
  await user.selectOptions(screen.getByLabelText('Andre'), '')
  expect(screen.getByLabelText('Andre')).toHaveValue('sv')
  expect(screen.getByLabelText('Tredje')).toHaveValue('')
  await user.selectOptions(screen.getByLabelText('Andre'), '')
  expect(screen.getByLabelText('Første')).toHaveValue('es')
  expect(screen.getByLabelText('Andre')).toHaveValue('')
  expect(screen.getByLabelText('Tredje')).toHaveValue('')
})

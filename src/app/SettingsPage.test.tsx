import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { PrefsProvider } from './PrefsProvider'
import { SettingsPage } from './SettingsPage'

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

it('clears the collection only after confirm', async () => {
  const user = userEvent.setup()
  const onClearCollection = vi.fn()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage onClearCollection={onClearCollection} />
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

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { PrefsProvider } from './PrefsProvider'
import { SettingsPage } from './SettingsPage'

it('switches the settings heading to English', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <PrefsProvider>
        <SettingsPage />
      </PrefsProvider>
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Innstillinger' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'English' }))
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
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

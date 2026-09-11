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

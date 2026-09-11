import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { SettingsPage } from './SettingsPage'

it('switches the settings heading to English', async () => {
  const user = userEvent.setup()
  render(
    <LocaleProvider>
      <SettingsPage />
    </LocaleProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Innstillinger' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'English' }))
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
})

import 'fake-indexeddb/auto'
import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'
import { PrefsProvider } from './app/PrefsProvider'

it('opens on Rekognoser, not Jakt', () => {
  render(
    <PrefsProvider>
      <App />
    </PrefsProvider>,
  )
  expect(
    screen.getByRole('button', { name: 'Start rekognosering' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Start jakt' }),
  ).not.toBeInTheDocument()

  const nav = screen.getByRole('navigation', { name: 'Hovedmeny' })
  expect(within(nav).getByRole('button', { name: 'Rekognoser' })).toHaveClass(
    'active',
  )
})

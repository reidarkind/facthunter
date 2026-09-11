import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { AppShell } from './AppShell'

function renderShell() {
  return render(
    <AppShell
      tab="hunt"
      onTab={() => {}}
      overlay="none"
      onCloseOverlay={() => {}}
    >
      <div>innhold</div>
    </AppShell>,
  )
}

it('orders tabs Scout, Hunt, Collection as Rekognoser, Jakt, Samling', () => {
  renderShell()
  const nav = screen.getByRole('navigation', { name: 'Hovedmeny' })
  const tabs = within(nav)
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-haspopup') !== 'true')
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    'Rekognoser',
    'Jakt',
    'Samling',
  ])
})

it('opens settings and about from the hamburger', async () => {
  const user = userEvent.setup()
  renderShell()
  await user.click(screen.getByRole('button', { name: 'Meny' }))
  expect(screen.getByRole('link', { name: 'Innstillinger' })).toHaveAttribute(
    'href',
    '#/settings',
  )
  expect(screen.getByRole('link', { name: 'Om appen' })).toHaveAttribute(
    'href',
    '#/install',
  )
})

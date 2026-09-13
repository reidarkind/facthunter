import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ReconView } from './ReconView'

function stubDisplay(opts: { standalone: boolean; desktop: boolean }) {
  window.matchMedia = ((query: string) => ({
    matches:
      (opts.standalone && query.includes('display-mode: standalone')) ||
      (opts.desktop &&
        query.includes('hover: hover') &&
        query.includes('pointer: fine')),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

it('greets with the hunter badge and knowledge in the distance', () => {
  stubDisplay({ standalone: true, desktop: false })
  render(<ReconView />)
  expect(screen.getByRole('heading', { name: 'FactHunter' })).toBeInTheDocument()
  expect(screen.getByText(/kunnskap i det fjerne/i)).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Start rekognosering' }),
  ).toBeInTheDocument()
  expect(screen.getByAltText('')).toHaveAttribute(
    'src',
    expect.stringContaining('hunter-badge.png'),
  )
})

it('offers a home-screen install hint in a phone browser tab', () => {
  stubDisplay({ standalone: false, desktop: false })
  render(<ReconView />)
  expect(
    screen.getByRole('link', { name: 'Bedre fra hjem-skjermen' }),
  ).toHaveAttribute('href', '#/install')
})

it('hides the install hint in standalone display', () => {
  stubDisplay({ standalone: true, desktop: false })
  render(<ReconView />)
  expect(
    screen.queryByRole('link', { name: 'Bedre fra hjem-skjermen' }),
  ).not.toBeInTheDocument()
})

it('hides the install hint on a desktop browser', () => {
  stubDisplay({ standalone: false, desktop: true })
  render(<ReconView />)
  expect(
    screen.queryByRole('link', { name: 'Bedre fra hjem-skjermen' }),
  ).not.toBeInTheDocument()
})

it('dismisses the install hint and remembers it', async () => {
  stubDisplay({ standalone: false, desktop: false })
  const user = userEvent.setup()
  const first = render(<ReconView />)
  await user.click(screen.getByRole('button', { name: 'Lukk' }))
  expect(
    screen.queryByRole('link', { name: 'Bedre fra hjem-skjermen' }),
  ).not.toBeInTheDocument()
  first.unmount()
  render(<ReconView />)
  expect(
    screen.queryByRole('link', { name: 'Bedre fra hjem-skjermen' }),
  ).not.toBeInTheDocument()
})

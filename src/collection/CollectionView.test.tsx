import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect } from 'vitest'
import { CollectionView } from './CollectionView'
import type { SavedFact } from '../types'

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

const facts: SavedFact[] = [
  fact(),
  fact({
    id: 'wikipedia:no:2',
    title: 'Nidelva',
    extract: 'Elv',
    readAt: '2026-01-02T00:00:00.000Z',
  }),
]

it('search for stifts hides the other card', async () => {
  const user = userEvent.setup()
  render(<CollectionView facts={facts} onChange={() => {}} />)
  await user.type(screen.getByRole('searchbox'), 'stifts')
  expect(screen.getByText('Stiftsgården')).toBeInTheDocument()
  expect(screen.queryByText('Nidelva')).not.toBeInTheDocument()
})

it('does not offer export or import on the collection tab', () => {
  render(<CollectionView facts={facts} onChange={() => {}} />)
  expect(screen.queryByRole('button', { name: 'Eksporter' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Importer' })).not.toBeInTheDocument()
})

it('filter Lest shows only read facts', async () => {
  const user = userEvent.setup()
  render(<CollectionView facts={facts} onChange={() => {}} />)
  await user.click(
    within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', {
      name: 'Lest',
    }),
  )
  expect(screen.getByText('Nidelva')).toBeInTheDocument()
  expect(screen.queryByText('Stiftsgården')).not.toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import { FactSheet } from './FactSheet'

it('shows the extract and a Del button', () => {
  render(
    <FactSheet
      fact={{
        id: 'wikipedia:no:1',
        title: 'Stiftsgården',
        extract: 'En bygning i Trondheim',
        pageUrl: 'https://no.wikipedia.org/wiki/Stiftsgården',
        lang: 'no',
      }}
      onClose={() => {}}
      onRead={() => {}}
    />,
  )
  expect(screen.getByText('En bygning i Trondheim')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Del/ })).toBeInTheDocument()
})

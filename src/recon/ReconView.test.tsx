import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { ReconView } from './ReconView'

it('greets with the hunter badge and knowledge in the distance', () => {
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

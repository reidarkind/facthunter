import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { HuntView } from './HuntView'

it('keeps the iPhone motion hint and omits the http Wi-Fi line', () => {
  render(<HuntView facts={[]} onFactsChange={() => {}} />)
  expect(screen.getByText(/Bevegelse og retning/)).toBeInTheDocument()
  expect(document.body.textContent ?? '').not.toMatch(/http over Wi-Fi/i)
})

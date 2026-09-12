import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { ArSign } from './ArSign'

it('shows how far away the place is', () => {
  render(
    <LocaleProvider>
      <ArSign
        title="Nidarosdomen"
        kind="locked"
        xPct={50}
        yPct={50}
        scale={1}
        distanceM={87}
        zIndex={400}
        onClick={() => {}}
      />
    </LocaleProvider>,
  )
  expect(screen.getByText('87 m unna')).toBeInTheDocument()
  expect(screen.getByText('Gå nærmere')).toBeInTheDocument()
})

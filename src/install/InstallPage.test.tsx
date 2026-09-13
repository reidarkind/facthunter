import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { InstallPage } from './InstallPage'

it('covers Wikipedia, privacy, and local export', () => {
  render(<InstallPage />)
  const body = document.body.textContent ?? ''
  expect(body).toMatch(/Wikipedia/)
  expect(body).toMatch(/skyen/)
  expect(body).toMatch(/lokalt/)
  expect(body).toMatch(/synkroniserer/)
  expect(body).not.toMatch(/synker/)
  expect(body).toMatch(/kameraet bak på telefonen/)
  expect(body).toMatch(/Reidar Kind/)
  expect(body).toMatch(/AI/)
})

it('links to other apps and a coffee tip', () => {
  render(<InstallPage />)
  expect(
    screen.getByRole('link', { name: 'Andre apper jeg har laget' }),
  ).toHaveAttribute('href', 'https://reidarkind.github.io/myapps/')
  expect(screen.getByRole('link', { name: /Kjøp en kaffe/ })).toHaveAttribute(
    'href',
    'https://www.buymeacoffee.com/reidarkind',
  )
  expect(document.querySelector('script[data-name="bmc-button"]')).toBeNull()
})

it('explains home-screen install on iPhone and Android', () => {
  render(<InstallPage />)
  expect(screen.getByRole('heading', { name: 'iPhone' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Android' })).toBeInTheDocument()
  const body = document.body.textContent ?? ''
  expect(body).toMatch(/Legg til på Hjem-skjerm/)
  expect(body).toMatch(/Installer app/)
  expect(body).toMatch(/Safari/)
  expect(body).toMatch(/Chrome/)
})

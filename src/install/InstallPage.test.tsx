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

it('links to other apps and embeds the Buy Me a Coffee button', () => {
  render(<InstallPage />)
  expect(
    screen.getByRole('link', { name: 'Andre apper jeg har laget' }),
  ).toHaveAttribute('href', 'https://reidarkind.github.io/myapps/')
  const script = document.querySelector('script[data-name="bmc-button"]')
  expect(script).toHaveAttribute(
    'src',
    'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js',
  )
  expect(script).toHaveAttribute('data-slug', 'reidarkind')
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

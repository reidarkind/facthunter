/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { AppShell } from './AppShell'

const appCss = readFileSync(resolve('src/index.css'), 'utf8')

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

function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{[^}]+\\}`))?.[0] ?? ''
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

it('keeps the hamburger menu in front of Rekognoser layers', async () => {
  const user = userEvent.setup()
  render(
    <AppShell
      tab="recon"
      onTab={() => {}}
      overlay="none"
      onCloseOverlay={() => {}}
    >
      <div className="recon">
        <div className="recon-vignette" />
        <div className="recon-hud" />
      </div>
    </AppShell>,
  )
  await user.click(screen.getByRole('button', { name: 'Meny' }))
  expect(screen.getByRole('dialog', { name: 'Meny' })).toBeInTheDocument()

  const main = cssBlock('.app-main')
  const menu = cssBlock('.app-menu-backdrop')
  const vignette = cssBlock('.recon-vignette')
  const hud = cssBlock('.recon-hud')
  const menuZ = Number(/z-index:\s*(-?\d+)/.exec(menu)?.[1])
  const vignetteZ = Number(/z-index:\s*(-?\d+)/.exec(vignette)?.[1])
  const hudZ = Number(/z-index:\s*(-?\d+)/.exec(hud)?.[1])
  expect(main).toMatch(/isolation:\s*isolate/)
  expect(main).toMatch(/z-index:\s*0/)
  expect(menuZ).toBeGreaterThan(vignetteZ)
  expect(menuZ).toBeGreaterThan(hudZ)
})

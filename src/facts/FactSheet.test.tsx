import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { FactSheet } from './FactSheet'

const fact = {
  id: 'wikipedia:no:1',
  title: 'Stiftsgården',
  extract: 'En bygning i Trondheim',
  pageUrl: 'https://no.wikipedia.org/wiki/Stiftsgården',
  lang: 'no',
}

function mockSheetScroll(
  sheet: HTMLElement,
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
) {
  Object.defineProperty(sheet, 'scrollTop', { configurable: true, value: scrollTop })
  Object.defineProperty(sheet, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  })
  Object.defineProperty(sheet, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  })
  fireEvent.scroll(sheet)
}

it('shows the extract and a Del button', () => {
  render(
    <FactSheet fact={fact} onClose={() => {}} onRead={() => {}} />,
  )
  expect(screen.getByText('En bygning i Trondheim')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Del/ })).toBeInTheDocument()
})

it('marks as read when opening the Wikipedia article', async () => {
  const user = userEvent.setup()
  const onRead = vi.fn()
  render(<FactSheet fact={fact} onClose={() => {}} onRead={onRead} />)
  await user.click(screen.getByRole('link', { name: 'Les mer på Wikipedia' }))
  expect(onRead).toHaveBeenCalled()
})

it('marks as read when the sheet is scrolled through', () => {
  const onRead = vi.fn()
  render(<FactSheet fact={fact} onClose={() => {}} onRead={onRead} />)
  mockSheetScroll(screen.getByRole('dialog'), 20, 80, 100)
  expect(onRead).toHaveBeenCalled()
})

it('does not mark as read from the top of a long sheet', () => {
  const onRead = vi.fn()
  render(<FactSheet fact={fact} onClose={() => {}} onRead={onRead} />)
  mockSheetScroll(screen.getByRole('dialog'), 0, 79, 100)
  expect(onRead).not.toHaveBeenCalled()
})

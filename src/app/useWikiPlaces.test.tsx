import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PrefsProvider } from './PrefsProvider'
import { useWikiPlaces } from './useWikiPlaces'

afterEach(() => {
  vi.unstubAllGlobals()
})

it('does not restart Wikipedia while a fetch is already in flight', async () => {
  const urls: string[] = []
  vi.stubGlobal(
    'fetch',
    async (input: RequestInfo | URL) => {
      urls.push(String(input))
      return new Promise<Response>(() => {
        /* hang until unmount */
      })
    },
  )

  const { rerender } = renderHook(
    (props: { coord: { lat: number; lon: number } }) =>
      useWikiPlaces(props.coord, 1000, true),
    {
      wrapper: PrefsProvider,
      initialProps: { coord: { lat: 63.43, lon: 10.39 } },
    },
  )

  await waitFor(() => expect(urls.length).toBeGreaterThan(0))
  const started = urls.length

  rerender({ coord: { lat: 63.44, lon: 10.39 } })
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(urls.length).toBe(started)
})

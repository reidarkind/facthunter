import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import type { SavedFact } from '../types'
import { loadFacts, saveFacts } from './storage'

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

describe('storage', () => {
  it('round-trips saved facts', async () => {
    const facts = [
      fact(),
      fact({ id: 'wikipedia:no:2', title: 'Nidelva' }),
    ]
    await saveFacts(facts)
    await expect(loadFacts()).resolves.toEqual(facts)
  })
})

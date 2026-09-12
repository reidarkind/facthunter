import { describe, expect, it } from 'vitest'
import {
  filterFacts,
  isExtractRead,
  scoreFor,
  searchFacts,
  withRead,
  withUnlocked,
} from './collection'
import type { SavedFact } from '../types'

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

describe('scoreFor', () => {
  it('is 10 unlocked and +5 when read', () => {
    expect(scoreFor([fact()])).toBe(10)
    expect(scoreFor([fact({ readAt: '2026-01-02T00:00:00.000Z' })])).toBe(15)
  })
})

describe('withUnlocked / withRead', () => {
  it('does not double-unlock or double-read', () => {
    const once = withUnlocked([], fact(), '2026-01-01T00:00:00.000Z')
    const twice = withUnlocked(once, fact({ title: 'Annet' }), '2026-01-03T00:00:00.000Z')
    expect(twice).toHaveLength(1)
    expect(twice[0].title).toBe('Stiftsgården')
    const read = withRead(twice, 'wikipedia:no:1', '2026-01-04T00:00:00.000Z')
    const readAgain = withRead(read, 'wikipedia:no:1', '2026-01-05T00:00:00.000Z')
    expect(readAgain[0].readAt).toBe('2026-01-04T00:00:00.000Z')
    expect(scoreFor(readAgain)).toBe(15)
  })
})

describe('search and filter', () => {
  it('searches title and extract, case-insensitive', () => {
    const facts = [fact(), fact({ id: 'wikipedia:no:2', title: 'Nidelva', extract: 'Elv' })]
    expect(searchFacts(facts, 'stifts').map((f) => f.id)).toEqual(['wikipedia:no:1'])
  })

  it('filters unread vs read', () => {
    const facts = [fact(), fact({ id: 'wikipedia:no:2', readAt: '2026-01-02T00:00:00.000Z' })]
    expect(filterFacts(facts, 'unread')).toHaveLength(1)
    expect(filterFacts(facts, 'read')).toHaveLength(1)
  })
})

describe('isExtractRead', () => {
  it('true at 80% or at bottom', () => {
    expect(isExtractRead(0, 80, 100)).toBe(true)
    expect(isExtractRead(19, 80, 100)).toBe(true)
    expect(isExtractRead(0, 79, 100)).toBe(false)
    expect(isExtractRead(20, 80, 100)).toBe(true)
  })

  it('true when the whole extract already fits', () => {
    expect(isExtractRead(0, 200, 200)).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_WIKI_LIMIT,
  parseWikiLimit,
  parseWikiSources,
  withWikiSlot,
  WIKI_LIMITS,
} from './prefs'

describe('parseWikiLimit', () => {
  it('defaults when missing or unknown', () => {
    expect(parseWikiLimit(null)).toBe(DEFAULT_WIKI_LIMIT)
    expect(parseWikiLimit('')).toBe(DEFAULT_WIKI_LIMIT)
    expect(parseWikiLimit('12')).toBe(DEFAULT_WIKI_LIMIT)
  })

  it('accepts the allowed Wikipedia result limits', () => {
    expect(WIKI_LIMITS).toEqual([50, 100, 250, 500])
    expect(parseWikiLimit('50')).toBe(50)
    expect(parseWikiLimit('250')).toBe(250)
    expect(parseWikiLimit('500')).toBe(500)
  })
})

describe('parseWikiSources', () => {
  it('defaults to Norwegian then English', () => {
    expect(parseWikiSources(null)).toEqual({ langs: ['no', 'en'] })
    expect(parseWikiSources('')).toEqual({ langs: ['no', 'en'] })
  })

  it('accepts a single language', () => {
    expect(parseWikiSources('es')).toEqual({ langs: ['es'] })
  })

  it('parses a stored pair without adding a third', () => {
    expect(parseWikiSources('es,en')).toEqual({ langs: ['es', 'en'] })
  })

  it('parses three languages in priority order', () => {
    expect(parseWikiSources('es,en,fr')).toEqual({ langs: ['es', 'en', 'fr'] })
  })

  it('keeps valid codes when another is unknown', () => {
    expect(parseWikiSources('xx,en')).toEqual({ langs: ['en'] })
  })

  it('does not allow the same language twice', () => {
    expect(parseWikiSources('es,es')).toEqual({ langs: ['es'] })
    expect(parseWikiSources('en,en,en')).toEqual({ langs: ['en'] })
  })
})

describe('withWikiSlot', () => {
  it('clears an optional slot without padding back to two', () => {
    expect(withWikiSlot({ langs: ['es', 'en'] }, 1, null)).toEqual({
      langs: ['es'],
    })
  })

  it('compacts a later language into the hole', () => {
    expect(withWikiSlot({ langs: ['es', 'en', 'sv'] }, 1, null)).toEqual({
      langs: ['es', 'sv'],
    })
  })

  it('does not clear the first language', () => {
    expect(withWikiSlot({ langs: ['es'] }, 0, null)).toEqual({ langs: ['es'] })
  })

  it('appends into the next empty slot', () => {
    expect(withWikiSlot({ langs: ['es'] }, 1, 'sv')).toEqual({
      langs: ['es', 'sv'],
    })
  })

  it('does not skip an empty second slot', () => {
    expect(withWikiSlot({ langs: ['es'] }, 2, 'sv')).toEqual({ langs: ['es'] })
  })

  it('swaps when the language is already chosen', () => {
    expect(withWikiSlot({ langs: ['no', 'en'] }, 0, 'en')).toEqual({
      langs: ['en', 'no'],
    })
  })
})

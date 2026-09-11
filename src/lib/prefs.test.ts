import { describe, expect, it } from 'vitest'
import {
  DEFAULT_WIKI_LIMIT,
  parseWikiLimit,
  parseWikiSources,
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
    expect(parseWikiSources(null)).toEqual({ primary: 'no', secondary: 'en' })
    expect(parseWikiSources('')).toEqual({ primary: 'no', secondary: 'en' })
  })

  it('parses a stored pair', () => {
    expect(parseWikiSources('es,en')).toEqual({ primary: 'es', secondary: 'en' })
  })

  it('falls back when a code is unknown', () => {
    expect(parseWikiSources('xx,en')).toEqual({ primary: 'no', secondary: 'en' })
  })

  it('does not allow the same language twice', () => {
    expect(parseWikiSources('es,es')).toEqual({ primary: 'es', secondary: 'en' })
    expect(parseWikiSources('en,en')).toEqual({ primary: 'en', secondary: 'no' })
  })
})

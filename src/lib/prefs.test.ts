import { describe, expect, it } from 'vitest'
import { DEFAULT_WIKI_LIMIT, parseWikiLimit, WIKI_LIMITS } from './prefs'

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

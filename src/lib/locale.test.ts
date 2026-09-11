import { describe, expect, it } from 'vitest'
import { htmlLang, parseLocale } from './locale'

describe('parseLocale', () => {
  it('defaults to Norwegian', () => {
    expect(parseLocale(null)).toBe('no')
    expect(parseLocale('')).toBe('no')
    expect(parseLocale('de')).toBe('no')
  })

  it('accepts English and Norwegian', () => {
    expect(parseLocale('en')).toBe('en')
    expect(parseLocale('no')).toBe('no')
  })
})

describe('htmlLang', () => {
  it('maps no to nb and en to en', () => {
    expect(htmlLang('no')).toBe('nb')
    expect(htmlLang('en')).toBe('en')
  })
})

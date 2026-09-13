import { describe, expect, it } from 'vitest'
import {
  htmlLang,
  localeFromLanguages,
  LOCALES,
  parseLocale,
  resolveLocale,
} from './locale'

describe('parseLocale', () => {
  it('defaults to Norwegian', () => {
    expect(parseLocale(null)).toBe('no')
    expect(parseLocale('')).toBe('no')
    expect(parseLocale('fr')).toBe('no')
  })

  it('accepts Norwegian, English, German, Spanish and Portuguese', () => {
    expect(parseLocale('no')).toBe('no')
    expect(parseLocale('en')).toBe('en')
    expect(parseLocale('de')).toBe('de')
    expect(parseLocale('es')).toBe('es')
    expect(parseLocale('pt')).toBe('pt')
  })
})

describe('htmlLang', () => {
  it('maps UI locales to html lang codes', () => {
    expect(htmlLang('no')).toBe('nb')
    expect(htmlLang('en')).toBe('en')
    expect(htmlLang('de')).toBe('de')
    expect(htmlLang('es')).toBe('es')
    expect(htmlLang('pt')).toBe('pt')
  })
})

describe('LOCALES', () => {
  it('lists the five UI languages', () => {
    expect(LOCALES).toEqual(['no', 'en', 'de', 'es', 'pt'])
  })
})

describe('localeFromLanguages', () => {
  it('falls back to Norwegian when the phone language is unknown', () => {
    expect(localeFromLanguages([])).toBe('no')
    expect(localeFromLanguages(['fr-FR'])).toBe('no')
    expect(localeFromLanguages(['zh-CN', 'ja'])).toBe('no')
  })

  it('picks the first matching UI language, including regional tags', () => {
    expect(localeFromLanguages(['de-DE'])).toBe('de')
    expect(localeFromLanguages(['en-US'])).toBe('en')
    expect(localeFromLanguages(['es-MX'])).toBe('es')
    expect(localeFromLanguages(['pt-BR'])).toBe('pt')
    expect(localeFromLanguages(['nb-NO'])).toBe('no')
    expect(localeFromLanguages(['nn-NO'])).toBe('no')
    expect(localeFromLanguages(['no'])).toBe('no')
    expect(localeFromLanguages(['fr-FR', 'de-AT', 'en'])).toBe('de')
  })
})

describe('resolveLocale', () => {
  it('prefers a stored UI language over the phone', () => {
    expect(resolveLocale('en', ['de-DE'])).toBe('en')
    expect(resolveLocale('no', ['de-DE'])).toBe('no')
  })

  it('uses the phone when nothing valid is stored', () => {
    expect(resolveLocale(null, ['pt-PT'])).toBe('pt')
    expect(resolveLocale('', ['es-ES'])).toBe('es')
    expect(resolveLocale('fr', ['de'])).toBe('de')
  })
})

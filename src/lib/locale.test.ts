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
    expect(parseLocale('it')).toBe('no')
  })

  it('accepts Norwegian, English, German, Spanish, Portuguese and French', () => {
    expect(parseLocale('no')).toBe('no')
    expect(parseLocale('en')).toBe('en')
    expect(parseLocale('de')).toBe('de')
    expect(parseLocale('es')).toBe('es')
    expect(parseLocale('pt')).toBe('pt')
    expect(parseLocale('fr')).toBe('fr')
  })
})

describe('htmlLang', () => {
  it('maps UI locales to html lang codes', () => {
    expect(htmlLang('no')).toBe('nb')
    expect(htmlLang('en')).toBe('en')
    expect(htmlLang('de')).toBe('de')
    expect(htmlLang('es')).toBe('es')
    expect(htmlLang('pt')).toBe('pt')
    expect(htmlLang('fr')).toBe('fr')
  })
})

describe('LOCALES', () => {
  it('lists the six UI languages', () => {
    expect(LOCALES).toEqual(['no', 'en', 'de', 'es', 'pt', 'fr'])
  })
})

describe('localeFromLanguages', () => {
  it('falls back to Norwegian when the phone language is unknown', () => {
    expect(localeFromLanguages([])).toBe('no')
    expect(localeFromLanguages(['fr-FR'])).toBe('fr')
    expect(localeFromLanguages(['zh-CN', 'ja'])).toBe('no')
  })

  it('picks the first matching UI language, including regional tags', () => {
    expect(localeFromLanguages(['de-DE'])).toBe('de')
    expect(localeFromLanguages(['en-US'])).toBe('en')
    expect(localeFromLanguages(['es-MX'])).toBe('es')
    expect(localeFromLanguages(['pt-BR'])).toBe('pt')
    expect(localeFromLanguages(['fr-CA'])).toBe('fr')
    expect(localeFromLanguages(['nb-NO'])).toBe('no')
    expect(localeFromLanguages(['nn-NO'])).toBe('no')
    expect(localeFromLanguages(['no'])).toBe('no')
    expect(localeFromLanguages(['it-IT', 'de-AT', 'en'])).toBe('de')
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
    expect(resolveLocale('it', ['de'])).toBe('de')
    expect(resolveLocale('fr', ['de'])).toBe('fr')
  })
})

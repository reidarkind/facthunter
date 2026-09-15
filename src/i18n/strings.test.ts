import { expect, it } from 'vitest'
import { LOCALES } from '../lib/locale'
import { strings, type MessageKey } from './strings'

it('keeps language names in their own language in every UI locale', () => {
  for (const locale of LOCALES) {
    expect(strings[locale].langNo).toBe('Norsk')
    expect(strings[locale].langEn).toBe('English')
    expect(strings[locale].langDe).toBe('Deutsch')
    expect(strings[locale].langEs).toBe('Español')
    expect(strings[locale].langPt).toBe('Português')
    expect(strings[locale].langFr).toBe('Français')
  }
})

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort()
}

it('keeps the same placeholders in every locale', () => {
  const keys = Object.keys(strings.no) as MessageKey[]
  for (const key of keys) {
    const expected = placeholders(strings.no[key])
    for (const locale of LOCALES) {
      expect(placeholders(strings[locale][key]), `${locale}.${key}`).toEqual(
        expected,
      )
    }
  }
})

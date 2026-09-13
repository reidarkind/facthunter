export const LOCALES = ['no', 'en', 'de', 'es', 'pt'] as const

export type Locale = (typeof LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'facthunter-lang'

const HTML_LANG: Record<Locale, string> = {
  no: 'nb',
  en: 'en',
  de: 'de',
  es: 'es',
  pt: 'pt',
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

function localeFromTag(tag: string): Locale | null {
  const primary = tag.trim().toLowerCase().replace('_', '-').split('-')[0]
  if (!primary) return null
  if (primary === 'nb' || primary === 'nn') return 'no'
  return isLocale(primary) ? primary : null
}

export function localeFromLanguages(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const locale = localeFromTag(tag)
    if (locale) return locale
  }
  return 'no'
}

export function parseLocale(value: string | null): Locale {
  return value !== null && isLocale(value) ? value : 'no'
}

export function resolveLocale(
  stored: string | null,
  languages: readonly string[],
): Locale {
  if (stored !== null && isLocale(stored)) return stored
  return localeFromLanguages(languages)
}

export function htmlLang(locale: Locale): string {
  return HTML_LANG[locale]
}

export function deviceLanguageTags(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  const list = navigator.languages
  if (list && list.length > 0) return list
  return navigator.language ? [navigator.language] : []
}

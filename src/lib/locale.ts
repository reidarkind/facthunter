export type Locale = 'no' | 'en'

export const LOCALE_STORAGE_KEY = 'facthunter-lang'

export function parseLocale(value: string | null): Locale {
  return value === 'en' ? 'en' : 'no'
}

export function htmlLang(locale: Locale): string {
  return locale === 'en' ? 'en' : 'nb'
}

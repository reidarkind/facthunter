import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  htmlLang,
  LOCALE_STORAGE_KEY,
  parseLocale,
  type Locale,
} from '../lib/locale'
import { LocaleContext, type LocaleContextValue, translate } from './useT'

function readStoredLocale(): Locale {
  try {
    return parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
  } catch {
    return 'no'
  }
}

export function LocaleProvider(props: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale)

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      /* private mode */
    }
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  )

  return (
    <LocaleContext.Provider value={value}>{props.children}</LocaleContext.Provider>
  )
}

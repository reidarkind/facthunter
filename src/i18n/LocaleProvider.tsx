import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  deviceLanguageTags,
  htmlLang,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  type Locale,
} from '../lib/locale'
import { LocaleContext, type LocaleContextValue, translate } from './useT'

function readStoredLocale(): Locale {
  try {
    return resolveLocale(
      localStorage.getItem(LOCALE_STORAGE_KEY),
      deviceLanguageTags(),
    )
  } catch {
    return resolveLocale(null, deviceLanguageTags())
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

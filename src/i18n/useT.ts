import { createContext, useContext } from 'react'
import { type Locale } from '../lib/locale'
import { strings, type MessageKey } from './strings'

export type TFn = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFn
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(vars[name] ?? ''),
  )
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return formatMessage(strings[locale][key], vars)
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (ctx) return ctx
  return {
    locale: 'no',
    setLocale: () => {},
    t: (key, vars) => translate('no', key, vars),
  }
}

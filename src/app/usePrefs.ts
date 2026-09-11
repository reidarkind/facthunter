import { createContext, useContext } from 'react'
import {
  parseWikiLimit,
  parseWikiSources,
  type WikiLimit,
  type WikiSources,
} from '../lib/prefs'

export type PrefsContextValue = {
  wikiLimit: WikiLimit
  setWikiLimit: (limit: WikiLimit) => void
  wikiSources: WikiSources
  setWikiSources: (sources: WikiSources) => void
}

export const PrefsContext = createContext<PrefsContextValue | null>(null)

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext)
  if (ctx) return ctx
  return {
    wikiLimit: parseWikiLimit(null),
    setWikiLimit: () => {},
    wikiSources: parseWikiSources(null),
    setWikiSources: () => {},
  }
}

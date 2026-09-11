import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  parseWikiLimit,
  WIKI_LIMIT_STORAGE_KEY,
  type WikiLimit,
} from '../lib/prefs'
import { PrefsContext, type PrefsContextValue } from './usePrefs'

function readStoredWikiLimit(): WikiLimit {
  try {
    return parseWikiLimit(localStorage.getItem(WIKI_LIMIT_STORAGE_KEY))
  } catch {
    return parseWikiLimit(null)
  }
}

export function PrefsProvider(props: { children: ReactNode }) {
  const [wikiLimit, setWikiLimit] = useState<WikiLimit>(readStoredWikiLimit)

  useEffect(() => {
    try {
      localStorage.setItem(WIKI_LIMIT_STORAGE_KEY, String(wikiLimit))
    } catch {
      /* private mode */
    }
  }, [wikiLimit])

  const value = useMemo<PrefsContextValue>(
    () => ({ wikiLimit, setWikiLimit }),
    [wikiLimit],
  )

  return (
    <PrefsContext.Provider value={value}>{props.children}</PrefsContext.Provider>
  )
}

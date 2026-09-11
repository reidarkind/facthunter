import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  parseWikiLimit,
  parseWikiSources,
  serializeWikiSources,
  WIKI_LANGS_STORAGE_KEY,
  WIKI_LIMIT_STORAGE_KEY,
  type WikiLimit,
  type WikiSources,
} from '../lib/prefs'
import { PrefsContext, type PrefsContextValue } from './usePrefs'

function readStoredWikiLimit(): WikiLimit {
  try {
    return parseWikiLimit(localStorage.getItem(WIKI_LIMIT_STORAGE_KEY))
  } catch {
    return parseWikiLimit(null)
  }
}

function readStoredWikiSources(): WikiSources {
  try {
    return parseWikiSources(localStorage.getItem(WIKI_LANGS_STORAGE_KEY))
  } catch {
    return parseWikiSources(null)
  }
}

export function PrefsProvider(props: { children: ReactNode }) {
  const [wikiLimit, setWikiLimit] = useState<WikiLimit>(readStoredWikiLimit)
  const [wikiSources, setWikiSources] = useState<WikiSources>(
    readStoredWikiSources,
  )

  useEffect(() => {
    try {
      localStorage.setItem(WIKI_LIMIT_STORAGE_KEY, String(wikiLimit))
    } catch {
      /* private mode */
    }
  }, [wikiLimit])

  useEffect(() => {
    try {
      localStorage.setItem(
        WIKI_LANGS_STORAGE_KEY,
        serializeWikiSources(wikiSources),
      )
    } catch {
      /* private mode */
    }
  }, [wikiSources])

  const value = useMemo<PrefsContextValue>(
    () => ({ wikiLimit, setWikiLimit, wikiSources, setWikiSources }),
    [wikiLimit, wikiSources],
  )

  return (
    <PrefsContext.Provider value={value}>{props.children}</PrefsContext.Provider>
  )
}

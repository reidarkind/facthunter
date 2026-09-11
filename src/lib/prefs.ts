import {
  DEFAULT_WIKI_LIMIT,
  DEFAULT_WIKI_PRIMARY,
  DEFAULT_WIKI_SECONDARY,
  WIKI_LIMITS,
  WIKI_SOURCE_LANGS,
  type WikiSourceLang,
} from './constants'

export type WikiLimit = (typeof WIKI_LIMITS)[number]

export type WikiSources = {
  primary: WikiSourceLang
  secondary: WikiSourceLang
}

export const WIKI_LIMIT_STORAGE_KEY = 'facthunter-wiki-limit'
export const WIKI_LANGS_STORAGE_KEY = 'facthunter-wiki-langs'

export { DEFAULT_WIKI_LIMIT, WIKI_LIMITS, WIKI_SOURCE_LANGS }
export type { WikiSourceLang }

export function parseWikiLimit(value: string | null): WikiLimit {
  const parsed = Number(value)
  return WIKI_LIMITS.find((limit) => limit === parsed) ?? DEFAULT_WIKI_LIMIT
}

export function parseWikiLang(value: string | undefined): WikiSourceLang | null {
  return WIKI_SOURCE_LANGS.find((lang) => lang.code === value)?.code ?? null
}

function otherSource(code: WikiSourceLang): WikiSourceLang {
  return code === 'en' ? 'no' : 'en'
}

export function parseWikiSources(value: string | null): WikiSources {
  const parts = value?.split(',') ?? []
  const primary = parseWikiLang(parts[0]) ?? DEFAULT_WIKI_PRIMARY
  const secondaryRaw = parseWikiLang(parts[1]) ?? DEFAULT_WIKI_SECONDARY
  const secondary =
    secondaryRaw === primary ? otherSource(primary) : secondaryRaw
  return { primary, secondary }
}

export function serializeWikiSources(sources: WikiSources): string {
  return `${sources.primary},${sources.secondary}`
}

export function withWikiPrimary(
  current: WikiSources,
  primary: WikiSourceLang,
): WikiSources {
  if (primary === current.secondary) {
    return { primary, secondary: current.primary }
  }
  return { primary, secondary: current.secondary }
}

export function withWikiSecondary(
  current: WikiSources,
  secondary: WikiSourceLang,
): WikiSources {
  if (secondary === current.primary) {
    return { primary: current.secondary, secondary }
  }
  return { primary: current.primary, secondary }
}

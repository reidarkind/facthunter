import {
  DEFAULT_WIKI_LIMIT,
  DEFAULT_WIKI_LANGS,
  WIKI_LIMITS,
  WIKI_SOURCE_LANGS,
  type WikiSourceLang,
} from './constants'

export type WikiLimit = (typeof WIKI_LIMITS)[number]

export type WikiSources = {
  langs: WikiSourceLang[]
}

export const WIKI_LIMIT_STORAGE_KEY = 'facthunter-wiki-limit'
export const WIKI_LANGS_STORAGE_KEY = 'facthunter-wiki-langs'
export const WIKI_SOURCE_MAX = 3

export { DEFAULT_WIKI_LIMIT, WIKI_LIMITS, WIKI_SOURCE_LANGS }
export type { WikiSourceLang }

export function parseWikiLimit(value: string | null): WikiLimit {
  const parsed = Number(value)
  return WIKI_LIMITS.find((limit) => limit === parsed) ?? DEFAULT_WIKI_LIMIT
}

export function parseWikiLang(value: string | undefined): WikiSourceLang | null {
  return WIKI_SOURCE_LANGS.find((lang) => lang.code === value)?.code ?? null
}

function uniqueLangs(codes: WikiSourceLang[]): WikiSourceLang[] {
  const seen = new Set<WikiSourceLang>()
  const langs: WikiSourceLang[] = []
  for (const code of codes) {
    if (seen.has(code)) continue
    seen.add(code)
    langs.push(code)
    if (langs.length >= WIKI_SOURCE_MAX) break
  }
  return langs
}

export function parseWikiSources(value: string | null): WikiSources {
  const parts = value?.split(',') ?? []
  const parsed = uniqueLangs(
    parts
      .map((part) => parseWikiLang(part.trim()))
      .filter((code): code is WikiSourceLang => code !== null),
  )
  if (parsed.length === 0) {
    return { langs: uniqueLangs([...DEFAULT_WIKI_LANGS]) }
  }
  return { langs: parsed }
}

export function serializeWikiSources(sources: WikiSources): string {
  return sources.langs.join(',')
}

export function withWikiSlot(
  current: WikiSources,
  index: number,
  next: WikiSourceLang | null,
): WikiSources {
  const langs = [...current.langs]
  if (next === null) {
    if (index <= 0 || index >= langs.length) return current
    langs.splice(index, 1)
    return langs.length > 0
      ? { langs }
      : { langs: uniqueLangs([...DEFAULT_WIKI_LANGS]) }
  }
  const existing = langs.indexOf(next)
  if (existing === index) return current
  if (existing >= 0) {
    if (index >= langs.length) return current
    langs[existing] = langs[index]
    langs[index] = next
    return { langs }
  }
  if (index < langs.length) {
    langs[index] = next
    return { langs }
  }
  if (index !== langs.length || langs.length >= WIKI_SOURCE_MAX) {
    return current
  }
  langs.push(next)
  return { langs }
}

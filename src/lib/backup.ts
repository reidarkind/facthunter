import { APP_NAME } from './constants'
import type { SavedFact } from '../types'
import { isSameArticle } from './article'

export type ExportPayload = {
  app: 'FactHunter'
  version: 1
  exportedAt: string
  facts: SavedFact[]
}

export function buildExportPayload(
  facts: SavedFact[],
  exportedAt: string,
): ExportPayload {
  return {
    app: APP_NAME,
    version: 1,
    exportedAt,
    facts,
  }
}

function isLangTitles(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every((title) => typeof title === 'string')
}

function isValidFact(item: unknown): item is SavedFact {
  if (typeof item !== 'object' || item === null) return false
  const o = item as Record<string, unknown>
  if (typeof o.id !== 'string') return false
  if (typeof o.title !== 'string') return false
  if (typeof o.extract !== 'string') return false
  if (typeof o.pageUrl !== 'string') return false
  if (typeof o.lang !== 'string' || !/^[a-z]{2,3}(-[a-z]+)?$/.test(o.lang)) {
    return false
  }
  if (typeof o.lat !== 'number') return false
  if (typeof o.lon !== 'number') return false
  if (typeof o.unlockedAt !== 'string') return false
  if (o.source !== 'wikipedia') return false
  if (o.thumbnailUrl !== undefined && typeof o.thumbnailUrl !== 'string') {
    return false
  }
  if (o.readAt !== undefined && typeof o.readAt !== 'string') return false
  if (o.wikidataId !== undefined) {
    if (typeof o.wikidataId !== 'string' || !/^Q\d+$/i.test(o.wikidataId)) {
      return false
    }
  }
  if (o.langTitles !== undefined && !isLangTitles(o.langTitles)) return false
  return true
}

export function parseImportPayload(
  raw: unknown,
): { ok: true; facts: SavedFact[] } | { ok: false } {
  if (typeof raw !== 'object' || raw === null) return { ok: false }
  const o = raw as Record<string, unknown>
  if (o.app !== APP_NAME) return { ok: false }
  if (o.version !== 1) return { ok: false }
  if (!Array.isArray(o.facts)) return { ok: false }
  const facts: SavedFact[] = []
  for (const item of o.facts) {
    if (!isValidFact(item)) return { ok: false }
    facts.push(item)
  }
  return { ok: true, facts }
}

function isEmpty(value: string | undefined): boolean {
  return value === undefined || value === ''
}

function mergeLangTitles(
  preferred?: Record<string, string>,
  other?: Record<string, string>,
): Record<string, string> | undefined {
  if (!preferred && !other) return undefined
  return { ...other, ...preferred }
}

function langRank(lang: string, priority: readonly string[]): number {
  const index = priority.indexOf(lang)
  return index === -1 ? Number.POSITIVE_INFINITY : index
}

function mergeOne(preferred: SavedFact, other: SavedFact): SavedFact {
  const unlockedAt =
    preferred.unlockedAt <= other.unlockedAt
      ? preferred.unlockedAt
      : other.unlockedAt

  let readAt: string | undefined
  if (preferred.readAt && other.readAt) {
    readAt =
      preferred.readAt <= other.readAt ? preferred.readAt : other.readAt
  } else {
    readAt = preferred.readAt ?? other.readAt
  }

  const wikidataId = preferred.wikidataId ?? other.wikidataId
  const langTitles = mergeLangTitles(preferred.langTitles, other.langTitles)

  return {
    ...preferred,
    title:
      isEmpty(preferred.title) && !isEmpty(other.title)
        ? other.title
        : preferred.title,
    extract:
      isEmpty(preferred.extract) && !isEmpty(other.extract)
        ? other.extract
        : preferred.extract,
    thumbnailUrl:
      isEmpty(preferred.thumbnailUrl) && !isEmpty(other.thumbnailUrl)
        ? other.thumbnailUrl
        : preferred.thumbnailUrl,
    pageUrl:
      isEmpty(preferred.pageUrl) && !isEmpty(other.pageUrl)
        ? other.pageUrl
        : preferred.pageUrl,
    unlockedAt,
    readAt,
    ...(wikidataId ? { wikidataId } : {}),
    ...(langTitles ? { langTitles } : {}),
  }
}

function preferredArticle(
  local: SavedFact,
  incoming: SavedFact,
  langPriority: readonly string[],
): SavedFact {
  const incomingWins =
    langRank(incoming.lang, langPriority) < langRank(local.lang, langPriority)
  return incomingWins ? mergeOne(incoming, local) : mergeOne(local, incoming)
}

export function mergeFacts(
  local: SavedFact[],
  incoming: SavedFact[],
  langPriority: readonly string[] = [],
): { facts: SavedFact[]; newCount: number } {
  const facts = [...local]
  let newCount = 0

  for (const inc of incoming) {
    const index = facts.findIndex((existing) => isSameArticle(existing, inc))
    if (index === -1) {
      facts.push(inc)
      newCount++
      continue
    }
    facts[index] = preferredArticle(facts[index], inc, langPriority)
  }

  return { facts, newCount }
}

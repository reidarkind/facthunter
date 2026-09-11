import { APP_NAME } from './constants'
import type { SavedFact } from '../types'

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

function mergeOne(local: SavedFact, incoming: SavedFact): SavedFact {
  const unlockedAt =
    local.unlockedAt <= incoming.unlockedAt
      ? local.unlockedAt
      : incoming.unlockedAt

  let readAt: string | undefined
  if (local.readAt && incoming.readAt) {
    readAt = local.readAt <= incoming.readAt ? local.readAt : incoming.readAt
  } else {
    readAt = local.readAt ?? incoming.readAt
  }

  return {
    ...local,
    title:
      isEmpty(local.title) && !isEmpty(incoming.title)
        ? incoming.title
        : local.title,
    extract:
      isEmpty(local.extract) && !isEmpty(incoming.extract)
        ? incoming.extract
        : local.extract,
    thumbnailUrl:
      isEmpty(local.thumbnailUrl) && !isEmpty(incoming.thumbnailUrl)
        ? incoming.thumbnailUrl
        : local.thumbnailUrl,
    unlockedAt,
    readAt,
  }
}

export function mergeFacts(
  local: SavedFact[],
  incoming: SavedFact[],
): { facts: SavedFact[]; newCount: number } {
  const byId = new Map(local.map((f) => [f.id, f]))
  const localIds = new Set(local.map((f) => f.id))
  const newIds: string[] = []
  let newCount = 0

  for (const inc of incoming) {
    const existing = byId.get(inc.id)
    if (existing) {
      byId.set(inc.id, mergeOne(existing, inc))
    } else {
      byId.set(inc.id, inc)
      if (!localIds.has(inc.id)) {
        newIds.push(inc.id)
        newCount++
      }
    }
  }

  const facts = local.map((f) => byId.get(f.id)!)
  for (const id of newIds) {
    facts.push(byId.get(id)!)
  }

  return { facts, newCount }
}

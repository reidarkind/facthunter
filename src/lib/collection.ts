import { POINTS_READ, POINTS_UNLOCK } from './constants'
import type { SavedFact } from '../types'
import { isSameArticle } from './article'

export function factId(lang: string, pageId: string): string {
  return `wikipedia:${lang}:${pageId}`
}

export function scoreFor(facts: SavedFact[]): number {
  return facts.reduce(
    (total, f) => total + POINTS_UNLOCK + (f.readAt ? POINTS_READ : 0),
    0,
  )
}

export function searchFacts(facts: SavedFact[], query: string): SavedFact[] {
  const q = query.trim()
  if (q === '') return facts
  const needle = q.toLocaleLowerCase('nb')
  return facts.filter((f) => {
    const title = f.title.toLocaleLowerCase('nb')
    const extract = f.extract.toLocaleLowerCase('nb')
    return title.includes(needle) || extract.includes(needle)
  })
}

export function filterFacts(
  facts: SavedFact[],
  filter: 'all' | 'unread' | 'read',
): SavedFact[] {
  if (filter === 'all') return facts
  if (filter === 'unread') return facts.filter((f) => !f.readAt)
  return facts.filter((f) => !!f.readAt)
}

export function isExtractRead(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
): boolean {
  if (scrollHeight <= 0) return false
  if (scrollTop + clientHeight >= scrollHeight - 1) return true
  return (scrollTop + clientHeight) / scrollHeight >= 0.8
}

export function withUnlocked(
  facts: SavedFact[],
  fact: SavedFact,
  nowIso: string,
): SavedFact[] {
  if (facts.some((f) => isSameArticle(f, fact))) return facts
  return [...facts, { ...fact, unlockedAt: nowIso }]
}

export function withRead(
  facts: SavedFact[],
  id: string,
  nowIso: string,
): SavedFact[] {
  const index = facts.findIndex((f) => f.id === id)
  if (index === -1) return facts
  const existing = facts[index]
  if (existing.readAt) return facts
  const updated = { ...existing, readAt: nowIso }
  return [...facts.slice(0, index), updated, ...facts.slice(index + 1)]
}

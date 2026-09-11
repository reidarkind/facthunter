import { DEFAULT_WIKI_LIMIT, WIKI_LIMITS } from './constants'

export type WikiLimit = (typeof WIKI_LIMITS)[number]

export const WIKI_LIMIT_STORAGE_KEY = 'facthunter-wiki-limit'

export { DEFAULT_WIKI_LIMIT, WIKI_LIMITS }

export function parseWikiLimit(value: string | null): WikiLimit {
  const parsed = Number(value)
  return WIKI_LIMITS.find((limit) => limit === parsed) ?? DEFAULT_WIKI_LIMIT
}

import {
  APP_NAME,
  DEFAULT_WIKI_LIMIT,
  FETCH_RADIUS_M,
  REFETCH_MOVE_M,
  UNLOCK_RADIUS_M,
  WIKI_MAX_LIMIT,
} from './constants'
import { factId } from './collection'
import { movedAtLeast, type Coord } from './geo'
import { parseWikiSources, type WikiSources } from './prefs'
import type { NearbyPlace } from '../types'

const DEFAULT_WIKI_SOURCES = parseWikiSources(null)

export const WIKI_API_USER_AGENT = `${APP_NAME}/0.0.0 (https://reidarkind.github.io/facthunter/; https://github.com/reidarkind/facthunter)`

function wikiRequestInit(): RequestInit {
  return {
    headers: {
      'Api-User-Agent': WIKI_API_USER_AGENT,
    },
  }
}

export function mergeWikiPlaces(...groups: NearbyPlace[][]): NearbyPlace[] {
  const kept: NearbyPlace[] = []
  const claimedQ = new Set<string>()

  for (const group of groups) {
    for (const place of group) {
      if (isSameArticle(place, kept, claimedQ)) continue
      kept.push(place)
      if (place.wikidataId) claimedQ.add(place.wikidataId)
    }
  }
  return kept
}

function titlesMatch(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
}

function isSameArticle(
  candidate: NearbyPlace,
  kept: NearbyPlace[],
  claimedQ: Set<string>,
): boolean {
  if (candidate.wikidataId && claimedQ.has(candidate.wikidataId)) return true
  return kept.some((place) => {
    if (
      candidate.wikidataId &&
      place.wikidataId &&
      candidate.wikidataId === place.wikidataId
    ) {
      return true
    }
    const candidateAsKept = candidate.langTitles?.[place.lang]
    if (candidateAsKept && titlesMatch(candidateAsKept, place.title)) return true
    const keptAsCandidate = place.langTitles?.[candidate.lang]
    if (keptAsCandidate && titlesMatch(keptAsCandidate, candidate.title)) {
      return true
    }
    return false
  })
}

export function mergePlacesById(places: NearbyPlace[]): NearbyPlace[] {
  const byId = new Map<string, NearbyPlace>()
  for (const place of places) {
    if (!byId.has(place.id)) byId.set(place.id, place)
  }
  return [...byId.values()]
}

export function shouldRefetch(prev: Coord | null, next: Coord): boolean {
  return movedAtLeast(prev, next, REFETCH_MOVE_M)
}

export function shouldStartWikiFetch(
  lastFetchAt: Coord | null,
  fetching: boolean,
  coord: Coord,
): boolean {
  if (fetching) return false
  return shouldRefetch(lastFetchAt, coord)
}

function wikiUrl(
  lang: string,
  coord: Coord,
  radiusM: number,
  limit: number,
): string {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${coord.lat}|${coord.lon}`,
    ggsradius: String(radiusM),
    ggslimit: String(limit),
    prop: 'extracts|coordinates|pageimages|info|pageprops|langlinks',
    exintro: '1',
    explaintext: '1',
    exchars: '400',
    colimit: String(limit),
    piprop: 'thumbnail',
    pithumbsize: '400',
    ppprop: 'wikibase_item',
    lllimit: 'max',
    inprop: 'url',
    format: 'json',
    origin: '*',
  })
  return `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function parseLangTitles(value: unknown): Record<string, string> | undefined {
  if (!Array.isArray(value)) return undefined
  const titles: Record<string, string> = {}
  for (const item of value) {
    const record = asRecord(item)
    if (!record || typeof record.lang !== 'string') continue
    const title =
      typeof record['*'] === 'string'
        ? record['*']
        : typeof record.title === 'string'
          ? record.title
          : null
    if (!title) continue
    titles[record.lang] = title
  }
  return Object.keys(titles).length > 0 ? titles : undefined
}

function parsePlaces(data: unknown, lang: string): NearbyPlace[] {
  const root = asRecord(data)
  const query = asRecord(root?.query)
  const pages = asRecord(query?.pages)
  if (!pages) return []

  const places: NearbyPlace[] = []
  for (const page of Object.values(pages)) {
    const record = asRecord(page)
    if (!record) continue
    const pageId = record.pageid
    const title = record.title
    const coords = record.coordinates
    if (typeof pageId !== 'number' || typeof title !== 'string') continue
    if (!Array.isArray(coords) || coords.length === 0) continue
    const coord = asRecord(coords[0])
    if (!coord || typeof coord.lat !== 'number' || typeof coord.lon !== 'number') {
      continue
    }
    const thumbnail = asRecord(record.thumbnail)
    const thumbnailUrl =
      typeof thumbnail?.source === 'string' ? thumbnail.source : undefined
    const extract = typeof record.extract === 'string' ? record.extract : ''
    const pageUrl =
      typeof record.canonicalurl === 'string' ? record.canonicalurl : ''
    const pageprops = asRecord(record.pageprops)
    const wikidataId =
      typeof pageprops?.wikibase_item === 'string'
        ? pageprops.wikibase_item
        : undefined
    const langTitles = parseLangTitles(record.langlinks)

    places.push({
      id: factId(lang, String(pageId)),
      title,
      extract,
      pageUrl,
      lang,
      lat: coord.lat,
      lon: coord.lon,
      pageId,
      source: 'wikipedia',
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
      ...(wikidataId ? { wikidataId } : {}),
      ...(langTitles ? { langTitles } : {}),
    })
  }
  return places
}

async function fetchLang(
  lang: string,
  coord: Coord,
  fetchFn: typeof fetch,
  radiusM: number,
  limit: number,
): Promise<NearbyPlace[]> {
  const response = await fetchFn(
    wikiUrl(lang, coord, radiusM, limit),
    wikiRequestInit(),
  )
  if (!response.ok) {
    throw new Error(`Wikipedia ${lang} ${response.status}`)
  }
  return parsePlaces(await response.json(), lang)
}

async function fetchLangBundle(
  lang: string,
  coord: Coord,
  fetchFn: typeof fetch,
  radiusM: number,
  limit: number,
): Promise<NearbyPlace[]> {
  const jobs = [{ radiusM, limit }]
  if (radiusM > UNLOCK_RADIUS_M) {
    jobs.push({ radiusM: UNLOCK_RADIUS_M, limit: WIKI_MAX_LIMIT })
  }

  const chunks: NearbyPlace[] = []
  let lastError: unknown
  for (const job of jobs) {
    try {
      chunks.push(
        ...(await fetchLang(lang, coord, fetchFn, job.radiusM, job.limit)),
      )
    } catch (error) {
      lastError = error
    }
  }

  if (chunks.length === 0 && lastError) {
    throw lastError instanceof Error
      ? lastError
      : new Error(`Wikipedia ${lang} unavailable`)
  }
  return mergePlacesById(chunks)
}

export async function fetchNearbyPlaces(
  coord: Coord,
  fetchFn: typeof fetch = fetch,
  radiusM: number = FETCH_RADIUS_M,
  limit: number = DEFAULT_WIKI_LIMIT,
  langs: WikiSources = DEFAULT_WIKI_SOURCES,
): Promise<NearbyPlace[]> {
  const sources =
    langs.langs.length > 0 ? langs.langs : DEFAULT_WIKI_SOURCES.langs
  const groups: NearbyPlace[][] = []
  let lastError: unknown

  for (const lang of sources) {
    try {
      groups.push(await fetchLangBundle(lang, coord, fetchFn, radiusM, limit))
    } catch (error) {
      lastError = error
      groups.push([])
    }
  }

  const merged = mergeWikiPlaces(...groups)
  if (merged.length === 0 && lastError) {
    throw lastError instanceof Error
      ? lastError
      : new Error('Wikipedia unavailable')
  }
  return merged
}

import {
  DEFAULT_WIKI_LIMIT,
  FETCH_RADIUS_M,
  MERGE_RADIUS_M,
  REFETCH_MOVE_M,
  UNLOCK_RADIUS_M,
  WIKI_MAX_LIMIT,
} from './constants'
import { factId } from './collection'
import { distanceMeters, movedAtLeast, type Coord } from './geo'
import type { NearbyPlace } from '../types'

export function mergeWikiPlaces(
  norwegian: NearbyPlace[],
  english: NearbyPlace[],
): NearbyPlace[] {
  const uniqueEnglish = english.filter((englishPlace) =>
    norwegian.every(
      (norwegianPlace) =>
        distanceMeters(norwegianPlace, englishPlace) >= MERGE_RADIUS_M,
    ),
  )

  return [...norwegian, ...uniqueEnglish]
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

function wikiUrl(
  lang: 'no' | 'en',
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
    prop: 'extracts|coordinates|pageimages|info',
    exintro: '1',
    explaintext: '1',
    exchars: '400',
    colimit: String(limit),
    piprop: 'thumbnail',
    pithumbsize: '400',
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

function parsePlaces(data: unknown, lang: 'no' | 'en'): NearbyPlace[] {
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

    places.push({
      id: factId(lang, String(pageId)),
      title,
      extract,
      thumbnailUrl,
      pageUrl,
      lang,
      lat: coord.lat,
      lon: coord.lon,
      pageId,
      source: 'wikipedia',
    })
  }
  return places
}

async function fetchLang(
  lang: 'no' | 'en',
  coord: Coord,
  fetchFn: typeof fetch,
  radiusM: number,
  limit: number,
): Promise<NearbyPlace[]> {
  const response = await fetchFn(wikiUrl(lang, coord, radiusM, limit))
  if (!response.ok) {
    throw new Error(`Wikipedia ${lang} ${response.status}`)
  }
  return parsePlaces(await response.json(), lang)
}

async function fetchLangBundle(
  lang: 'no' | 'en',
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
): Promise<NearbyPlace[]> {
  let norwegian: NearbyPlace[] | undefined
  let english: NearbyPlace[] | undefined
  let norwegianError: unknown
  let englishError: unknown

  try {
    norwegian = await fetchLangBundle('no', coord, fetchFn, radiusM, limit)
  } catch (error) {
    norwegianError = error
  }

  try {
    english = await fetchLangBundle('en', coord, fetchFn, radiusM, limit)
  } catch (error) {
    englishError = error
  }

  if (norwegianError && englishError) {
    throw norwegianError instanceof Error
      ? norwegianError
      : new Error('Wikipedia unavailable')
  }

  return mergeWikiPlaces(norwegian ?? [], english ?? [])
}

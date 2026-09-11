import { FETCH_RADIUS_M, MERGE_RADIUS_M, REFETCH_MOVE_M } from './constants'
import { factId } from './collection'
import { distanceMeters, type Coord } from './geo'
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

export function shouldRefetch(prev: Coord | null, next: Coord): boolean {
  return prev === null || distanceMeters(prev, next) >= REFETCH_MOVE_M - 0.01
}

function wikiUrl(lang: 'no' | 'en', coord: Coord): string {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${coord.lat}|${coord.lon}`,
    ggsradius: String(FETCH_RADIUS_M),
    ggslimit: '50',
    prop: 'extracts|coordinates|pageimages|info',
    exintro: '1',
    explaintext: '1',
    exchars: '400',
    colimit: '1',
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
): Promise<NearbyPlace[]> {
  const response = await fetchFn(wikiUrl(lang, coord))
  if (!response.ok) {
    throw new Error(`Wikipedia ${lang} ${response.status}`)
  }
  return parsePlaces(await response.json(), lang)
}

export async function fetchNearbyPlaces(
  coord: Coord,
  fetchFn: typeof fetch = fetch,
): Promise<NearbyPlace[]> {
  let norwegian: NearbyPlace[] | undefined
  let english: NearbyPlace[] | undefined
  let norwegianError: unknown
  let englishError: unknown

  try {
    norwegian = await fetchLang('no', coord, fetchFn)
  } catch (error) {
    norwegianError = error
  }

  try {
    english = await fetchLang('en', coord, fetchFn)
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

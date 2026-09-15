export type SavedFact = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: string
  lat: number
  lon: number
  unlockedAt: string
  readAt?: string
  source: 'wikipedia'
  wikidataId?: string
  langTitles?: Record<string, string>
}

export type NearbyPlace = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: string
  lat: number
  lon: number
  pageId: number
  source: 'wikipedia'
  wikidataId?: string
  langTitles?: Record<string, string>
}

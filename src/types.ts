export type SavedFact = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: 'no' | 'en'
  lat: number
  lon: number
  unlockedAt: string
  readAt?: string
  source: 'wikipedia'
}

export type NearbyPlace = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: 'no' | 'en'
  lat: number
  lon: number
  pageId: number
  source: 'wikipedia'
}

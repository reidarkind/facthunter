import { describe, expect, it } from 'vitest'
import type { NearbyPlace } from '../types'
import {
  fetchNearbyPlaces,
  mergeWikiPlaces,
  shouldRefetch,
} from './wikipedia'

function place(
  lang: 'no' | 'en',
  pageId: number,
  lat: number,
  lon: number,
): NearbyPlace {
  return {
    id: `wikipedia:${lang}:${pageId}`,
    title: `${lang}-${pageId}`,
    extract: 'Extract',
    pageUrl: `https://${lang}.wikipedia.org/wiki/${pageId}`,
    lang,
    lat,
    lon,
    pageId,
    source: 'wikipedia',
  }
}

describe('mergeWikiPlaces', () => {
  it('drops an English place within 40 m of a Norwegian place', () => {
    const norwegian = place('no', 1, 63.43, 10.39)
    const english = place('en', 2, 63.43009, 10.39)

    expect(mergeWikiPlaces([norwegian], [english])).toEqual([norwegian])
  })

  it('keeps an English place farther than 40 m from Norwegian places', () => {
    const norwegian = place('no', 1, 63.43, 10.39)
    const english = place('en', 2, 63.4309, 10.39)

    expect(mergeWikiPlaces([norwegian], [english])).toEqual([
      norwegian,
      english,
    ])
  })

  it('keeps nearby Norwegian places distinct', () => {
    const first = place('no', 1, 63.43, 10.39)
    const second = place('no', 2, 63.43009, 10.39)

    expect(mergeWikiPlaces([first, second], [])).toEqual([first, second])
  })
})

describe('shouldRefetch', () => {
  it('returns true without a previous coordinate', () => {
    expect(shouldRefetch(null, { lat: 63.43, lon: 10.39 })).toBe(true)
  })

  it('returns true after moving at least 150 m', () => {
    const previous = { lat: 0, lon: 0 }
    const exactly150mNorth = { lat: 150 / 6371000 / (Math.PI / 180), lon: 0 }

    expect(shouldRefetch(previous, exactly150mNorth)).toBe(true)
  })

  it('returns false after moving much less than 150 m', () => {
    expect(
      shouldRefetch(
        { lat: 63.43, lon: 10.39 },
        { lat: 63.43009, lon: 10.39 },
      ),
    ).toBe(false)
  })
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

const norwegianResponse = {
  query: {
    pages: {
      '1': {
        pageid: 1,
        title: 'Torvet (Trondheim)',
        extract: 'Torget i Trondheim.',
        canonicalurl: 'https://no.wikipedia.org/wiki/Torvet_(Trondheim)',
        coordinates: [{ lat: 63.4305, lon: 10.395, primary: true }],
        thumbnail: { source: 'https://example.com/t.jpg' },
      },
      '2': {
        pageid: 2,
        title: 'Missing coordinates',
        extract: 'Must be skipped.',
        canonicalurl: 'https://no.wikipedia.org/wiki/Missing',
      },
    },
  },
}

describe('fetchNearbyPlaces', () => {
  it('requests Norwegian then English and maps geosearch pages', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse(urls.length === 1 ? norwegianResponse : {})
    }

    const places = await fetchNearbyPlaces(
      { lat: 63.4305, lon: 10.395 },
      fetchFn,
    )

    expect(urls).toHaveLength(4)
    expect(urls[0]).toContain('no.wikipedia.org')
    expect(urls[2]).toContain('en.wikipedia.org')
    const query = new URL(urls[0]).searchParams
    expect(query.get('ggscoord')).toBe('63.4305|10.395')
    expect(query.get('ggsradius')).toBe('1000')
    expect(query.get('ggslimit')).toBe('50')
    expect(query.get('colimit')).toBe('50')
    expect(query.get('origin')).toBe('*')
    expect(places).toEqual([
      {
        id: 'wikipedia:no:1',
        title: 'Torvet (Trondheim)',
        extract: 'Torget i Trondheim.',
        thumbnailUrl: 'https://example.com/t.jpg',
        pageUrl: 'https://no.wikipedia.org/wiki/Torvet_(Trondheim)',
        lang: 'no',
        lat: 63.4305,
        lon: 10.395,
        pageId: 1,
        source: 'wikipedia',
      },
    ])
  })

  it('uses the given search radius', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse({})
    }
    await fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn, 2000)
    expect(new URL(urls[0]).searchParams.get('ggsradius')).toBe('2000')
  })

  it('also fetches every place within 50 m at the API max', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse({})
    }
    await fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn, 2000, 50)
    const queries = urls.map((url) => new URL(url).searchParams)
    const core = queries.filter((query) => query.get('ggsradius') === '50')
    const outer = queries.filter((query) => query.get('ggsradius') === '2000')
    expect(core).toHaveLength(2)
    expect(outer).toHaveLength(2)
    expect(core.every((query) => query.get('ggslimit') === '500')).toBe(true)
    expect(core.every((query) => query.get('colimit') === '500')).toBe(true)
    expect(outer.every((query) => query.get('ggslimit') === '50')).toBe(true)
  })

  it('asks Wikipedia for coordinates on every geosearch hit', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse({})
    }
    await fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn, 2000, 250)
    const query = new URL(urls[0]).searchParams
    expect(query.get('ggslimit')).toBe('250')
    expect(query.get('colimit')).toBe('250')
  })

  it('keeps English results when Norwegian throws', async () => {
    const hosts: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      const host = new URL(String(input)).host
      hosts.push(host)
      if (host.startsWith('no.')) throw new Error('Norwegian unavailable')
      return jsonResponse({
        query: {
          pages: {
            '3': {
              pageid: 3,
              title: 'English place',
              extract: 'English extract.',
              canonicalurl: 'https://en.wikipedia.org/wiki/English_place',
              coordinates: [{ lat: 63.44, lon: 10.4 }],
            },
          },
        },
      })
    }

    const places = await fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn)

    expect(new Set(hosts)).toEqual(
      new Set(['no.wikipedia.org', 'en.wikipedia.org']),
    )
    expect(places.map(({ id }) => id)).toEqual(['wikipedia:en:3'])
  })

  it('keeps Norwegian results when English is non-OK', async () => {
    let call = 0
    const fetchFn = async (): Promise<Response> => {
      call += 1
      return call === 1
        ? jsonResponse(norwegianResponse)
        : jsonResponse({}, false)
    }

    const places = await fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn)

    expect(places.map(({ id }) => id)).toEqual(['wikipedia:no:1'])
  })

  it('throws when both language requests fail', async () => {
    const fetchFn = async (): Promise<Response> => {
      throw new Error('Wikipedia unavailable')
    }

    await expect(
      fetchNearbyPlaces({ lat: 63.43, lon: 10.39 }, fetchFn),
    ).rejects.toThrow()
  })
})

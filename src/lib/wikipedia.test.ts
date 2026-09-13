import { describe, expect, it } from 'vitest'
import type { NearbyPlace } from '../types'
import {
  fetchNearbyPlaces,
  mergeWikiPlaces,
  shouldRefetch,
  shouldStartWikiFetch,
} from './wikipedia'

function place(
  lang: string,
  pageId: number,
  lat: number,
  lon: number,
  extra: Partial<NearbyPlace> = {},
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
    ...extra,
  }
}

describe('mergeWikiPlaces', () => {
  it('drops a later-language place with the same Wikidata id', () => {
    const norwegian = place('no', 1, 63.43, 10.39, { wikidataId: 'Q215023' })
    const english = place('en', 2, 63.44, 10.41, { wikidataId: 'Q215023' })

    expect(mergeWikiPlaces([norwegian], [english])).toEqual([norwegian])
  })

  it('keeps a nearby later-language place that is a different article', () => {
    const norwegian = place('no', 1, 63.43, 10.39, { wikidataId: 'Q1' })
    const english = place('en', 2, 63.43009, 10.39, { wikidataId: 'Q2' })

    expect(mergeWikiPlaces([norwegian], [english])).toEqual([
      norwegian,
      english,
    ])
  })

  it('drops a later-language place whose title matches a langlink', () => {
    const norwegian = place('no', 1, 63.43, 10.39, {
      title: 'Nidarosdomen',
      langTitles: { en: 'Nidaros Cathedral' },
    })
    const english = place('en', 2, 63.44, 10.41, {
      title: 'Nidaros Cathedral',
    })

    expect(mergeWikiPlaces([norwegian], [english])).toEqual([norwegian])
  })

  it('keeps nearby places on the same language distinct', () => {
    const first = place('no', 1, 63.43, 10.39)
    const second = place('no', 2, 63.43009, 10.39)

    expect(mergeWikiPlaces([first, second], [])).toEqual([first, second])
  })

  it('prefers the earliest language when three editions overlap', () => {
    const norwegian = place('no', 1, 63.43, 10.39, { wikidataId: 'Q9' })
    const english = place('en', 2, 63.43, 10.39, { wikidataId: 'Q9' })
    const spanish = place('es', 3, 63.43, 10.39, { wikidataId: 'Q9' })

    expect(mergeWikiPlaces([norwegian], [english], [spanish])).toEqual([
      norwegian,
    ])
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

describe('shouldStartWikiFetch', () => {
  const here = { lat: 63.43, lon: 10.39 }
  const far = { lat: 63.44, lon: 10.39 }

  it('starts when there is no previous fetch', () => {
    expect(shouldStartWikiFetch(null, false, here)).toBe(true)
  })

  it('does not start a second fetch while one is in flight', () => {
    expect(shouldStartWikiFetch(null, true, here)).toBe(false)
    expect(shouldStartWikiFetch(here, true, far)).toBe(false)
  })

  it('starts again after a finished fetch only if we moved 150 m', () => {
    expect(shouldStartWikiFetch(here, false, { lat: 63.43009, lon: 10.39 })).toBe(
      false,
    )
    expect(shouldStartWikiFetch(here, false, far)).toBe(true)
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
    expect(query.get('ppprop')).toBe('wikibase_item')
    expect(query.get('prop')).toContain('pageprops')
    expect(query.get('prop')).toContain('langlinks')
    expect(query.get('lllimit')).toBe('max')
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

  it('fetches the chosen Wikipedia languages in order', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse({})
    }
    await fetchNearbyPlaces(
      { lat: 40.4, lon: -3.7 },
      fetchFn,
      2000,
      50,
      { langs: ['es', 'en', 'fr'] },
    )
    expect(urls[0]).toContain('es.wikipedia.org')
    expect(urls[2]).toContain('en.wikipedia.org')
    expect(urls[4]).toContain('fr.wikipedia.org')
    expect(urls.some((url) => url.includes('no.wikipedia.org'))).toBe(false)
  })

  it('fetches only one Wikipedia language when that is all that is chosen', async () => {
    const urls: string[] = []
    const fetchFn = async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(String(input))
      return jsonResponse({})
    }
    await fetchNearbyPlaces(
      { lat: 40.4, lon: -3.7 },
      fetchFn,
      2000,
      50,
      { langs: ['es'] },
    )
    expect(urls[0]).toContain('es.wikipedia.org')
    expect(urls.every((url) => url.includes('es.wikipedia.org'))).toBe(true)
    expect(urls).toHaveLength(2)
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

  it('maps Wikidata id and langlinks from the page', async () => {
    const fetchFn = async (): Promise<Response> =>
      jsonResponse({
        query: {
          pages: {
            '1': {
              pageid: 1,
              title: 'Nidarosdomen',
              extract: 'Domkirke.',
              canonicalurl: 'https://no.wikipedia.org/wiki/Nidarosdomen',
              coordinates: [{ lat: 63.43, lon: 10.39 }],
              pageprops: { wikibase_item: 'Q215023' },
              langlinks: [{ lang: 'en', '*': 'Nidaros Cathedral' }],
            },
          },
        },
      })

    const places = await fetchNearbyPlaces(
      { lat: 63.43, lon: 10.39 },
      fetchFn,
      2000,
      50,
      { langs: ['no'] },
    )

    expect(places).toEqual([
      {
        id: 'wikipedia:no:1',
        title: 'Nidarosdomen',
        extract: 'Domkirke.',
        pageUrl: 'https://no.wikipedia.org/wiki/Nidarosdomen',
        lang: 'no',
        lat: 63.43,
        lon: 10.39,
        pageId: 1,
        source: 'wikipedia',
        wikidataId: 'Q215023',
        langTitles: { en: 'Nidaros Cathedral' },
      },
    ])
  })

  it('sends Api-User-Agent so Wikimedia can identify the client', async () => {
    const agents: string[] = []
    const fetchFn = async (
      _input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const header = new Headers(init?.headers)
      agents.push(header.get('Api-User-Agent') ?? '')
      return jsonResponse({})
    }

    await fetchNearbyPlaces(
      { lat: 63.43, lon: 10.39 },
      fetchFn,
      2000,
      50,
      { langs: ['no'] },
    )

    expect(agents.length).toBeGreaterThan(0)
    expect(agents.every((agent) => agent.includes('FactHunter'))).toBe(true)
    expect(
      agents.every((agent) =>
        agent.includes('https://reidarkind.github.io/facthunter/'),
      ),
    ).toBe(true)
    expect(
      agents.every((agent) =>
        agent.includes('https://github.com/reidarkind/facthunter'),
      ),
    ).toBe(true)
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

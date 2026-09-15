import { describe, expect, it } from 'vitest'
import {
  buildExportPayload,
  mergeFacts,
  parseImportPayload,
} from './backup'
import { APP_NAME } from './constants'
import type { SavedFact } from '../types'

function fact(over: Partial<SavedFact> = {}): SavedFact {
  return {
    id: 'wikipedia:no:1',
    title: 'Stiftsgården',
    extract: 'En bygning i Trondheim',
    pageUrl: 'https://no.wikipedia.org/wiki/Stiftsg%C3%A5rden',
    lang: 'no',
    lat: 63.43,
    lon: 10.39,
    unlockedAt: '2026-01-01T00:00:00.000Z',
    source: 'wikipedia',
    ...over,
  }
}

describe('buildExportPayload', () => {
  it('sets app and version 1', () => {
    const exportedAt = '2026-09-11T12:00:00.000Z'
    const facts = [fact()]
    const payload = buildExportPayload(facts, exportedAt)
    expect(payload.app).toBe(APP_NAME)
    expect(payload.version).toBe(1)
    expect(payload.exportedAt).toBe(exportedAt)
    expect(payload.facts).toBe(facts)
  })
})

describe('parseImportPayload', () => {
  it('accepts a valid export payload', () => {
    const raw = buildExportPayload([fact()], '2026-09-11T12:00:00.000Z')
    const result = parseImportPayload(raw)
    expect(result).toEqual({ ok: true, facts: raw.facts })
  })

  it('rejects empty object', () => {
    expect(parseImportPayload({})).toEqual({ ok: false })
  })

  it('rejects wrong version', () => {
    expect(
      parseImportPayload({ app: APP_NAME, version: 2, facts: [] }),
    ).toEqual({ ok: false })
  })

  it('rejects entire file when any fact fails field guard', () => {
    const valid = fact()
    const invalid = { ...fact(), lang: '' }
    expect(
      parseImportPayload({
        app: APP_NAME,
        version: 1,
        facts: [valid, invalid],
      }),
    ).toEqual({ ok: false })
  })

  it('accepts a Wikipedia language other than Norwegian and English', () => {
    const raw = buildExportPayload(
      [fact({ id: 'wikipedia:es:9', lang: 'es' })],
      '2026-09-11T12:00:00.000Z',
    )
    expect(parseImportPayload(raw)).toEqual({ ok: true, facts: raw.facts })
  })
})

describe('mergeFacts', () => {
  it('inserts new ids and reports newCount', () => {
    const local = [fact()]
    const incoming = [fact({ id: 'wikipedia:no:2', title: 'Nidelva' })]
    const { facts, newCount } = mergeFacts(local, incoming)
    expect(newCount).toBe(1)
    expect(facts.map((f) => f.id)).toEqual(['wikipedia:no:1', 'wikipedia:no:2'])
  })

  it('dedupes duplicate incoming new ids', () => {
    const duplicate = fact({ id: 'wikipedia:no:2', title: 'First' })
    const incoming = [duplicate, fact({ id: 'wikipedia:no:2', title: 'Second' })]
    const { facts, newCount } = mergeFacts([], incoming)
    expect(newCount).toBe(1)
    expect(facts).toHaveLength(1)
    expect(facts[0].id).toBe('wikipedia:no:2')
  })

  it('does not drop local-only facts', () => {
    const local = [fact(), fact({ id: 'wikipedia:no:local' })]
    const incoming = [fact({ id: 'wikipedia:no:2' })]
    const { facts } = mergeFacts(local, incoming)
    expect(facts.map((f) => f.id)).toEqual([
      'wikipedia:no:1',
      'wikipedia:no:local',
      'wikipedia:no:2',
    ])
  })

  it('keeps earliest unlockedAt and readAt for same id', () => {
    const local = [
      fact({
        unlockedAt: '2026-01-02T00:00:00.000Z',
        readAt: '2026-01-05T00:00:00.000Z',
      }),
    ]
    const incoming = [
      fact({
        unlockedAt: '2026-01-01T00:00:00.000Z',
        readAt: '2026-01-03T00:00:00.000Z',
      }),
    ]
    const merged = mergeFacts(local, incoming).facts[0]
    expect(merged.unlockedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(merged.readAt).toBe('2026-01-03T00:00:00.000Z')
  })

  it('keeps readAt when only one side is read', () => {
    const local = [fact({ readAt: undefined })]
    const incoming = [
      fact({ readAt: '2026-01-03T00:00:00.000Z' }),
    ]
    expect(mergeFacts(local, incoming).facts[0].readAt).toBe(
      '2026-01-03T00:00:00.000Z',
    )

    const localRead = [fact({ readAt: '2026-01-04T00:00:00.000Z' })]
    const incomingUnread = [fact({ readAt: undefined })]
    expect(mergeFacts(localRead, incomingUnread).facts[0].readAt).toBe(
      '2026-01-04T00:00:00.000Z',
    )
  })

  it('fills empty local title extract thumbnail from incoming', () => {
    const local = [
      fact({ title: '', extract: '', thumbnailUrl: undefined }),
    ]
    const incoming = [
      fact({
        title: 'Incoming title',
        extract: 'Incoming extract',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      }),
    ]
    const merged = mergeFacts(local, incoming).facts[0]
    expect(merged.title).toBe('Incoming title')
    expect(merged.extract).toBe('Incoming extract')
    expect(merged.thumbnailUrl).toBe('https://example.com/thumb.jpg')
  })

  it('collapses the same Wikidata article in two languages into one', () => {
    const local = [
      fact({
        id: 'wikipedia:no:1',
        lang: 'no',
        title: 'Nidarosdomen',
        wikidataId: 'Q215023',
      }),
    ]
    const incoming = [
      fact({
        id: 'wikipedia:en:2',
        lang: 'en',
        title: 'Nidaros Cathedral',
        extract: 'A cathedral in Trondheim',
        pageUrl: 'https://en.wikipedia.org/wiki/Nidaros_Cathedral',
        wikidataId: 'Q215023',
      }),
    ]
    const { facts, newCount } = mergeFacts(local, incoming, ['no', 'en'])
    expect(newCount).toBe(0)
    expect(facts).toHaveLength(1)
    expect(facts[0].id).toBe('wikipedia:no:1')
    expect(facts[0].lang).toBe('no')
    expect(facts[0].title).toBe('Nidarosdomen')
  })

  it('keeps the Wikipedia-source language when merging the same Q-id', () => {
    const local = [
      fact({
        id: 'wikipedia:en:2',
        lang: 'en',
        title: 'Nidaros Cathedral',
        wikidataId: 'Q215023',
        unlockedAt: '2026-01-02T00:00:00.000Z',
      }),
    ]
    const incoming = [
      fact({
        id: 'wikipedia:no:1',
        lang: 'no',
        title: 'Nidarosdomen',
        wikidataId: 'Q215023',
        unlockedAt: '2026-01-01T00:00:00.000Z',
        readAt: '2026-01-03T00:00:00.000Z',
      }),
    ]
    const { facts, newCount } = mergeFacts(local, incoming, ['no', 'en'])
    expect(newCount).toBe(0)
    expect(facts).toHaveLength(1)
    expect(facts[0].id).toBe('wikipedia:no:1')
    expect(facts[0].title).toBe('Nidarosdomen')
    expect(facts[0].unlockedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(facts[0].readAt).toBe('2026-01-03T00:00:00.000Z')
  })

  it('matches across languages via langlink titles', () => {
    const local = [
      fact({
        id: 'wikipedia:no:1',
        lang: 'no',
        title: 'Nidarosdomen',
        langTitles: { en: 'Nidaros Cathedral' },
      }),
    ]
    const incoming = [
      fact({
        id: 'wikipedia:en:2',
        lang: 'en',
        title: 'Nidaros Cathedral',
      }),
    ]
    const { facts, newCount } = mergeFacts(local, incoming, ['no', 'en'])
    expect(newCount).toBe(0)
    expect(facts).toHaveLength(1)
    expect(facts[0].id).toBe('wikipedia:no:1')
  })
})

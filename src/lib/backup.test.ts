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
    const invalid = { ...fact(), lang: 'fr' }
    expect(
      parseImportPayload({
        app: APP_NAME,
        version: 1,
        facts: [valid, invalid],
      }),
    ).toEqual({ ok: false })
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
})

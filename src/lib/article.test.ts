import { describe, expect, it } from 'vitest'
import { isSameArticle } from './article'

describe('isSameArticle', () => {
  it('matches the same id', () => {
    expect(
      isSameArticle(
        { id: 'wikipedia:no:1', lang: 'no', title: 'Nidarosdomen' },
        { id: 'wikipedia:no:1', lang: 'no', title: 'Nidarosdomen' },
      ),
    ).toBe(true)
  })

  it('matches the same Wikidata Q-id across languages', () => {
    expect(
      isSameArticle(
        {
          id: 'wikipedia:no:1',
          lang: 'no',
          title: 'Nidarosdomen',
          wikidataId: 'Q215023',
        },
        {
          id: 'wikipedia:en:2',
          lang: 'en',
          title: 'Nidaros Cathedral',
          wikidataId: 'Q215023',
        },
      ),
    ).toBe(true)
  })

  it('matches via langlink titles when Q-id is missing', () => {
    expect(
      isSameArticle(
        {
          id: 'wikipedia:no:1',
          lang: 'no',
          title: 'Nidarosdomen',
          langTitles: { en: 'Nidaros Cathedral' },
        },
        {
          id: 'wikipedia:en:2',
          lang: 'en',
          title: 'Nidaros Cathedral',
        },
      ),
    ).toBe(true)
  })

  it('does not match different articles', () => {
    expect(
      isSameArticle(
        { id: 'wikipedia:no:1', lang: 'no', title: 'Nidarosdomen', wikidataId: 'Q1' },
        { id: 'wikipedia:en:2', lang: 'en', title: 'Nidelva', wikidataId: 'Q2' },
      ),
    ).toBe(false)
  })
})

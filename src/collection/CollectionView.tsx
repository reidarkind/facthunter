import { useMemo, useState } from 'react'
import { FactSheet } from '../facts/FactSheet'
import { useT } from '../i18n/useT'
import {
  filterFacts,
  scoreFor,
  searchFacts,
  withRead,
} from '../lib/collection'
import type { SavedFact } from '../types'

type Filter = 'all' | 'unread' | 'read'

export function CollectionView(props: {
  facts: SavedFact[]
  onChange: (facts: SavedFact[]) => void
}) {
  const { facts, onChange } = props
  const { t } = useT()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = useMemo(() => {
    return filterFacts(searchFacts(facts, query), filter)
  }, [facts, query, filter])

  const openSaved = openId ? facts.find((f) => f.id === openId) : undefined
  const emptySrc = `${import.meta.env.BASE_URL}empty-journal.png`

  return (
    <section className="collection">
      <header className="collection-head">
        <div>
          <h1>{t('collectionTitle')}</h1>
          <p className="score">{t('points', { score: scoreFor(facts) })}</p>
        </div>
      </header>

      <label className="sr-only" htmlFor="fact-search">
        {t('search')}
      </label>
      <input
        id="fact-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('searchPlaceholder')}
      />

      <div className="filter-row" role="group" aria-label={t('filter')}>
        <button
          type="button"
          className={filter === 'all' ? 'active' : undefined}
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          {t('filterAll')}
        </button>
        <button
          type="button"
          className={filter === 'unread' ? 'active' : undefined}
          aria-pressed={filter === 'unread'}
          onClick={() => setFilter('unread')}
        >
          {t('filterUnread')}
        </button>
        <button
          type="button"
          className={filter === 'read' ? 'active' : undefined}
          aria-pressed={filter === 'read'}
          onClick={() => setFilter('read')}
        >
          {t('filterRead')}
        </button>
      </div>

      {facts.length === 0 ? (
        <div className="empty">
          <img src={emptySrc} alt="" width={220} height={220} />
          <p>{t('emptyJournal')}</p>
        </div>
      ) : (
        <ul className="fact-list">
          {visible.map((fact) => (
            <li key={fact.id}>
              <button
                type="button"
                className="fact-card"
                onClick={() => setOpenId(fact.id)}
              >
                <strong>{fact.title}</strong>
                <span>{fact.readAt ? t('read') : t('unread')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {openSaved ? (
        <FactSheet
          fact={openSaved}
          onClose={() => setOpenId(null)}
          onRead={() =>
            onChange(withRead(facts, openSaved.id, new Date().toISOString()))
          }
        />
      ) : null}
    </section>
  )
}

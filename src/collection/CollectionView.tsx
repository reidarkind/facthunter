import { useMemo, useRef, useState } from 'react'
import { FactSheet } from '../facts/FactSheet'
import { useT } from '../i18n/useT'
import {
  buildExportPayload,
  mergeFacts,
  parseImportPayload,
} from '../lib/backup'
import {
  filterFacts,
  scoreFor,
  searchFacts,
  withRead,
} from '../lib/collection'
import type { SavedFact } from '../types'

type Filter = 'all' | 'unread' | 'read'

function exportFilename(now: Date): string {
  return `facthunter-samling-${now.toISOString().slice(0, 10)}.json`
}

export function CollectionView(props: {
  facts: SavedFact[]
  onChange: (facts: SavedFact[]) => void
}) {
  const { facts, onChange } = props
  const { t } = useT()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    return filterFacts(searchFacts(facts, query), filter)
  }, [facts, query, filter])

  const openSaved = openId ? facts.find((f) => f.id === openId) : undefined
  const emptySrc = `${import.meta.env.BASE_URL}empty-journal.png`

  async function exportCollection() {
    const payload = buildExportPayload(facts, new Date().toISOString())
    const file = new File(
      [JSON.stringify(payload, null, 2)],
      exportFilename(new Date()),
      { type: 'application/json' },
    )
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }
    if (nav.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: 'FactHunter' })
        return
      } catch {
        /* fall through to download */
      }
    }
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importFile(file: File) {
    setNotice(null)
    try {
      const raw: unknown = JSON.parse(await file.text())
      const parsed = parseImportPayload(raw)
      if (!parsed.ok) {
        setNotice(t('importFailed'))
        return
      }
      const { facts: merged, newCount } = mergeFacts(facts, parsed.facts)
      onChange(merged)
      setNotice(t('importedNew', { count: newCount }))
    } catch {
      setNotice(t('importFailed'))
    }
  }

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

      <div className="backup-row">
        <button type="button" onClick={() => void exportCollection()}>
          {t('export')}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          {t('import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void importFile(file)
          }}
        />
      </div>
      {notice ? <p className="notice">{notice}</p> : null}

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

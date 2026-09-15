import { useRef, useState } from 'react'
import { useT } from '../i18n/useT'
import {
  buildExportPayload,
  mergeFacts,
  parseImportPayload,
} from '../lib/backup'
import type { SavedFact } from '../types'

function exportFilename(now: Date): string {
  return `facthunter-samling-${now.toISOString().slice(0, 10)}.json`
}

export function CollectionBackup(props: {
  facts: SavedFact[]
  onChange: (facts: SavedFact[]) => void
  langPriority?: readonly string[]
}) {
  const { facts, onChange, langPriority = [] } = props
  const { t } = useT()
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState<SavedFact[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  function applyImport(incoming: SavedFact[], mode: 'merge' | 'replace') {
    const merged =
      mode === 'replace'
        ? mergeFacts([], incoming, langPriority)
        : mergeFacts(facts, incoming, langPriority)
    onChange(merged.facts)
    setPending(null)
    if (mode === 'replace') {
      setNotice(t('importedReplaced'))
      return
    }
    setNotice(t('importedNew', { count: merged.newCount }))
  }

  async function importFile(file: File) {
    setNotice(null)
    setPending(null)
    try {
      const raw: unknown = JSON.parse(await file.text())
      const parsed = parseImportPayload(raw)
      if (!parsed.ok) {
        setNotice(t('importFailed'))
        return
      }
      if (facts.length === 0) {
        applyImport(parsed.facts, 'merge')
        return
      }
      setPending(parsed.facts)
    } catch {
      setNotice(t('importFailed'))
    }
  }

  return (
    <>
      {pending ? (
        <>
          <p className="banner warn">{t('importChooseHelp')}</p>
          <div className="filter-row">
            <button type="button" onClick={() => setPending(null)}>
              {t('cancel')}
            </button>
            <button type="button" onClick={() => applyImport(pending, 'merge')}>
              {t('importMerge')}
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => applyImport(pending, 'replace')}
            >
              {t('importReplace')}
            </button>
          </div>
        </>
      ) : (
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
            aria-label={t('import')}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void importFile(file)
            }}
          />
        </div>
      )}
      {notice ? <p className="notice">{notice}</p> : null}
    </>
  )
}

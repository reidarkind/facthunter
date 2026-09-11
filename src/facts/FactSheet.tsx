import { useCallback, type UIEvent } from 'react'
import { isExtractRead } from '../lib/collection'
import { installUrl, shareText } from '../lib/share'

export type SheetFact = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: 'no' | 'en'
  distanceM?: number
  readAt?: string
}

function currentInstallUrl(): string {
  return installUrl(window.location.origin, import.meta.env.BASE_URL)
}

export function FactSheet(props: {
  fact: SheetFact
  onClose: () => void
  onRead: () => void
  onShare?: (text: string) => void
}) {
  const { fact, onClose, onRead } = props
  const text = shareText(fact.pageUrl, currentInstallUrl())

  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget
      if (isExtractRead(el.scrollTop, el.clientHeight, el.scrollHeight)) {
        onRead()
      }
    },
    [onRead],
  )

  async function shareNative() {
    props.onShare?.(text)
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        /* user cancelled */
      }
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard may be blocked */
    }
  }

  const smsHref = `sms:?body=${encodeURIComponent(text)}`
  const mailHref = `mailto:?subject=${encodeURIComponent('FactHunter')}&body=${encodeURIComponent(text)}`

  return (
    <div className="sheet-backdrop">
      <section className="sheet" role="dialog" aria-labelledby="sheet-title">
        <header className="sheet-head">
          <h2 id="sheet-title">{fact.title}</h2>
          <button type="button" className="text-button" onClick={onClose}>
            Lukk
          </button>
        </header>
        {fact.thumbnailUrl ? (
          <img className="sheet-thumb" src={fact.thumbnailUrl} alt="" />
        ) : null}
        {fact.distanceM !== undefined ? (
          <p className="sheet-meta">{Math.round(fact.distanceM)} m unna</p>
        ) : null}
        <div
          className="sheet-extract"
          data-testid="extract"
          onScroll={onScroll}
        >
          <p>{fact.extract}</p>
        </div>
        <p>
          <a href={fact.pageUrl} target="_blank" rel="noreferrer">
            Les mer på Wikipedia
          </a>
        </p>
        <div className="share-row">
          <button type="button" onClick={() => void shareNative()}>
            Del
          </button>
          <button type="button" onClick={() => void copy()}>
            Kopier
          </button>
          <a className="button-link" href={smsHref}>
            SMS
          </a>
          <a className="button-link" href={mailHref}>
            E-post
          </a>
        </div>
      </section>
    </div>
  )
}

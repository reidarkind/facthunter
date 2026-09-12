import { useCallback, useLayoutEffect, useRef, type UIEvent } from 'react'
import { useT } from '../i18n/useT'
import { isExtractRead } from '../lib/collection'
import { installUrl, shareText } from '../lib/share'

export type SheetFact = {
  id: string
  title: string
  extract: string
  thumbnailUrl?: string
  pageUrl: string
  lang: string
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
  const { t } = useT()
  const sheetRef = useRef<HTMLElement>(null)
  const text = shareText(
    fact.pageUrl,
    currentInstallUrl(),
    t('shareIntro'),
    t('shareInstall'),
  )

  const checkRead = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      if (isExtractRead(el.scrollTop, el.clientHeight, el.scrollHeight)) {
        onRead()
      }
    },
    [onRead],
  )

  const onScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      checkRead(event.currentTarget)
    },
    [checkRead],
  )

  useLayoutEffect(() => {
    const el = sheetRef.current
    if (!el) return
    checkRead(el)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => checkRead(el))
    observer.observe(el)
    return () => observer.disconnect()
  }, [checkRead, fact.id])

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
      <section
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-labelledby="sheet-title"
        onScroll={onScroll}
      >
        <header className="sheet-head">
          <h2 id="sheet-title">{fact.title}</h2>
          <button type="button" className="text-button" onClick={onClose}>
            {t('close')}
          </button>
        </header>
        {fact.thumbnailUrl ? (
          <img className="sheet-thumb" src={fact.thumbnailUrl} alt="" />
        ) : null}
        {fact.distanceM !== undefined ? (
          <p className="sheet-meta">
            {t('metersAway', { m: Math.round(fact.distanceM) })}
          </p>
        ) : null}
        <div className="sheet-extract" data-testid="extract">
          <p>{fact.extract}</p>
        </div>
        <p>
          <a
            href={fact.pageUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onRead()}
          >
            {t('readMoreWiki')}
          </a>
        </p>
        <div className="share-row">
          <button type="button" onClick={() => void shareNative()}>
            {t('share')}
          </button>
          <button type="button" onClick={() => void copy()}>
            {t('copy')}
          </button>
          <a className="button-link" href={smsHref}>
            {t('sms')}
          </a>
          <a className="button-link" href={mailHref}>
            {t('email')}
          </a>
        </div>
      </section>
    </div>
  )
}

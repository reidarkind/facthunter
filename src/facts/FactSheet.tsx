import { useCallback, type UIEvent } from 'react'
import { useT } from '../i18n/useT'
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
  const { t } = useT()
  const text = shareText(
    fact.pageUrl,
    currentInstallUrl(),
    t('shareIntro'),
    t('shareInstall'),
  )

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
        <div
          className="sheet-extract"
          data-testid="extract"
          onScroll={onScroll}
        >
          <p>{fact.extract}</p>
        </div>
        <p>
          <a href={fact.pageUrl} target="_blank" rel="noreferrer">
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

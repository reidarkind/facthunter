import { useState } from 'react'
import type { MessageKey } from '../i18n/strings'
import { useT } from '../i18n/useT'
import { WIKI_LIMITS, WIKI_SOURCE_LANGS } from '../lib/constants'
import { LOCALES, type Locale } from '../lib/locale'
import { parseWikiLang, withWikiSlot } from '../lib/prefs'
import { usePrefs } from './usePrefs'

const LOCALE_LABEL: Record<Locale, MessageKey> = {
  no: 'langNo',
  en: 'langEn',
  de: 'langDe',
  es: 'langEs',
  pt: 'langPt',
  fr: 'langFr',
}

const SLOT_LABELS = [
  'wikiSourcePrimary',
  'wikiSourceSecondary',
  'wikiSourceTertiary',
] as const

export function SettingsPage(props: {
  onBack?: () => void
  onClearCollection?: () => void
}) {
  const { t, locale, setLocale } = useT()
  const { wikiLimit, setWikiLimit, wikiSources, setWikiSources } = usePrefs()
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)

  function clearCollection() {
    props.onClearCollection?.()
    setConfirmClear(false)
    setCleared(true)
  }

  return (
    <article className="install-page">
      {props.onBack ? (
        <p>
          <button type="button" className="text-button" onClick={props.onBack}>
            {t('back')}
          </button>
        </p>
      ) : null}
      <header className="install-hero">
        <h1>{t('settingsTitle')}</h1>
      </header>
      <section>
        <h2>{t('language')}</h2>
        <p>{t('languageHelp')}</p>
        <label className="settings-field">
          {t('language')}
          <select
            aria-label={t('language')}
            value={locale}
            onChange={(event) => {
              const next = LOCALES.find((code) => code === event.target.value)
              if (next) setLocale(next)
            }}
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {t(LOCALE_LABEL[code])}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section>
        <h2>{t('wikiSources')}</h2>
        <p>{t('wikiSourcesHelp')}</p>
        {SLOT_LABELS.map((key, index) => (
          <label className="settings-field" key={key}>
            {t(key)}
            <select
              aria-label={t(key)}
              value={wikiSources.langs[index] ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                if (raw === '') {
                  if (index === 0) return
                  setWikiSources(withWikiSlot(wikiSources, index, null))
                  return
                }
                const next = parseWikiLang(raw)
                if (next) setWikiSources(withWikiSlot(wikiSources, index, next))
              }}
            >
              {index > 0 ? (
                <option value="">{t('wikiSourceNone')}</option>
              ) : null}
              {WIKI_SOURCE_LANGS.map((lang) => (
                <option key={`${key}-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </section>
      <section>
        <h2>{t('wikiLimit')}</h2>
        <p>{t('wikiLimitHelp')}</p>
        <div className="filter-row" role="group" aria-label={t('wikiLimit')}>
          {WIKI_LIMITS.map((limit) => (
            <button
              key={limit}
              type="button"
              className={wikiLimit === limit ? 'active' : undefined}
              aria-pressed={wikiLimit === limit}
              onClick={() => setWikiLimit(limit)}
            >
              {limit}
            </button>
          ))}
        </div>
      </section>
      {props.onClearCollection ? (
        <section>
          <h2>{t('collectionReset')}</h2>
          <p>{t('collectionResetHelp')}</p>
          {confirmClear ? (
            <>
              <p className="banner warn">{t('collectionResetConfirm')}</p>
              <div className="filter-row">
                <button type="button" onClick={() => setConfirmClear(false)}>
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={clearCollection}
                >
                  {t('collectionResetConfirmAction')}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="danger"
              onClick={() => {
                setCleared(false)
                setConfirmClear(true)
              }}
            >
              {t('collectionResetAction')}
            </button>
          )}
          {cleared ? <p className="notice">{t('collectionResetDone')}</p> : null}
        </section>
      ) : null}
    </article>
  )
}

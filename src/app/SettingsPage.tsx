import { useState } from 'react'
import { CollectionBackup } from '../collection/CollectionBackup'
import type { MessageKey } from '../i18n/strings'
import { useT } from '../i18n/useT'
import { WIKI_LIMITS, WIKI_SOURCE_LANGS } from '../lib/constants'
import { LOCALES, type Locale } from '../lib/locale'
import { parseWikiLang, withWikiSlot } from '../lib/prefs'
import {
  applyAppUpdate,
  browserUpdateBridge,
  checkForAppUpdate,
  type UpdateCheckResult,
} from '../pwa/updates'
import type { SavedFact } from '../types'
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

type UpdateStep = 'idle' | 'checking' | UpdateCheckResult

export function SettingsPage(props: {
  onBack?: () => void
  onClearCollection?: () => void
  facts?: SavedFact[]
  onFactsChange?: (facts: SavedFact[]) => void
  checkUpdate?: () => Promise<UpdateCheckResult>
  applyUpdate?: () => void | Promise<void>
}) {
  const { t, locale, setLocale } = useT()
  const { wikiLimit, setWikiLimit, wikiSources, setWikiSources } = usePrefs()
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [updateStep, setUpdateStep] = useState<UpdateStep>('idle')

  const checkUpdate =
    props.checkUpdate ?? (() => checkForAppUpdate(browserUpdateBridge()))
  const applyUpdate =
    props.applyUpdate ??
    (() =>
      applyAppUpdate(browserUpdateBridge(), {
        reload: () => window.location.reload(),
      }))

  function clearCollection() {
    props.onClearCollection?.()
    setConfirmClear(false)
    setCleared(true)
  }

  function onCheckUpdate() {
    setUpdateStep('checking')
    void checkUpdate().then(setUpdateStep)
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
      <section>
        <h2>{t('appUpdateTitle')}</h2>
        <button
          type="button"
          disabled={updateStep === 'checking'}
          onClick={onCheckUpdate}
        >
          {t('appUpdate')}
        </button>
        {updateStep === 'checking' ? (
          <p className="notice">{t('appUpdateChecking')}</p>
        ) : null}
        {updateStep === 'current' ? (
          <p className="notice">{t('appUpdateCurrent')}</p>
        ) : null}
        {updateStep === 'offline' ? (
          <p className="notice">{t('appUpdateOffline')}</p>
        ) : null}
        {updateStep === 'available' ? (
          <>
            <p className="notice">{t('appUpdateAvailable')}</p>
            <button type="button" className="primary" onClick={() => void applyUpdate()}>
              {t('appUpdateApply')}
            </button>
          </>
        ) : null}
      </section>
      {props.onClearCollection || props.onFactsChange ? (
        <section>
          <h2>{t('collectionReset')}</h2>
          <p>{t('collectionResetHelp')}</p>
          {props.onFactsChange ? (
            <CollectionBackup
              facts={props.facts ?? []}
              onChange={props.onFactsChange}
              langPriority={wikiSources.langs}
            />
          ) : null}
          {props.onClearCollection ? (
            confirmClear ? (
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
            )
          ) : null}
          {cleared ? <p className="notice">{t('collectionResetDone')}</p> : null}
        </section>
      ) : null}
    </article>
  )
}

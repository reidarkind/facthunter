import { useT } from '../i18n/useT'
import { WIKI_LIMITS, WIKI_SOURCE_LANGS } from '../lib/constants'
import type { Locale } from '../lib/locale'
import { parseWikiLang, withWikiSlot } from '../lib/prefs'
import { usePrefs } from './usePrefs'

const SLOT_LABELS = [
  'wikiSourcePrimary',
  'wikiSourceSecondary',
  'wikiSourceTertiary',
] as const

export function SettingsPage(props: { onBack?: () => void }) {
  const { t, locale, setLocale } = useT()
  const { wikiLimit, setWikiLimit, wikiSources, setWikiSources } = usePrefs()

  function choose(next: Locale) {
    setLocale(next)
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
        <div className="filter-row" role="group" aria-label={t('language')}>
          <button
            type="button"
            className={locale === 'no' ? 'active' : undefined}
            aria-pressed={locale === 'no'}
            onClick={() => choose('no')}
          >
            {t('langNo')}
          </button>
          <button
            type="button"
            className={locale === 'en' ? 'active' : undefined}
            aria-pressed={locale === 'en'}
            onClick={() => choose('en')}
          >
            {t('langEn')}
          </button>
        </div>
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
    </article>
  )
}

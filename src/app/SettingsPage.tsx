import { useT } from '../i18n/useT'
import { WIKI_LIMITS, WIKI_SOURCE_LANGS } from '../lib/constants'
import type { Locale } from '../lib/locale'
import {
  parseWikiLang,
  withWikiPrimary,
  withWikiSecondary,
} from '../lib/prefs'
import { usePrefs } from './usePrefs'

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
        <label className="settings-field">
          {t('wikiSourcePrimary')}
          <select
            aria-label={t('wikiSourcePrimary')}
            value={wikiSources.primary}
            onChange={(event) => {
              const next = parseWikiLang(event.target.value)
              if (next) setWikiSources(withWikiPrimary(wikiSources, next))
            }}
          >
            {WIKI_SOURCE_LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-field">
          {t('wikiSourceSecondary')}
          <select
            aria-label={t('wikiSourceSecondary')}
            value={wikiSources.secondary}
            onChange={(event) => {
              const next = parseWikiLang(event.target.value)
              if (next) setWikiSources(withWikiSecondary(wikiSources, next))
            }}
          >
            {WIKI_SOURCE_LANGS.map((lang) => (
              <option key={`second-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </label>
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

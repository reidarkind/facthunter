import { useT } from '../i18n/useT'
import type { Locale } from '../lib/locale'

export function SettingsPage(props: { onBack?: () => void }) {
  const { t, locale, setLocale } = useT()

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
    </article>
  )
}

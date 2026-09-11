import { useT } from '../i18n/useT'

export function InstallPage(props: { onBack?: () => void }) {
  const { t } = useT()
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
        <img
          src={`${import.meta.env.BASE_URL}icon.png`}
          alt=""
          width={96}
          height={96}
        />
        <h1>FactHunter</h1>
      </header>

      <section>
        <h2>{t('whatThisIs')}</h2>
        <p>{t('whatThisIsBody')}</p>
      </section>

      <section>
        <h2>{t('privacy')}</h2>
        <p>{t('privacyBody1')}</p>
        <p>{t('privacyBody2')}</p>
      </section>

      <section>
        <h2>{t('addToHome')}</h2>
        <p>{t('addToHomeBody')}</p>

        <h3>iPhone</h3>
        <ol>
          <li>{t('ios1')}</li>
          <li>{t('ios2')}</li>
          <li>{t('ios3')}</li>
          <li>{t('ios4')}</li>
          <li>{t('ios5')}</li>
          <li>{t('ios6')}</li>
        </ol>
        <p>{t('iosNote')}</p>

        <h3>Android</h3>
        <ol>
          <li>{t('android1')}</li>
          <li>{t('android2')}</li>
          <li>{t('android3')}</li>
          <li>{t('android4')}</li>
        </ol>
        <p>{t('androidNote')}</p>
      </section>

      <section>
        <h2>{t('origin')}</h2>
        <p>{t('originBody')}</p>
      </section>
    </article>
  )
}

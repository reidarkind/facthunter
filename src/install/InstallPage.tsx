import { useT } from '../i18n/useT'
import { BUY_ME_A_COFFEE_URL, OTHER_APPS_URL } from '../lib/constants'

function CoffeeCup() {
  return (
    <svg
      className="coffee-cup"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M8 3c.3 1 .3 1.8 0 2.6M11 2.5c.4 1.1.4 2.1 0 3.2M14 3c.3 1 .3 1.8 0 2.6"
      />
      <path
        fill="currentColor"
        d="M5 8h12v6.2A4.8 4.8 0 0 1 12.2 19H9.8A4.8 4.8 0 0 1 5 14.2V8zm13 1.6h1.4A2.6 2.6 0 0 1 22 12.2a2.6 2.6 0 0 1-2.6 2.6H18"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M7 20.5h10"
      />
    </svg>
  )
}

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
        <p>
          <a
            href={OTHER_APPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('otherApps')}
          </a>
        </p>
        <p>{t('buyCoffeeBody')}</p>
        <p>
          <a
            className="coffee-button"
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CoffeeCup />
            {t('buyCoffee')}
          </a>
        </p>
      </section>
    </article>
  )
}

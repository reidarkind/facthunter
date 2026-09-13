import { useEffect, useRef } from 'react'
import { useT } from '../i18n/useT'
import {
  BUY_ME_A_COFFEE_SCRIPT,
  BUY_ME_A_COFFEE_SLUG,
  OTHER_APPS_URL,
} from '../lib/constants'

function BuyMeACoffeeButton(props: { text: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = BUY_ME_A_COFFEE_SCRIPT
    script.dataset.name = 'bmc-button'
    script.dataset.slug = BUY_ME_A_COFFEE_SLUG
    script.dataset.color = '#FFDD00'
    script.dataset.emoji = '☕'
    script.dataset.font = 'Cookie'
    script.dataset.text = props.text
    script.dataset.outlineColor = '#000000'
    script.dataset.fontColor = '#000000'
    script.dataset.coffeeColor = '#ffffff'
    el.appendChild(script)
    return () => {
      el.replaceChildren()
    }
  }, [props.text])

  return <div className="bmc-host" ref={host} />
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
        <BuyMeACoffeeButton text={t('buyCoffee')} />
      </section>
    </article>
  )
}

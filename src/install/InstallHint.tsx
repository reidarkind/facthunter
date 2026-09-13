import { useState } from 'react'
import { useT } from '../i18n/useT'
import {
  dismissInstallHint,
  readStoredInstallHint,
  shouldShowInstallHintFromWindow,
} from '../lib/installHint'

type SafariNavigator = Navigator & { standalone?: boolean }

export function InstallHint() {
  const { t } = useT()
  const [visible, setVisible] = useState(() =>
    shouldShowInstallHintFromWindow(
      {
        matchMedia:
          typeof window.matchMedia === 'function'
            ? (query) => window.matchMedia(query)
            : undefined,
        navigator: window.navigator as SafariNavigator,
      },
      readStoredInstallHint(),
    ),
  )

  function onDismiss() {
    dismissInstallHint()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <p className="banner install-hint">
      <a href="#/install">{t('installHint')}</a>
      <button type="button" onClick={onDismiss}>
        {t('close')}
      </button>
    </p>
  )
}

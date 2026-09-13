import { useState, type ReactNode } from 'react'
import { useT } from '../i18n/useT'
import { InstallPage } from '../install/InstallPage'
import { SettingsPage } from './SettingsPage'

export type AppTab = 'hunt' | 'recon' | 'collection'
export type AppOverlay = 'none' | 'install' | 'settings'

export function AppShell(props: {
  tab: AppTab
  onTab: (tab: AppTab) => void
  overlay: AppOverlay
  onCloseOverlay: () => void
  onClearCollection?: () => void
  children: ReactNode
}) {
  const { t } = useT()
  const [menuOpen, setMenuOpen] = useState(false)

  if (props.overlay === 'install') {
    return (
      <div className="app-shell">
        <InstallPage onBack={props.onCloseOverlay} />
      </div>
    )
  }

  if (props.overlay === 'settings') {
    return (
      <div className="app-shell">
        <SettingsPage
          onBack={props.onCloseOverlay}
          onClearCollection={props.onClearCollection}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">{props.children}</main>
      {menuOpen ? (
        <div
          className="app-menu-backdrop"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="app-menu"
            role="dialog"
            aria-label={t('menu')}
            onClick={(event) => event.stopPropagation()}
          >
            <a href="#/settings" onClick={() => setMenuOpen(false)}>
              {t('settings')}
            </a>
            <a href="#/install" onClick={() => setMenuOpen(false)}>
              {t('about')}
            </a>
          </div>
        </div>
      ) : null}
      <nav className="tab-bar" aria-label={t('navMain')}>
        <button
          type="button"
          className={props.tab === 'recon' ? 'active' : undefined}
          onClick={() => props.onTab('recon')}
        >
          {t('tabRecon')}
        </button>
        <button
          type="button"
          className={props.tab === 'hunt' ? 'active' : undefined}
          onClick={() => props.onTab('hunt')}
        >
          {t('tabHunt')}
        </button>
        <button
          type="button"
          className={props.tab === 'collection' ? 'active' : undefined}
          onClick={() => props.onTab('collection')}
        >
          {t('tabCollection')}
        </button>
        <button
          type="button"
          className="menu-button"
          aria-label={t('menu')}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </nav>
    </div>
  )
}

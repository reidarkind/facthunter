import type { ReactNode } from 'react'
import { InstallPage } from '../install/InstallPage'

export function AppShell(props: {
  tab: 'hunt' | 'collection'
  onTab: (tab: 'hunt' | 'collection') => void
  showInstall: boolean
  onBackFromInstall: () => void
  children: ReactNode
}) {
  if (props.showInstall) {
    return (
      <div className="app-shell">
        <InstallPage onBack={props.onBackFromInstall} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">{props.children}</main>
      <nav className="tab-bar" aria-label="Hovedmeny">
        <button
          type="button"
          className={props.tab === 'hunt' ? 'active' : undefined}
          onClick={() => props.onTab('hunt')}
        >
          Jakt
        </button>
        <button
          type="button"
          className={props.tab === 'collection' ? 'active' : undefined}
          onClick={() => props.onTab('collection')}
        >
          Samling
        </button>
      </nav>
    </div>
  )
}

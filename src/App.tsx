import { useCallback, useEffect, useState } from 'react'
import { AppShell, type AppTab } from './app/AppShell'
import { CollectionView } from './collection/CollectionView'
import { HuntView } from './hunt/HuntView'
import { loadFacts, saveFacts } from './lib/storage'
import { ReconView } from './recon/ReconView'
import type { SavedFact } from './types'

function isInstallRoute(): boolean {
  if (window.location.hash === '#/install') return true
  const path = window.location.pathname.replace(/\/+$/, '')
  return path.endsWith('/install')
}

export default function App() {
  const [facts, setFacts] = useState<SavedFact[]>([])
  const [tab, setTab] = useState<AppTab>('hunt')
  const [showInstall, setShowInstall] = useState(isInstallRoute)

  useEffect(() => {
    void loadFacts().then(setFacts)
  }, [])

  useEffect(() => {
    const sync = () => setShowInstall(isInstallRoute())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const onFactsChange = useCallback((next: SavedFact[]) => {
    setFacts(next)
    void saveFacts(next)
  }, [])

  return (
    <AppShell
      tab={tab}
      onTab={setTab}
      showInstall={showInstall}
      onBackFromInstall={() => {
        window.location.hash = ''
        setShowInstall(false)
      }}
    >
      {tab === 'hunt' ? (
        <HuntView facts={facts} onFactsChange={onFactsChange} />
      ) : tab === 'recon' ? (
        <ReconView />
      ) : (
        <CollectionView facts={facts} onChange={onFactsChange} />
      )}
    </AppShell>
  )
}

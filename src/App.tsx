import { useCallback, useEffect, useState } from 'react'
import { AppShell, type AppOverlay, type AppTab } from './app/AppShell'
import { CollectionView } from './collection/CollectionView'
import { HuntView } from './hunt/HuntView'
import { loadFacts, saveFacts } from './lib/storage'
import { ReconView } from './recon/ReconView'
import type { SavedFact } from './types'

function currentOverlay(): AppOverlay {
  const hash = window.location.hash
  if (hash === '#/settings') return 'settings'
  if (hash === '#/install' || hash === '#/about') return 'install'
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('/settings')) return 'settings'
  if (path.endsWith('/install')) return 'install'
  return 'none'
}

export default function App() {
  const [facts, setFacts] = useState<SavedFact[]>([])
  const [tab, setTab] = useState<AppTab>('recon')
  const [overlay, setOverlay] = useState<AppOverlay>(currentOverlay)

  useEffect(() => {
    void loadFacts().then(setFacts)
  }, [])

  useEffect(() => {
    const sync = () => setOverlay(currentOverlay())
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
      overlay={overlay}
      onCloseOverlay={() => {
        window.location.hash = ''
        setOverlay('none')
      }}
      onClearCollection={() => onFactsChange([])}
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

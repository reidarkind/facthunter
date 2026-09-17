import { registerSW } from 'virtual:pwa-register'
import { browserPersistBridge, requestPersistentStorage } from './pwa/persist'

export function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  registerSW({ immediate: true })
  void requestPersistentStorage(browserPersistBridge())
}

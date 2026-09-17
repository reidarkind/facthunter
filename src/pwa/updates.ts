export type UpdateCheckResult = 'offline' | 'current' | 'available'

export type ServiceWorkerLike = {
  postMessage: (message: { type: 'SKIP_WAITING' }) => void
}

export type RegistrationLike = {
  waiting: ServiceWorkerLike | null
  update: () => Promise<void>
}

export type UpdateBridge = {
  isOnline: () => boolean
  getRegistration: () => Promise<RegistrationLike | undefined>
}

export async function checkForAppUpdate(
  bridge: UpdateBridge,
): Promise<UpdateCheckResult> {
  if (!bridge.isOnline()) return 'offline'
  const registration = await bridge.getRegistration()
  if (!registration) return 'current'
  try {
    await registration.update()
  } catch {
    return 'offline'
  }
  return registration.waiting ? 'available' : 'current'
}

export async function applyAppUpdate(
  bridge: UpdateBridge,
  actions: { reload: () => void },
): Promise<void> {
  const registration = await bridge.getRegistration()
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  actions.reload()
}

export function browserUpdateBridge(): UpdateBridge {
  return {
    isOnline: () => navigator.onLine,
    getRegistration: async () => {
      if (!('serviceWorker' in navigator)) return undefined
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return undefined
      return {
        waiting: registration.waiting,
        update: async () => {
          await registration.update()
        },
      }
    },
  }
}

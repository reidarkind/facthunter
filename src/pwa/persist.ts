export type PersistResult = 'granted' | 'denied' | 'unsupported'

export type PersistBridge = {
  storage: {
    persist: () => Promise<boolean>
    persisted: () => Promise<boolean>
  } | null
}

export async function requestPersistentStorage(
  bridge: PersistBridge,
): Promise<PersistResult> {
  if (!bridge.storage) return 'unsupported'
  try {
    if (await bridge.storage.persisted()) return 'granted'
    return (await bridge.storage.persist()) ? 'granted' : 'denied'
  } catch {
    return 'unsupported'
  }
}

export function browserPersistBridge(): PersistBridge {
  const storage =
    typeof navigator !== 'undefined' ? navigator.storage : undefined
  if (
    !storage ||
    typeof storage.persist !== 'function' ||
    typeof storage.persisted !== 'function'
  ) {
    return { storage: null }
  }
  return {
    storage: {
      persist: () => storage.persist(),
      persisted: () => storage.persisted(),
    },
  }
}

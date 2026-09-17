import { describe, expect, it, vi } from 'vitest'
import { requestPersistentStorage, type PersistBridge } from './persist'

function bridge(opts: {
  persist?: () => Promise<boolean>
  persisted?: () => Promise<boolean>
}): PersistBridge {
  if (!opts.persist && !opts.persisted) return { storage: null }
  return {
    storage: {
      persist: opts.persist ?? (async () => false),
      persisted: opts.persisted ?? (async () => false),
    },
  }
}

describe('persistent storage', () => {
  it('does nothing when Storage Manager is missing', async () => {
    expect(await requestPersistentStorage(bridge({}))).toBe('unsupported')
  })

  it('skips persist when storage is already durable', async () => {
    const persist = vi.fn(async () => true)
    const result = await requestPersistentStorage(
      bridge({ persist, persisted: async () => true }),
    )
    expect(result).toBe('granted')
    expect(persist).not.toHaveBeenCalled()
  })

  it('asks the browser to keep the offline shell', async () => {
    const persist = vi.fn(async () => true)
    expect(await requestPersistentStorage(bridge({ persist }))).toBe('granted')
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('records a quiet refusal when the browser declines', async () => {
    expect(
      await requestPersistentStorage(bridge({ persist: async () => false })),
    ).toBe('denied')
  })

  it('treats a failed persist call as unsupported', async () => {
    expect(
      await requestPersistentStorage(
        bridge({
          persist: async () => {
            throw new Error('blocked')
          },
        }),
      ),
    ).toBe('unsupported')
  })
})

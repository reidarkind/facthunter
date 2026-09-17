import { describe, expect, it, vi } from 'vitest'
import {
  applyAppUpdate,
  checkForAppUpdate,
  type UpdateBridge,
} from './updates'

function bridge(opts: {
  online: boolean
  waiting?: boolean
  update?: () => Promise<void>
}): UpdateBridge & {
  worker: { postMessage: ReturnType<typeof vi.fn> } | null
} {
  const worker = opts.waiting ? { postMessage: vi.fn() } : null
  return {
    worker,
    isOnline: () => opts.online,
    getRegistration: async () => ({
      waiting: worker,
      update: opts.update ?? (async () => {}),
    }),
  }
}

describe('PWA update check', () => {
  it('does not hit the network when the phone is offline', async () => {
    const update = vi.fn(async () => {})
    const result = await checkForAppUpdate(bridge({ online: false, update }))
    expect(result).toBe('offline')
    expect(update).not.toHaveBeenCalled()
  })

  it('reports current when update finds no waiting worker', async () => {
    expect(await checkForAppUpdate(bridge({ online: true }))).toBe('current')
  })

  it('reports available when a new worker is waiting', async () => {
    expect(
      await checkForAppUpdate(bridge({ online: true, waiting: true })),
    ).toBe('available')
  })

  it('treats a failed update fetch as offline', async () => {
    const result = await checkForAppUpdate(
      bridge({
        online: true,
        update: async () => {
          throw new Error('failed')
        },
      }),
    )
    expect(result).toBe('offline')
  })

  it('tells the waiting worker to skip waiting and reloads', async () => {
    const reload = vi.fn()
    const env = bridge({ online: true, waiting: true })
    await applyAppUpdate(env, { reload })
    expect(env.worker?.postMessage).toHaveBeenCalledWith({
      type: 'SKIP_WAITING',
    })
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

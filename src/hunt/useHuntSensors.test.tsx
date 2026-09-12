import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useHuntSensors } from './useHuntSensors'

type FakeTrack = {
  readyState: string
  stop: () => void
  addEventListener: (type: string, fn: () => void) => void
  removeEventListener: (type: string, fn: () => void) => void
  end: () => void
}

function fakeStream() {
  const ended = new Set<() => void>()
  const track: FakeTrack = {
    readyState: 'live',
    stop: () => {
      track.readyState = 'ended'
    },
    addEventListener: (type, fn) => {
      if (type === 'ended') ended.add(fn)
    },
    removeEventListener: (type, fn) => {
      if (type === 'ended') ended.delete(fn)
    },
    end: () => {
      track.readyState = 'ended'
      ended.forEach((fn) => fn())
    },
  }
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [track],
  } as unknown as MediaStream
  return { stream, endCamera: () => track.end() }
}

function fireHeading() {
  const event = new Event('deviceorientationabsolute')
  Object.assign(event, { alpha: 0, beta: 90, absolute: true })
  window.dispatchEvent(event)
}

function gpsFix(): GeolocationPosition {
  return {
    coords: {
      latitude: 63.43,
      longitude: 10.39,
      accuracy: 8,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as GeolocationPosition
}

let getUserMedia: ReturnType<typeof vi.fn>
let watchPosition: ReturnType<typeof vi.fn>
let clearWatch: ReturnType<typeof vi.fn>
let geoSuccess: PositionCallback | undefined
let geoError: PositionErrorCallback | undefined

beforeEach(() => {
  getUserMedia = vi.fn()
  geoSuccess = undefined
  geoError = undefined
  watchPosition = vi.fn((ok: PositionCallback, err?: PositionErrorCallback) => {
    geoSuccess = ok
    geoError = err
    return 1
  })
  clearWatch = vi.fn()
  Object.defineProperty(window, 'isSecureContext', {
    configurable: true,
    value: true,
  })
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { watchPosition, clearWatch },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function startReady(stream: MediaStream) {
  getUserMedia.mockResolvedValue(stream)
  const hook = renderHook(() => useHuntSensors())
  await act(async () => {
    await hook.result.current.startFromUserGesture()
  })
  act(() => {
    geoSuccess?.(gpsFix())
    fireHeading()
  })
  await waitFor(() => expect(hook.result.current.ready).toBe(true))
  return hook
}

it('drops ready when the camera track ends', async () => {
  const camera = fakeStream()
  const hook = await startReady(camera.stream)

  act(() => {
    camera.endCamera()
  })

  expect(hook.result.current.ready).toBe(false)
  expect(hook.result.current.missing).toContain('kamera')
})

it('clears the last GPS fix when the watch errors', async () => {
  const camera = fakeStream()
  const hook = await startReady(camera.stream)

  act(() => {
    geoError?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
  })

  expect(hook.result.current.coord).toBeNull()
  expect(hook.result.current.ready).toBe(false)
  expect(hook.result.current.missing).toContain('posisjon')
})

it('re-requests the camera when the app becomes visible after the stream died', async () => {
  const first = fakeStream()
  const second = fakeStream()
  getUserMedia.mockResolvedValueOnce(first.stream).mockResolvedValueOnce(second.stream)
  const hook = renderHook(() => useHuntSensors())
  await act(async () => {
    await hook.result.current.startFromUserGesture()
  })
  act(() => {
    geoSuccess?.(gpsFix())
    fireHeading()
  })
  await waitFor(() => expect(hook.result.current.ready).toBe(true))

  act(() => {
    first.endCamera()
  })
  expect(hook.result.current.ready).toBe(false)

  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
  })

  await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(hook.result.current.ready).toBe(true))
})

it('does not request the camera on foreground until Start jakt has been used', async () => {
  getUserMedia.mockResolvedValue(fakeStream().stream)
  renderHook(() => useHuntSensors())
  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(getUserMedia).not.toHaveBeenCalled()
})

it('restarts the GPS watch when the app becomes visible during a hunt', async () => {
  const camera = fakeStream()
  const hook = await startReady(camera.stream)
  expect(watchPosition).toHaveBeenCalledTimes(1)

  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
  })

  expect(clearWatch).toHaveBeenCalled()
  expect(watchPosition).toHaveBeenCalledTimes(2)
  hook.unmount()
})

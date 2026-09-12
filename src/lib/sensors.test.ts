import { describe, expect, it } from 'vitest'
import { isCameraLive, queryPermission, sensorsReady } from './sensors'

describe('isCameraLive', () => {
  it('is false for null', () => {
    expect(isCameraLive(null)).toBe(false)
  })

  it('is false when there are no video tracks', () => {
    expect(isCameraLive({ getVideoTracks: () => [] })).toBe(false)
  })

  it('is false when every video track has ended', () => {
    expect(
      isCameraLive({ getVideoTracks: () => [{ readyState: 'ended' }] }),
    ).toBe(false)
  })

  it('is true when a video track is live', () => {
    expect(
      isCameraLive({ getVideoTracks: () => [{ readyState: 'live' }] }),
    ).toBe(true)
  })
})

describe('sensorsReady', () => {
  const coord = { lat: 63.43, lon: 10.39 }

  it('requires a live camera, a GPS fix, and a heading', () => {
    expect(
      sensorsReady({
        stream: { getVideoTracks: () => [{ readyState: 'live' }] },
        coord,
        headingDeg: 12,
      }),
    ).toBe(true)
  })

  it('is false when the camera track has ended even if a stream object remains', () => {
    expect(
      sensorsReady({
        stream: { getVideoTracks: () => [{ readyState: 'ended' }] },
        coord,
        headingDeg: 12,
      }),
    ).toBe(false)
  })
})

describe('queryPermission', () => {
  it('returns unknown when the Permissions API is missing', async () => {
    expect(await queryPermission('geolocation', undefined)).toBe('unknown')
  })

  it('returns the queried state', async () => {
    expect(
      await queryPermission('geolocation', {
        query: async () => ({ state: 'denied' }) as PermissionStatus,
      }),
    ).toBe('denied')
  })

  it('returns unknown when query throws', async () => {
    expect(
      await queryPermission('camera', {
        query: async () => {
          throw new TypeError('not supported')
        },
      }),
    ).toBe('unknown')
  })
})

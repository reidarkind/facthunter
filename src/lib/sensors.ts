export type CameraStream = {
  getVideoTracks: () => Array<{ readyState: string }>
}

export type PermissionLookup = 'granted' | 'denied' | 'prompt' | 'unknown'

export type PermissionKind = 'geolocation' | 'camera'

export const GEO_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 20_000,
}

export function isCameraLive(stream: CameraStream | null): boolean {
  if (!stream) return false
  return stream.getVideoTracks().some((track) => track.readyState === 'live')
}

export function sensorsReady(input: {
  stream: CameraStream | null
  coord: { lat: number; lon: number } | null
  headingDeg: number | null
}): boolean {
  return (
    isCameraLive(input.stream) &&
    input.coord !== null &&
    input.headingDeg !== null
  )
}

export async function queryPermission(
  name: PermissionKind,
  permissions: Pick<Permissions, 'query'> | undefined,
): Promise<PermissionLookup> {
  if (!permissions?.query) return 'unknown'
  try {
    const status = await permissions.query({ name } as PermissionDescriptor)
    const state = status.state
    if (state === 'granted' || state === 'denied' || state === 'prompt') {
      return state
    }
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

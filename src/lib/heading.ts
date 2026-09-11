import { headingFromEvent, smoothHeading } from './geo'

type DeviceOrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>
}

export function requestOrientationPermission(): Promise<string> | null {
  if (typeof DeviceOrientationEvent === 'undefined') return null
  const doe = DeviceOrientationEvent as DeviceOrientationWithPermission
  if (typeof doe.requestPermission !== 'function') return null
  return doe.requestPermission()
}

function screenAngle(): number {
  return window.screen.orientation?.angle ?? 0
}

export function attachHeadingListener(
  onHeading: (deg: number) => void,
  onPitch?: (deg: number) => void,
): () => void {
  let prev: number | null = null
  const onOrient = (event: DeviceOrientationEvent) => {
    const preferAbsolute = event.type === 'deviceorientationabsolute'
    const heading = headingFromEvent(
      event as {
        webkitCompassHeading?: number | null
        alpha?: number | null
        absolute?: boolean
      },
      screenAngle(),
      preferAbsolute,
    )
    if (heading !== null) {
      prev = smoothHeading(prev, heading)
      onHeading(prev)
    }
    if (
      onPitch &&
      typeof event.beta === 'number' &&
      Number.isFinite(event.beta)
    ) {
      onPitch(event.beta)
    }
  }
  window.addEventListener('deviceorientationabsolute', onOrient)
  window.addEventListener('deviceorientation', onOrient)
  return () => {
    window.removeEventListener('deviceorientationabsolute', onOrient)
    window.removeEventListener('deviceorientation', onOrient)
  }
}

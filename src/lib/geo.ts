import {
  FOV_HALF_DEG,
  UNLOCK_ACCURACY_M,
  UNLOCK_RADIUS_M,
  VISIBLE_RADIUS_M,
} from './constants'

export type Coord = { lat: number; lon: number }

const EARTH_RADIUS_M = 6371000

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mod360(value: number): number {
  return ((value % 360) + 360) % 360
}

export function distanceMeters(a: Coord, b: Coord): number {
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const dLat = lat2 - lat1
  const dLon = toRadians(b.lon - a.lon)

  const sinHalfDLat = Math.sin(dLat / 2)
  const sinHalfDLon = Math.sin(dLon / 2)
  const h =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLon * sinHalfDLon

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function bearingDegrees(from: Coord, to: Coord): number {
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const dLon = toRadians(to.lon - from.lon)

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  return mod360(toDegrees(Math.atan2(y, x)))
}

export function headingDiffDegrees(heading: number, bearing: number): number {
  return mod360(bearing - heading + 180) - 180
}

/** CSS rotate is clockwise. The rose must turn the other way so N stays on north. */
export function compassRoseRotationDeg(headingDeg: number): number {
  return -headingDeg || 0
}

export function isVisible(distanceM: number): boolean {
  return distanceM <= VISIBLE_RADIUS_M
}

export function isUnlockable(distanceM: number, accuracyM: number): boolean {
  return distanceM <= UNLOCK_RADIUS_M && accuracyM <= UNLOCK_ACCURACY_M
}

export function inFieldOfView(heading: number, bearing: number): boolean {
  return Math.abs(headingDiffDegrees(heading, bearing)) <= FOV_HALF_DEG
}

export function headingFromEvent(
  event: {
    webkitCompassHeading?: number | null
    alpha?: number | null
    absolute?: boolean
  },
  screenAngleDeg: number,
  preferAbsolute: boolean,
): number | null {
  const { webkitCompassHeading, alpha, absolute } = event

  if (
    typeof webkitCompassHeading === 'number' &&
    Number.isFinite(webkitCompassHeading)
  ) {
    return mod360(webkitCompassHeading + screenAngleDeg)
  }

  if ((preferAbsolute || absolute) && typeof alpha === 'number' && Number.isFinite(alpha)) {
    return mod360(360 - alpha + screenAngleDeg)
  }

  return null
}

export function arLayout(input: {
  headingDeg: number
  bearingDeg: number
  pitchDeg: number
  distanceM: number
}): { xPct: number; yPct: number; scale: number } | null {
  const { headingDeg, bearingDeg, pitchDeg, distanceM } = input

  if (!inFieldOfView(headingDeg, bearingDeg)) {
    return null
  }

  const xPct =
    50 + (headingDiffDegrees(headingDeg, bearingDeg) / FOV_HALF_DEG) * 50
  const t = clamp(distanceM / VISIBLE_RADIUS_M, 0, 1)
  const yPct = clamp(52 + (90 - pitchDeg) * 0.35 + t * 16, 18, 82)
  const scale = 1.2 - t * 0.55

  return { xPct, yPct, scale }
}

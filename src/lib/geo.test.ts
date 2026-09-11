import { describe, expect, it } from 'vitest'
import {
  arLayout,
  bearingDegrees,
  distanceMeters,
  headingDiffDegrees,
  headingFromEvent,
  inFieldOfView,
  isUnlockable,
  isVisible,
} from './geo'

describe('distanceMeters', () => {
  it('is ~0 for the same point', () => {
    const p = { lat: 63.4305, lon: 10.3951 }
    expect(distanceMeters(p, p)).toBeLessThan(1)
  })

  it('is ~111 m for 0.001 deg latitude', () => {
    const a = { lat: 63.43, lon: 10.39 }
    const b = { lat: 63.431, lon: 10.39 }
    expect(distanceMeters(a, b)).toBeGreaterThan(100)
    expect(distanceMeters(a, b)).toBeLessThan(120)
  })
})

describe('bearing and FOV', () => {
  it('bearing north is ~0', () => {
    const from = { lat: 63.43, lon: 10.39 }
    const to = { lat: 63.44, lon: 10.39 }
    const b = bearingDegrees(from, to)
    expect((b + 360) % 360).toBeLessThan(5)
  })

  it('headingDiff wraps across 359/1', () => {
    expect(headingDiffDegrees(359, 1)).toBeCloseTo(2, 5)
    expect(headingDiffDegrees(1, 359)).toBeCloseTo(-2, 5)
  })

  it('headingDiff normalizes angles beyond one revolution', () => {
    expect(headingDiffDegrees(720, 0)).toBe(0)
    expect(headingDiffDegrees(0, 720)).toBe(0)
    expect(headingDiffDegrees(1080, 360)).toBe(0)
  })

  it('FOV is ±30 degrees', () => {
    expect(inFieldOfView(0, 30)).toBe(true)
    expect(inFieldOfView(0, 31)).toBe(false)
  })
})

describe('visibility and unlock', () => {
  it('visible at 500 m, not at 501', () => {
    expect(isVisible(500)).toBe(true)
    expect(isVisible(501)).toBe(false)
  })

  it('unlock only within 50 m and accuracy 50 m', () => {
    expect(isUnlockable(50, 50)).toBe(true)
    expect(isUnlockable(51, 10)).toBe(false)
    expect(isUnlockable(10, 51)).toBe(false)
  })
})

describe('headingFromEvent', () => {
  it('prefers webkitCompassHeading', () => {
    expect(
      headingFromEvent({ webkitCompassHeading: 42, alpha: 10 }, 0, false),
    ).toBe(42)
  })

  it('uses 360-alpha for absolute events', () => {
    expect(
      headingFromEvent({ alpha: 90, absolute: true }, 0, true),
    ).toBe(270)
  })

  it('returns null without data', () => {
    expect(headingFromEvent({ alpha: null }, 0, true)).toBeNull()
  })
})

describe('arLayout', () => {
  it('returns null outside FOV', () => {
    expect(
      arLayout({ headingDeg: 0, bearingDeg: 40, pitchDeg: 90, distanceM: 40 }),
    ).toBeNull()
  })

  it('centers a target straight ahead', () => {
    const p = arLayout({
      headingDeg: 0,
      bearingDeg: 0,
      pitchDeg: 90,
      distanceM: 40,
    })
    expect(p).not.toBeNull()
    expect(p!.xPct).toBeCloseTo(50, 0)
    expect(p!.scale).toBeGreaterThan(0.8)
  })

  it('places a right-hand target to the right', () => {
    const p = arLayout({
      headingDeg: 0,
      bearingDeg: 20,
      pitchDeg: 90,
      distanceM: 100,
    })
    expect(p!.xPct).toBeGreaterThan(50)
  })
})

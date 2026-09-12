import { describe, expect, it } from 'vitest'
import {
  arLayout,
  bearingDegrees,
  compassRoseRotationDeg,
  destinationCoord,
  distanceMeters,
  fovWedgeCoords,
  headingDiffDegrees,
  headingFromEvent,
  inFieldOfView,
  isUnlockable,
  isVisible,
  movedAtLeast,
  signZIndex,
  smoothHeading,
  stackNearestLast,
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

describe('compassRoseRotationDeg', () => {
  it('keeps N/S the same and flips the E/W sign for CSS clockwise rotate', () => {
    expect(compassRoseRotationDeg(0)).toBe(0)
    expect(compassRoseRotationDeg(180)).toBe(-180)
    expect(compassRoseRotationDeg(90)).toBe(-90)
    expect(compassRoseRotationDeg(270)).toBe(-270)
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

describe('destinationCoord', () => {
  const origin = { lat: 63.43, lon: 10.39 }

  it('moves ~111 m north by about 0.001 deg latitude', () => {
    const north = destinationCoord(origin, 0, 111)
    expect(north.lat - origin.lat).toBeCloseTo(0.001, 3)
    expect(north.lon).toBeCloseTo(origin.lon, 4)
    expect(distanceMeters(origin, north)).toBeCloseTo(111, 0)
  })

  it('moves east with a bearing of 90', () => {
    const east = destinationCoord(origin, 90, 200)
    expect(east.lon).toBeGreaterThan(origin.lon)
    expect(east.lat).toBeCloseTo(origin.lat, 3)
    expect(distanceMeters(origin, east)).toBeCloseTo(200, 0)
  })
})

describe('fovWedgeCoords', () => {
  const origin = { lat: 63.43, lon: 10.39 }

  it('starts and ends at the origin', () => {
    const wedge = fovWedgeCoords(origin, 0, 30, 500)
    expect(wedge[0]).toEqual(origin)
    expect(wedge[wedge.length - 1]).toEqual(origin)
    expect(wedge.length).toBeGreaterThan(4)
  })

  it('points the arc north when heading is 0', () => {
    const wedge = fovWedgeCoords(origin, 0, 30, 500)
    const mid = wedge[Math.floor(wedge.length / 2)]
    expect(mid.lat).toBeGreaterThan(origin.lat)
    expect(mid.lon).toBeCloseTo(origin.lon, 3)
    expect(distanceMeters(origin, mid)).toBeCloseTo(500, 0)
  })

  it('points the arc east when heading is 90', () => {
    const wedge = fovWedgeCoords(origin, 90, 30, 500)
    const mid = wedge[Math.floor(wedge.length / 2)]
    expect(mid.lon).toBeGreaterThan(origin.lon)
    expect(bearingDegrees(origin, mid)).toBeCloseTo(90, 0)
  })
})

describe('movedAtLeast', () => {
  it('is true without a previous coordinate', () => {
    expect(movedAtLeast(null, { lat: 63.43, lon: 10.39 }, 40)).toBe(true)
  })

  it('is true after moving 40 m', () => {
    const previous = { lat: 0, lon: 0 }
    const fortyNorth = { lat: 40 / 6371000 / (Math.PI / 180), lon: 0 }
    expect(movedAtLeast(previous, fortyNorth, 40)).toBe(true)
  })

  it('is false after a few meters', () => {
    expect(
      movedAtLeast(
        { lat: 63.43, lon: 10.39 },
        { lat: 63.43001, lon: 10.39 },
        40,
      ),
    ).toBe(false)
  })
})

describe('smoothHeading', () => {
  it('returns the next heading when there is no previous', () => {
    expect(smoothHeading(null, 90)).toBe(90)
  })

  it('moves a fraction of the shortest turn, including wraparound', () => {
    expect(smoothHeading(350, 10)).toBeCloseTo(355.6, 1)
  })
})

describe('signZIndex', () => {
  it('puts a nearer sign above a farther one', () => {
    expect(signZIndex(40)).toBeGreaterThan(signZIndex(200))
    expect(signZIndex(0)).toBeGreaterThan(signZIndex(500))
  })
})

describe('stackNearestLast', () => {
  it('paints farther signs first so the nearest stays in front', () => {
    const stacked = stackNearestLast([
      { id: 'near', distanceM: 40 },
      { id: 'far', distanceM: 200 },
      { id: 'mid', distanceM: 90 },
    ])
    expect(stacked.map((sign) => sign.id)).toEqual(['far', 'mid', 'near'])
  })
})

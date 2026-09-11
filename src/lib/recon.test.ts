import { describe, expect, it } from 'vitest'
import { UNLOCK_RADIUS_M } from './constants'
import { destinationCoord, distanceMeters } from './geo'
import { blipsForRecon } from './recon'

describe('blipsForRecon', () => {
  const origin = { lat: 63.43, lon: 10.39 }

  it('drops places outside the radius', () => {
    const far = { lat: 63.45, lon: 10.39 }
    expect(blipsForRecon([far], origin, 2000, 80)).toEqual([])
  })

  it('keeps a place within the radius as one blip', () => {
    const near = { lat: 63.431, lon: 10.39 }
    const blips = blipsForRecon([near], origin, 2000, 80)
    expect(blips).toHaveLength(1)
    expect(blips[0].count).toBe(1)
    expect(blips[0].lat).toBeCloseTo(near.lat)
    expect(blips[0].lon).toBeCloseTo(near.lon)
  })

  it('clusters two nearby places into one blip', () => {
    const a = { lat: 63.431, lon: 10.39 }
    const b = { lat: 63.43105, lon: 10.39 }
    const blips = blipsForRecon([a, b], origin, 2000, 80)
    expect(blips).toHaveLength(1)
    expect(blips[0].count).toBe(2)
  })

  it('keeps well-separated places as distinct blips', () => {
    const a = { lat: 63.431, lon: 10.39 }
    const b = { lat: 63.438, lon: 10.39 }
    const blips = blipsForRecon([a, b], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    expect(blips.map((blip) => blip.count)).toEqual([1, 1])
  })

  it('never clusters places within unlock range of the hunter', () => {
    const closeA = destinationCoord(origin, 0, 20)
    const closeB = destinationCoord(origin, 90, 20)
    expect(distanceMeters(origin, closeA)).toBeLessThan(UNLOCK_RADIUS_M)
    expect(distanceMeters(origin, closeB)).toBeLessThan(UNLOCK_RADIUS_M)
    expect(distanceMeters(closeA, closeB)).toBeLessThan(80)

    const blips = blipsForRecon([closeA, closeB], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    expect(blips.map((blip) => blip.count)).toEqual([1, 1])
  })

  it('does not fold an unlock-range place into a farther cluster', () => {
    const close = destinationCoord(origin, 0, 30)
    const farther = destinationCoord(origin, 0, 90)
    expect(distanceMeters(close, farther)).toBeLessThan(80)

    const blips = blipsForRecon([close, farther], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    const closeBlip = blips.find(
      (blip) => blip.count === 1 && blip.lat === close.lat,
    )
    expect(closeBlip).toBeDefined()
  })
})

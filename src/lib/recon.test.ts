import { describe, expect, it } from 'vitest'
import {
  RECON_BLIP_CLUSTER_PX,
  RECON_CLUSTER_M,
  VISIBLE_RADIUS_M,
} from './constants'
import { destinationCoord, distanceMeters } from './geo'
import { blipsForRecon, reconBlipLook, reconClusterMeters } from './recon'

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

  it('clusters two nearby places outside hunt range into one blip', () => {
    const a = destinationCoord(origin, 0, 700)
    const b = destinationCoord(origin, 0, 705)
    expect(distanceMeters(origin, a)).toBeGreaterThan(VISIBLE_RADIUS_M)
    const blips = blipsForRecon([a, b], origin, 2000, 80)
    expect(blips).toHaveLength(1)
    expect(blips[0].count).toBe(2)
  })

  it('keeps nearby places inside the hunt ring as separate blips', () => {
    const a = destinationCoord(origin, 0, 200)
    const b = destinationCoord(origin, 0, 210)
    expect(distanceMeters(origin, a)).toBeLessThan(VISIBLE_RADIUS_M)
    expect(distanceMeters(a, b)).toBeLessThan(80)
    const blips = blipsForRecon([a, b], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    expect(blips.map((blip) => blip.count)).toEqual([1, 1])
  })

  it('keeps well-separated places as distinct blips', () => {
    const a = { lat: 63.431, lon: 10.39 }
    const b = { lat: 63.438, lon: 10.39 }
    const blips = blipsForRecon([a, b], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    expect(blips.map((blip) => blip.count)).toEqual([1, 1])
  })

  it('does not fold a hunt-range place into a farther cluster', () => {
    const inside = destinationCoord(origin, 0, 480)
    const outside = destinationCoord(origin, 0, 540)
    expect(distanceMeters(origin, inside)).toBeLessThan(VISIBLE_RADIUS_M)
    expect(distanceMeters(origin, outside)).toBeGreaterThan(VISIBLE_RADIUS_M)
    expect(distanceMeters(inside, outside)).toBeLessThan(80)

    const blips = blipsForRecon([inside, outside], origin, 2000, 80)
    expect(blips).toHaveLength(2)
    const insideBlip = blips.find(
      (blip) => blip.count === 1 && blip.lat === inside.lat,
    )
    expect(insideBlip).toBeDefined()
  })
})

describe('reconClusterMeters', () => {
  it('never goes below the constant floor', () => {
    expect(reconClusterMeters(1)).toBe(RECON_CLUSTER_M)
  })

  it('widens clustering when one map pixel covers more ground than a blip', () => {
    expect(reconClusterMeters(12)).toBeGreaterThan(RECON_CLUSTER_M)
    expect(reconClusterMeters(12)).toBe(12 * RECON_BLIP_CLUSTER_PX)
  })

  it('merges farther places that overlap at recon map scale', () => {
    const origin = { lat: 63.43, lon: 10.39 }
    const a = destinationCoord(origin, 0, 700)
    const b = destinationCoord(origin, 0, 820)
    expect(distanceMeters(origin, a)).toBeGreaterThan(VISIBLE_RADIUS_M)
    expect(distanceMeters(a, b)).toBeGreaterThan(RECON_CLUSTER_M)
    expect(distanceMeters(a, b)).toBeLessThan(reconClusterMeters(12))
    const blips = blipsForRecon([a, b], origin, 2000, reconClusterMeters(12))
    expect(blips).toHaveLength(1)
    expect(blips[0].count).toBe(2)
  })
})

describe('reconBlipLook', () => {
  it('keeps a single place as an unlabeled gold dot', () => {
    const look = reconBlipLook(1)
    expect(look.label).toBeNull()
    expect(look.radiusPx).toBe(6)
    expect(look.fillOpacity).toBeGreaterThan(0.8)
  })

  it('uses one modest cluster size no matter how many places it holds', () => {
    const small = reconBlipLook(2)
    const large = reconBlipLook(40)
    expect(small.label).toBe('2')
    expect(large.label).toBe('40')
    expect(small.radiusPx).toBe(large.radiusPx)
    expect(small.radiusPx).toBeGreaterThan(reconBlipLook(1).radiusPx)
    expect(small.color).not.toBe(reconBlipLook(1).color)
    expect(small.fillOpacity).toBeLessThan(reconBlipLook(1).fillOpacity)
  })

  it('widens only when the count needs three digits', () => {
    expect(reconBlipLook(101).radiusPx).toBeGreaterThan(reconBlipLook(2).radiusPx)
  })
})

import {
  RECON_BLIP_CLUSTER_PX,
  RECON_CLUSTER_M,
  UNLOCK_RADIUS_M,
} from './constants'
import { distanceMeters, type Coord } from './geo'

export type ReconBlip = { lat: number; lon: number; count: number }

export type ReconBlipLook = { radiusPx: number; label: string | null }

export function reconClusterMeters(metersPerPixel: number): number {
  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
    return RECON_CLUSTER_M
  }
  return Math.max(RECON_CLUSTER_M, metersPerPixel * RECON_BLIP_CLUSTER_PX)
}

export function reconBlipLook(count: number): ReconBlipLook {
  if (count <= 1) return { radiusPx: 6, label: null }
  return {
    radiusPx: 10 + Math.min(count, 8) * 2,
    label: String(count),
  }
}

function clusterPlaces(places: Coord[], clusterM: number): ReconBlip[] {
  const clusters: { members: Coord[] }[] = []

  for (const place of places) {
    const host = clusters.find((cluster) =>
      cluster.members.some(
        (member) => distanceMeters(member, place) <= clusterM,
      ),
    )
    if (host) host.members.push(place)
    else clusters.push({ members: [place] })
  }

  return clusters.map((cluster) => ({
    lat:
      cluster.members.reduce((sum, member) => sum + member.lat, 0) /
      cluster.members.length,
    lon:
      cluster.members.reduce((sum, member) => sum + member.lon, 0) /
      cluster.members.length,
    count: cluster.members.length,
  }))
}

export function blipsForRecon(
  places: Coord[],
  origin: Coord,
  radiusM: number,
  clusterM: number,
  keepSeparateWithinM: number = UNLOCK_RADIUS_M,
): ReconBlip[] {
  const inRange = places.filter(
    (place) => distanceMeters(origin, place) <= radiusM,
  )
  const close = inRange.filter(
    (place) => distanceMeters(origin, place) <= keepSeparateWithinM,
  )
  const farther = inRange.filter(
    (place) => distanceMeters(origin, place) > keepSeparateWithinM,
  )

  return [
    ...close.map((place) => ({ lat: place.lat, lon: place.lon, count: 1 })),
    ...clusterPlaces(farther, clusterM),
  ]
}

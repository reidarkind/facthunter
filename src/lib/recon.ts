import {
  RECON_BLIP_CLUSTER_PX,
  RECON_BLIP_COLOR,
  RECON_BLIP_RADIUS_PX,
  RECON_CLUSTER_COLOR,
  RECON_CLUSTER_FILL_OPACITY,
  RECON_CLUSTER_M,
  RECON_CLUSTER_RADIUS_PX,
  RECON_CLUSTER_RADIUS_WIDE_PX,
  VISIBLE_RADIUS_M,
} from './constants'
import { distanceMeters, type Coord } from './geo'

export type ReconBlip = { lat: number; lon: number; count: number }

export type ReconBlipLook = {
  radiusPx: number
  label: string | null
  color: string
  fillOpacity: number
}

export function reconClusterMeters(metersPerPixel: number): number {
  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
    return RECON_CLUSTER_M
  }
  return Math.max(RECON_CLUSTER_M, metersPerPixel * RECON_BLIP_CLUSTER_PX)
}

export function reconBlipLook(count: number): ReconBlipLook {
  if (count <= 1) {
    return {
      radiusPx: RECON_BLIP_RADIUS_PX,
      label: null,
      color: RECON_BLIP_COLOR,
      fillOpacity: 0.9,
    }
  }
  return {
    radiusPx:
      count > 100 ? RECON_CLUSTER_RADIUS_WIDE_PX : RECON_CLUSTER_RADIUS_PX,
    label: String(count),
    color: RECON_CLUSTER_COLOR,
    fillOpacity: RECON_CLUSTER_FILL_OPACITY,
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
  keepSeparateWithinM: number = VISIBLE_RADIUS_M,
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

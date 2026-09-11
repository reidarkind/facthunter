import { UNLOCK_RADIUS_M } from './constants'
import { distanceMeters, type Coord } from './geo'

export type ReconBlip = { lat: number; lon: number; count: number }

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

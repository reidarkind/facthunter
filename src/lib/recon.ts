import { distanceMeters, type Coord } from './geo'

export type ReconBlip = { lat: number; lon: number; count: number }

export function blipsForRecon(
  places: Coord[],
  origin: Coord,
  radiusM: number,
  clusterM: number,
): ReconBlip[] {
  const nearby = places.filter(
    (place) => distanceMeters(origin, place) <= radiusM,
  )
  const clusters: { members: Coord[] }[] = []

  for (const place of nearby) {
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

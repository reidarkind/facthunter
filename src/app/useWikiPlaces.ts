import { useEffect, useRef, useState } from 'react'
import type { Coord } from '../lib/geo'
import { fetchNearbyPlaces, shouldStartWikiFetch } from '../lib/wikipedia'
import type { NearbyPlace } from '../types'
import { usePrefs } from './usePrefs'

export function useWikiPlaces(
  coord: Coord | null,
  radiusM: number,
  enabled: boolean,
) {
  const { wikiLimit, wikiSources } = usePrefs()
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)
  const lastFetchAt = useRef<Coord | null>(null)
  const fetching = useRef(false)
  const session = useRef(0)
  const coordRef = useRef(coord)
  const wikiLimitRef = useRef(wikiLimit)
  const wikiSourcesRef = useRef(wikiSources)
  const radiusRef = useRef(radiusM)

  useEffect(() => {
    coordRef.current = coord
  }, [coord])

  useEffect(() => {
    wikiLimitRef.current = wikiLimit
    wikiSourcesRef.current = wikiSources
    radiusRef.current = radiusM
  }, [wikiLimit, wikiSources, radiusM])

  useEffect(() => {
    lastFetchAt.current = null
    fetching.current = false
    session.current += 1
  }, [enabled, radiusM, wikiLimit, wikiSources])

  useEffect(() => {
    if (!enabled || !coord) return
    if (!shouldStartWikiFetch(lastFetchAt.current, fetching.current, coord)) {
      return
    }

    const mySession = session.current
    fetching.current = true
    setLoading(true)
    setFetchFailed(false)

    function start(fetchedAt: Coord) {
      void fetchNearbyPlaces(
        fetchedAt,
        fetch,
        radiusRef.current,
        wikiLimitRef.current,
        wikiSourcesRef.current,
      )
        .then((next) => {
          if (mySession !== session.current) return
          lastFetchAt.current = fetchedAt
          setPlaces(next)
        })
        .catch(() => {
          if (mySession !== session.current) return
          setFetchFailed(true)
        })
        .finally(() => {
          if (mySession !== session.current) return
          fetching.current = false
          setLoading(false)
          const latest = coordRef.current
          if (
            latest &&
            shouldStartWikiFetch(lastFetchAt.current, false, latest)
          ) {
            fetching.current = true
            setLoading(true)
            setFetchFailed(false)
            start(latest)
          }
        })
    }

    start(coord)
  }, [enabled, coord, radiusM, wikiLimit, wikiSources])

  return { places, loading, fetchFailed }
}

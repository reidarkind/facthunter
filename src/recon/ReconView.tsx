import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  RECON_CLUSTER_M,
  RECON_RADIUS_M,
  VISIBLE_RADIUS_M,
} from '../lib/constants'
import type { Coord } from '../lib/geo'
import { blipsForRecon } from '../lib/recon'
import { fetchNearbyPlaces, shouldRefetch } from '../lib/wikipedia'
import type { NearbyPlace } from '../types'

const LOCKED_MAP: L.MapOptions = {
  zoomControl: false,
  attributionControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  touchZoom: false,
}

function startWatch(onFix: (coord: Coord) => void, onError: () => void): number {
  return navigator.geolocation.watchPosition(
    (pos) => {
      onFix({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    },
    onError,
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
  )
}

export function ReconView() {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const overlayRef = useRef<L.LayerGroup | null>(null)
  const [coord, setCoord] = useState<Coord | null>(null)
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [gpsError, setGpsError] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const watchId = useRef<number | null>(null)
  const lastFetchAt = useRef<Coord | null>(null)

  function start() {
    setGpsError(false)
    if (!navigator.geolocation) {
      setGpsError(true)
      return
    }
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
    }
    watchId.current = startWatch(setCoord, () => setGpsError(true))
  }

  useEffect(() => () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
    }
    mapRef.current?.remove()
    mapRef.current = null
  }, [])

  useEffect(() => {
    const el = mapEl.current
    if (!el || !coord) return
    if (!mapRef.current) {
      const map = L.map(el, LOCKED_MAP)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)
      overlayRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
    }
    const map = mapRef.current
    const bounds = L.latLng(coord.lat, coord.lon).toBounds(RECON_RADIUS_M * 2)
    map.fitBounds(bounds, { animate: false, padding: [12, 12] })
    map.invalidateSize()
  }, [coord])

  useEffect(() => {
    if (!coord) return
    if (!shouldRefetch(lastFetchAt.current, coord)) return
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    void fetchNearbyPlaces(coord, fetch, RECON_RADIUS_M)
      .then((next) => {
        if (cancelled) return
        lastFetchAt.current = coord
        setPlaces(next)
      })
      .catch(() => {
        if (!cancelled) setFetchError('Kunne ikke speide Wikipedia')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [coord])

  useEffect(() => {
    const map = mapRef.current
    const overlay = overlayRef.current
    if (!map || !overlay || !coord) return
    overlay.clearLayers()
    L.circle([coord.lat, coord.lon], {
      radius: VISIBLE_RADIUS_M,
      color: '#c9a227',
      weight: 1,
      dashArray: '4 6',
      fill: false,
      opacity: 0.7,
      interactive: false,
    }).addTo(overlay)
    L.circleMarker([coord.lat, coord.lon], {
      radius: 7,
      color: '#f3ead7',
      fillColor: '#0f4c4a',
      fillOpacity: 1,
      weight: 2,
      interactive: false,
    }).addTo(overlay)
    for (const blip of blipsForRecon(
      places,
      coord,
      RECON_RADIUS_M,
      RECON_CLUSTER_M,
    )) {
      L.circleMarker([blip.lat, blip.lon], {
        radius: 5 + Math.min(blip.count, 5) * 2,
        color: '#c9a227',
        fillColor: '#c9a227',
        fillOpacity: 0.9,
        weight: 0,
        interactive: false,
      }).addTo(overlay)
    }
  }, [coord, places])

  const blipCount = coord
    ? blipsForRecon(places, coord, RECON_RADIUS_M, RECON_CLUSTER_M).length
    : 0

  return (
    <section className="recon">
      <div ref={mapEl} className="recon-map" />
      <div className="recon-vignette" aria-hidden="true" />
      <div className="recon-hud">
        {!coord ? (
          <>
            <h1>Rekognoser</h1>
            <p>
              Speid 2 km rundt deg. Prikkene viser at noe er der — ikke hva.
              Gå mot dem, og bytt til Jakt når du er innen 500 m.
            </p>
            {gpsError ? (
              <p className="banner warn">Posisjon mangler eller ble avslått</p>
            ) : null}
            <button type="button" className="primary" onClick={start}>
              Start rekognosering
            </button>
          </>
        ) : (
          <>
            <p className="recon-title">Rekognoser · 2 km</p>
            {fetchError ? <p className="banner warn">{fetchError}</p> : null}
            {!loading && !fetchError && blipCount === 0 ? (
              <p>Ingen spor i 2 km. Gå et annet sted.</p>
            ) : null}
            {!loading && blipCount > 0 ? (
              <p>Noe er i nærheten. Bytt til Jakt innen den stiplede ringen.</p>
            ) : null}
            <p className="recon-copy">Kart: OpenStreetMap</p>
          </>
        )}
      </div>
    </section>
  )
}

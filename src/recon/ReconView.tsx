import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useT } from '../i18n/useT'
import {
  FOV_HALF_DEG,
  RECON_CLUSTER_M,
  RECON_RADIUS_M,
  RECON_RECENTER_M,
  VISIBLE_RADIUS_M,
} from '../lib/constants'
import {
  fovWedgeCoords,
  movedAtLeast,
  type Coord,
} from '../lib/geo'
import {
  attachHeadingListener,
  requestOrientationPermission,
} from '../lib/heading'
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

const WEDGE_STYLE: L.PathOptions = {
  color: '#c9a227',
  weight: 1,
  fillColor: '#c9a227',
  fillOpacity: 0.28,
  opacity: 0.85,
  interactive: false,
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

function toLatLngs(coords: Coord[]): L.LatLngExpression[] {
  return coords.map((coord) => [coord.lat, coord.lon])
}

export function ReconView() {
  const { t } = useT()
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const blipLayerRef = useRef<L.LayerGroup | null>(null)
  const ringRef = useRef<L.Circle | null>(null)
  const youRef = useRef<L.CircleMarker | null>(null)
  const wedgeRef = useRef<L.Polygon | null>(null)
  const coordRef = useRef<Coord | null>(null)
  const headingRef = useRef<number | null>(null)
  const lastFitAt = useRef<Coord | null>(null)
  const [coord, setCoord] = useState<Coord | null>(null)
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [gpsError, setGpsError] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const watchId = useRef<number | null>(null)
  const stopHeading = useRef<(() => void) | null>(null)
  const lastFetchAt = useRef<Coord | null>(null)

  function paintWedge() {
    const map = mapRef.current
    const origin = coordRef.current
    const heading = headingRef.current
    if (!map || !origin || heading === null) {
      wedgeRef.current?.remove()
      wedgeRef.current = null
      return
    }
    const latlngs = toLatLngs(
      fovWedgeCoords(origin, heading, FOV_HALF_DEG, VISIBLE_RADIUS_M),
    )
    if (wedgeRef.current) {
      wedgeRef.current.setLatLngs(latlngs)
    } else {
      wedgeRef.current = L.polygon(latlngs, WEDGE_STYLE).addTo(map)
    }
    youRef.current?.bringToFront()
  }

  function start() {
    const orientationPermission = requestOrientationPermission()
    setGpsError(false)
    stopHeading.current?.()
    stopHeading.current = attachHeadingListener((deg) => {
      headingRef.current = deg
      paintWedge()
    })
    if (orientationPermission) {
      void orientationPermission.catch(() => {
        /* map still works without a heading wedge */
      })
    }
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
    stopHeading.current?.()
    mapRef.current?.remove()
    mapRef.current = null
  }, [])

  useEffect(() => {
    const el = mapEl.current
    if (!el || !coord) return
    coordRef.current = coord
    if (!mapRef.current) {
      const map = L.map(el, LOCKED_MAP)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)
      blipLayerRef.current = L.layerGroup().addTo(map)
      ringRef.current = L.circle([coord.lat, coord.lon], {
        radius: VISIBLE_RADIUS_M,
        color: '#c9a227',
        weight: 1,
        dashArray: '4 6',
        fill: false,
        opacity: 0.7,
        interactive: false,
      }).addTo(map)
      youRef.current = L.circleMarker([coord.lat, coord.lon], {
        radius: 7,
        color: '#f3ead7',
        fillColor: '#0f4c4a',
        fillOpacity: 1,
        weight: 2,
        interactive: false,
      }).addTo(map)
      mapRef.current = map
    } else {
      ringRef.current?.setLatLng([coord.lat, coord.lon])
      youRef.current?.setLatLng([coord.lat, coord.lon])
    }
    const map = mapRef.current
    if (movedAtLeast(lastFitAt.current, coord, RECON_RECENTER_M)) {
      const bounds = L.latLng(coord.lat, coord.lon).toBounds(RECON_RADIUS_M * 2)
      map.fitBounds(bounds, { animate: false, padding: [12, 12] })
      map.invalidateSize()
      lastFitAt.current = coord
    }
    paintWedge()
  }, [coord])

  useEffect(() => {
    if (!coord) return
    if (!shouldRefetch(lastFetchAt.current, coord)) return
    let cancelled = false
    setLoading(true)
    setFetchFailed(false)
    void fetchNearbyPlaces(coord, fetch, RECON_RADIUS_M)
      .then((next) => {
        if (cancelled) return
        lastFetchAt.current = coord
        setPlaces(next)
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [coord])

  useEffect(() => {
    const overlay = blipLayerRef.current
    if (!overlay || !coord) return
    overlay.clearLayers()
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
    ringRef.current?.bringToFront()
    wedgeRef.current?.bringToFront()
    youRef.current?.bringToFront()
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
            <h1>{t('reconTitle')}</h1>
            <p>{t('reconIntro')}</p>
            {gpsError ? (
              <p className="banner warn">{t('missingLocation')}</p>
            ) : null}
            <button type="button" className="primary" onClick={start}>
              {t('startRecon')}
            </button>
          </>
        ) : (
          <>
            <p className="recon-title">{t('reconLiveTitle')}</p>
            {fetchFailed ? (
              <p className="banner warn">{t('reconWikiFailed')}</p>
            ) : null}
            {!loading && !fetchFailed && blipCount === 0 ? (
              <p>{t('reconEmpty')}</p>
            ) : null}
            {!loading && blipCount > 0 ? <p>{t('reconHint')}</p> : null}
            <p className="recon-copy">{t('reconOsm')}</p>
          </>
        )}
      </div>
    </section>
  )
}

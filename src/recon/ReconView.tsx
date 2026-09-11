import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePrefs } from '../app/usePrefs'
import { useT } from '../i18n/useT'
import {
  FOV_HALF_DEG,
  RECON_BEAM_COLOR,
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
import {
  blipsForRecon,
  reconBlipLook,
  reconClusterMeters,
} from '../lib/recon'
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

const BLIP_PANE = 'recon-blips'
const USER_PANE = 'recon-user'

const WEDGE_STYLE: L.PathOptions = {
  pane: USER_PANE,
  color: RECON_BEAM_COLOR,
  weight: 2,
  fillColor: RECON_BEAM_COLOR,
  fillOpacity: 0.32,
  opacity: 0.95,
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

function clusterMetersOnMap(map: L.Map, origin: Coord): number {
  const size = map.getSize()
  if (size.x < 80 || size.y < 80) return RECON_CLUSTER_M
  const p0 = map.latLngToContainerPoint([origin.lat, origin.lon])
  const metersPerPixel = map.distance(
    map.containerPointToLatLng(p0),
    map.containerPointToLatLng(L.point(p0.x + 1, p0.y)),
  )
  return reconClusterMeters(metersPerPixel)
}

export function ReconView() {
  const { t } = useT()
  const { wikiLimit, wikiSources } = usePrefs()
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
    wedgeRef.current.bringToFront()
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
      map.createPane(BLIP_PANE)
      map.getPane(BLIP_PANE)!.style.zIndex = '450'
      map.createPane(USER_PANE)
      map.getPane(USER_PANE)!.style.zIndex = '650'
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)
      blipLayerRef.current = L.layerGroup([], { pane: BLIP_PANE }).addTo(map)
      ringRef.current = L.circle([coord.lat, coord.lon], {
        pane: USER_PANE,
        radius: VISIBLE_RADIUS_M,
        color: RECON_BEAM_COLOR,
        weight: 2,
        dashArray: '4 6',
        fill: false,
        opacity: 0.9,
        interactive: false,
      }).addTo(map)
      youRef.current = L.circleMarker([coord.lat, coord.lon], {
        pane: USER_PANE,
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
    lastFetchAt.current = null
  }, [wikiLimit, wikiSources])

  useEffect(() => {
    if (!coord) return
    if (!shouldRefetch(lastFetchAt.current, coord)) return
    let cancelled = false
    setLoading(true)
    setFetchFailed(false)
    void fetchNearbyPlaces(
      coord,
      fetch,
      RECON_RADIUS_M,
      wikiLimit,
      wikiSources,
    )
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
  }, [coord, wikiLimit, wikiSources])

  useEffect(() => {
    const overlay = blipLayerRef.current
    const map = mapRef.current
    if (!overlay || !map || !coord) return
    overlay.clearLayers()
    map.invalidateSize()
    const clusterM = clusterMetersOnMap(map, coord)
    for (const blip of blipsForRecon(
      places,
      coord,
      RECON_RADIUS_M,
      clusterM,
    )) {
      const look = reconBlipLook(blip.count)
      const mark = L.circleMarker([blip.lat, blip.lon], {
        pane: BLIP_PANE,
        radius: look.radiusPx,
        color: look.label ? '#f3ead7' : look.color,
        fillColor: look.color,
        fillOpacity: look.fillOpacity,
        weight: look.label ? 1 : 0,
        interactive: false,
      }).addTo(overlay)
      if (look.label) {
        mark.bindTooltip(look.label, {
          permanent: true,
          direction: 'center',
          className: 'recon-cluster-label',
          opacity: 1,
        })
      }
    }
    paintWedge()
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

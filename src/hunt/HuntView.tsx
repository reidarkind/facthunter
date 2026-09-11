import { useEffect, useMemo, useRef, useState } from 'react'
import { FactSheet } from '../facts/FactSheet'
import { withRead, withUnlocked } from '../lib/collection'
import { UNLOCK_ACCURACY_M } from '../lib/constants'
import {
  arLayout,
  bearingDegrees,
  distanceMeters,
  isUnlockable,
  isVisible,
} from '../lib/geo'
import { fetchNearbyPlaces, shouldRefetch } from '../lib/wikipedia'
import type { NearbyPlace, SavedFact } from '../types'
import { ArSign, type SignKind } from './ArSign'
import { useHuntSensors } from './useHuntSensors'

function toSaved(place: NearbyPlace, nowIso: string): SavedFact {
  return {
    id: place.id,
    title: place.title,
    extract: place.extract,
    thumbnailUrl: place.thumbnailUrl,
    pageUrl: place.pageUrl,
    lang: place.lang,
    lat: place.lat,
    lon: place.lon,
    unlockedAt: nowIso,
    source: 'wikipedia',
  }
}

export function HuntView(props: {
  facts: SavedFact[]
  onFactsChange: (facts: SavedFact[]) => void
}) {
  const { facts, onFactsChange } = props
  const sensors = useHuntSensors()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const lastFetchAt = useRef<{ lat: number; lon: number } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const ownedIds = useMemo(() => new Set(facts.map((f) => f.id)), [facts])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !sensors.stream) return
    video.srcObject = sensors.stream
    void video.play().catch(() => {
      /* autoplay can fail until metadata */
    })
  }, [sensors.stream])

  const coord = sensors.coord

  useEffect(() => {
    if (!sensors.ready || !coord) return
    if (!shouldRefetch(lastFetchAt.current, coord)) return
    let cancelled = false
    setLoadingPlaces(true)
    setFetchError(null)
    void fetchNearbyPlaces(coord)
      .then((next) => {
        if (cancelled) return
        lastFetchAt.current = coord
        setPlaces(next)
      })
      .catch(() => {
        if (cancelled) return
        setFetchError('Kunne ikke hente steder fra Wikipedia')
      })
      .finally(() => {
        if (!cancelled) setLoadingPlaces(false)
      })
    return () => {
      cancelled = true
    }
  }, [sensors.ready, coord])

  const signs = useMemo(() => {
    if (!coord || sensors.headingDeg === null) return []
    const heading = sensors.headingDeg
    const pitch = sensors.pitchDeg
    const accuracy = sensors.accuracyM ?? Number.POSITIVE_INFINITY
    return places.flatMap((place) => {
      const distanceM = distanceMeters(coord, place)
      if (!isVisible(distanceM)) return []
      const bearingDeg = bearingDegrees(coord, place)
      const layout = arLayout({
        headingDeg: heading,
        bearingDeg,
        pitchDeg: pitch,
        distanceM,
      })
      if (!layout) return []
      const owned = ownedIds.has(place.id)
      const kind: SignKind = owned
        ? 'owned'
        : isUnlockable(distanceM, accuracy)
          ? 'ready'
          : 'locked'
      return [{ place, distanceM, kind, ...layout }]
    })
  }, [
    places,
    coord,
    sensors.headingDeg,
    sensors.pitchDeg,
    sensors.accuracyM,
    ownedIds,
  ])

  const openSaved = openId ? facts.find((f) => f.id === openId) : undefined
  const openDistance =
    openSaved && coord ? distanceMeters(coord, openSaved) : undefined

  function unlockOrOpen(place: NearbyPlace, kind: SignKind) {
    if (kind === 'locked') return
    if (kind === 'ready') {
      const now = new Date().toISOString()
      onFactsChange(withUnlocked(facts, toSaved(place, now), now))
    }
    setOpenId(place.id)
  }

  if (!sensors.ready) {
    return (
      <section className="gate">
        <img
          src={`${import.meta.env.BASE_URL}hunter-badge.png`}
          alt=""
          width={160}
          height={160}
        />
        <h1>FactHunter</h1>
        <p>
          Jakten starter når kamera, posisjon og kompass er på. Én gang, fra
          samme trykk.
        </p>
        {sensors.missing.length > 0 ? (
          <ul className="gate-missing">
            {sensors.missing.includes('kamera') ? (
              <li>Kamera mangler eller ble avslått</li>
            ) : null}
            {sensors.missing.includes('posisjon') ? (
              <li>Posisjon mangler eller ble avslått</li>
            ) : null}
            {sensors.missing.includes('kompass') ? (
              <li>Kompass mangler eller ble avslått</li>
            ) : null}
            {sensors.missing.includes('https') ? (
              <li>Åpne appen over HTTPS, ikke http://192.168…</li>
            ) : null}
          </ul>
        ) : null}
        {sensors.stream && !sensors.headingDeg && !sensors.missing.includes('kompass') ? (
          <p>Venter på kompass — beveg telefonen litt.</p>
        ) : null}
        <button
          type="button"
          className="primary"
          disabled={sensors.requesting}
          onClick={() => void sensors.startFromUserGesture()}
        >
          {sensors.missing.length > 0 || sensors.stream
            ? 'Prøv igjen'
            : 'Start jakt'}
        </button>
        <p className="hint">
          iPhone: Innstillinger → Safari (eller appen) → Bevegelse og retning.
          Kamera og kompass virker ikke på vanlig http over Wi-Fi.
        </p>
      </section>
    )
  }

  const gpsUncertain =
    sensors.accuracyM !== null && sensors.accuracyM > UNLOCK_ACCURACY_M

  return (
    <section className="hunt">
      <video
        ref={videoRef}
        className="hunt-video"
        autoPlay
        playsInline
        muted
      />
      <div className="hunt-overlay">
        {signs.map((sign) => (
          <ArSign
            key={sign.place.id}
            title={sign.place.title}
            kind={sign.kind}
            xPct={sign.xPct}
            yPct={sign.yPct}
            scale={sign.scale}
            onClick={() => unlockOrOpen(sign.place, sign.kind)}
          />
        ))}
        <div
          className="compass-rose"
          style={{
            transform: `rotate(${sensors.headingDeg ?? 0}deg)`,
          }}
          aria-hidden="true"
        >
          <span className="compass-n">N</span>
        </div>
        <div className="hunt-banners">
          {gpsUncertain ? <p className="banner warn">GPS usikker</p> : null}
          {fetchError ? <p className="banner warn">{fetchError}</p> : null}
          {!loadingPlaces && !fetchError && places.length === 0 ? (
            <p className="banner">Ingen steder her — gå litt</p>
          ) : null}
        </div>
      </div>
      {openSaved ? (
        <FactSheet
          fact={{ ...openSaved, distanceM: openDistance }}
          onClose={() => setOpenId(null)}
          onRead={() =>
            onFactsChange(withRead(facts, openSaved.id, new Date().toISOString()))
          }
        />
      ) : null}
    </section>
  )
}

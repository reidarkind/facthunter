import { useCallback, useEffect, useRef, useState } from 'react'
import { headingDiffDegrees, headingFromEvent, type Coord } from '../lib/geo'

type DeviceOrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>
}

const HEADING_SMOOTH = 0.28

function mod360(value: number): number {
  return ((value % 360) + 360) % 360
}

function smoothHeading(prev: number | null, next: number): number {
  if (prev === null) return next
  return mod360(prev + headingDiffDegrees(prev, next) * HEADING_SMOOTH)
}

function screenAngle(): number {
  return window.screen.orientation?.angle ?? 0
}

export function useHuntSensors() {
  const [requesting, setRequesting] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [coord, setCoord] = useState<Coord | null>(null)
  const [accuracyM, setAccuracyM] = useState<number | null>(null)
  const [headingDeg, setHeadingDeg] = useState<number | null>(null)
  const [pitchDeg, setPitchDeg] = useState(90)
  const [missing, setMissing] = useState<string[]>([])
  const watchId = useRef<number | null>(null)
  const headingRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const orientHandler = useRef<((event: DeviceOrientationEvent) => void) | null>(
    null,
  )

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    if (orientHandler.current) {
      window.removeEventListener(
        'deviceorientationabsolute',
        orientHandler.current,
      )
      window.removeEventListener('deviceorientation', orientHandler.current)
      orientHandler.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  useEffect(() => () => stop(), [stop])

  const startFromUserGesture = useCallback(async () => {
    setRequesting(true)
    const missingNow: string[] = []
    if (!window.isSecureContext) missingNow.push('https')

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = nextStream
      setStream(nextStream)
    } catch {
      missingNow.push('kamera')
    }

    const doe = DeviceOrientationEvent as DeviceOrientationWithPermission
    if (typeof doe.requestPermission === 'function') {
      try {
        const permission = await doe.requestPermission()
        if (permission !== 'granted') missingNow.push('kompass')
      } catch {
        missingNow.push('kompass')
      }
    }

    if (orientHandler.current) {
      window.removeEventListener(
        'deviceorientationabsolute',
        orientHandler.current,
      )
      window.removeEventListener('deviceorientation', orientHandler.current)
    }

    const onOrient = (event: DeviceOrientationEvent) => {
      const preferAbsolute = event.type === 'deviceorientationabsolute'
      const heading = headingFromEvent(event, screenAngle(), preferAbsolute)
      if (heading !== null) {
        const smoothed = smoothHeading(headingRef.current, heading)
        headingRef.current = smoothed
        setHeadingDeg(smoothed)
      }
      if (typeof event.beta === 'number' && Number.isFinite(event.beta)) {
        setPitchDeg(event.beta)
      }
    }
    orientHandler.current = onOrient
    window.addEventListener('deviceorientationabsolute', onOrient)
    window.addEventListener('deviceorientation', onOrient)

    if (!navigator.geolocation) {
      missingNow.push('posisjon')
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCoord({ lat: pos.coords.latitude, lon: pos.coords.longitude })
          setAccuracyM(pos.coords.accuracy)
        },
        () => {
          setMissing((prev) =>
            prev.includes('posisjon') ? prev : [...prev, 'posisjon'],
          )
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
      )
    }

    setMissing(missingNow)
    setRequesting(false)
  }, [])

  const ready = stream !== null && coord !== null && headingDeg !== null

  return {
    ready,
    requesting,
    stream,
    coord,
    accuracyM,
    headingDeg,
    pitchDeg,
    missing,
    startFromUserGesture,
    stop,
  }
}

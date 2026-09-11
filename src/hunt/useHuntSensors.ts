import { useCallback, useEffect, useRef, useState } from 'react'
import {
  attachHeadingListener,
  requestOrientationPermission,
} from '../lib/heading'
import type { Coord } from '../lib/geo'

export function useHuntSensors() {
  const [requesting, setRequesting] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [coord, setCoord] = useState<Coord | null>(null)
  const [accuracyM, setAccuracyM] = useState<number | null>(null)
  const [headingDeg, setHeadingDeg] = useState<number | null>(null)
  const [pitchDeg, setPitchDeg] = useState(90)
  const [missing, setMissing] = useState<string[]>([])
  const watchId = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stopHeading = useRef<(() => void) | null>(null)

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    stopHeading.current?.()
    stopHeading.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  useEffect(() => () => stop(), [stop])

  const startFromUserGesture = useCallback(async () => {
    setRequesting(true)
    const missingNow: string[] = []
    if (!window.isSecureContext) missingNow.push('https')

    const orientationPermission = requestOrientationPermission()
    stopHeading.current?.()
    stopHeading.current = attachHeadingListener(setHeadingDeg, setPitchDeg)

    if (orientationPermission) {
      try {
        const permission = await orientationPermission
        if (permission !== 'granted') missingNow.push('kompass')
      } catch {
        missingNow.push('kompass')
      }
    }

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

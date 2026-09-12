import { useCallback, useEffect, useRef, useState } from 'react'
import {
  attachHeadingListener,
  requestOrientationPermission,
} from '../lib/heading'
import type { Coord } from '../lib/geo'
import {
  GEO_WATCH_OPTIONS,
  isCameraLive,
  queryPermission,
  sensorsReady,
} from '../lib/sensors'

export function useHuntSensors() {
  const [requesting, setRequesting] = useState(false)
  const [started, setStarted] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [coord, setCoord] = useState<Coord | null>(null)
  const [accuracyM, setAccuracyM] = useState<number | null>(null)
  const [headingDeg, setHeadingDeg] = useState<number | null>(null)
  const [pitchDeg, setPitchDeg] = useState(90)
  const [missing, setMissing] = useState<string[]>([])
  const watchId = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stopHeading = useRef<(() => void) | null>(null)
  const startedRef = useRef(false)

  const markMissing = useCallback((key: string) => {
    setMissing((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }, [])

  const wireCameraEnded = useCallback(
    (nextStream: MediaStream) => {
      for (const track of nextStream.getVideoTracks()) {
        track.addEventListener('ended', () => {
          if (streamRef.current !== nextStream) return
          if (isCameraLive(streamRef.current)) return
          streamRef.current = null
          setStream(null)
          markMissing('kamera')
        })
      }
    },
    [markMissing],
  )

  const acquireCamera = useCallback(
    async (fromUserGesture: boolean) => {
      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        const prev = streamRef.current
        streamRef.current = nextStream
        wireCameraEnded(nextStream)
        setStream(nextStream)
        prev?.getTracks().forEach((track) => track.stop())
        setMissing((prevMissing) =>
          prevMissing.filter((item) => item !== 'kamera'),
        )
        return true
      } catch {
        const prev = streamRef.current
        streamRef.current = null
        prev?.getTracks().forEach((track) => track.stop())
        setStream(null)
        if (fromUserGesture) markMissing('kamera')
        return false
      }
    },
    [markMissing, wireCameraEnded],
  )

  const startGpsWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setCoord(null)
      setAccuracyM(null)
      markMissing('posisjon')
      return
    }
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoord({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setAccuracyM(pos.coords.accuracy)
        setMissing((prev) => prev.filter((item) => item !== 'posisjon'))
      },
      () => {
        setCoord(null)
        setAccuracyM(null)
        markMissing('posisjon')
      },
      GEO_WATCH_OPTIONS,
    )
  }, [markMissing])

  const stop = useCallback(() => {
    startedRef.current = false
    setStarted(false)
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    stopHeading.current?.()
    stopHeading.current = null
    const current = streamRef.current
    streamRef.current = null
    current?.getTracks().forEach((track) => track.stop())
    setStream(null)
  }, [])

  const recoverIfStarted = useCallback(() => {
    if (!startedRef.current) return
    if (document.visibilityState === 'hidden') return

    void queryPermission('geolocation', navigator.permissions).then((geo) => {
      if (geo === 'denied') {
        setCoord(null)
        setAccuracyM(null)
        markMissing('posisjon')
      }
    })
    startGpsWatch()

    if (isCameraLive(streamRef.current)) return
    void queryPermission('camera', navigator.permissions).then(async (camera) => {
      if (camera === 'denied') {
        const current = streamRef.current
        streamRef.current = null
        current?.getTracks().forEach((track) => track.stop())
        setStream(null)
        markMissing('kamera')
        return
      }
      await acquireCamera(false)
    })
  }, [acquireCamera, markMissing, startGpsWatch])

  useEffect(() => () => stop(), [stop])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'hidden') return
      recoverIfStarted()
    }
    function onPageShow() {
      recoverIfStarted()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [recoverIfStarted])

  const startFromUserGesture = useCallback(async () => {
    setRequesting(true)
    startedRef.current = true
    setStarted(true)
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

    const cameraOk = await acquireCamera(true)
    if (!cameraOk) missingNow.push('kamera')

    if (!navigator.geolocation) {
      missingNow.push('posisjon')
      setCoord(null)
      setAccuracyM(null)
    } else {
      startGpsWatch()
    }

    setMissing(missingNow)
    setRequesting(false)
  }, [acquireCamera, startGpsWatch])

  const ready = sensorsReady({ stream, coord, headingDeg })

  return {
    ready,
    started,
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

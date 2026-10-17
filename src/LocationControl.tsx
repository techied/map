import { useCallback, useEffect, useRef, useState } from 'react'
import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps'

export function LocationControl() {
  const map = useMap()
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const locatingRef = useRef(false)

  const locate = useCallback(() => {
    if (!map || locatingRef.current) return
    setError('')

    if (!navigator.geolocation) {
      setError('Your browser does not support location access.')
      return
    }

    locatingRef.current = true
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.moveCamera({
          center: { lat: coords.latitude, lng: coords.longitude },
          zoom: Math.max(map.getZoom() ?? 0, 16),
        })
        locatingRef.current = false
        setLocating(false)
      },
      ({ code }) => {
        locatingRef.current = false
        setLocating(false)
        setError(
          code === 1
            ? 'Allow location access in your browser to use this button.'
            : code === 3
              ? 'Finding your location timed out. Try again.'
              : 'Your location is unavailable. Try again.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [map])

  useEffect(() => {
    if (!map || !navigator.geolocation || !navigator.permissions?.query) return

    let cancelled = false
    void navigator.permissions
      .query({ name: 'geolocation' })
      .then(({ state }) => {
        if (!cancelled && state === 'granted') locate()
      })
      .catch(() => {
        // Browsers without geolocation permission queries can still use the button.
      })

    return () => {
      cancelled = true
    }
  }, [map, locate])

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <div className="location-control">
        {error && (
          <p className="location-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="location-button"
          type="button"
          title={locating ? 'Finding your location…' : 'Center on your location'}
          aria-label={locating ? 'Finding your location' : 'Center on your location'}
          aria-busy={locating}
          disabled={!map || locating}
          onClick={locate}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 3h-1.07A8 8 0 0 0 13 4.07V2h-2v2.07A8 8 0 0 0 4.07 11H2v2h2.07A8 8 0 0 0 11 19.93V22h2v-2.07A8 8 0 0 0 19.93 13H22v-2h-1Zm-9 7a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" />
          </svg>
        </button>
      </div>
    </MapControl>
  )
}

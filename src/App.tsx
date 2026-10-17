import { useState } from 'react'
import { APIProvider, Map } from '@vis.gl/react-google-maps'
import { SegmentationOverlay } from './SegmentationOverlay.tsx'
import { LocationControl } from './LocationControl.tsx'
import { GitHubControl } from './GitHubControl.tsx'
import { MapQueryPanel } from './MapQueryPanel.tsx'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('buildings')
  const [maskError, setMaskError] = useState('')
  const [overlayVersion, setOverlayVersion] = useState(0)

  function applyPrompt(value: string) {
    setMaskError('')
    setPrompt(value.trim().toLowerCase())
    setOverlayVersion((version) => version + 1)
  }

  return (
    <APIProvider apiKey="AIzaSyAniKE6LUmEGU0irbCiBKig6oZbXHRYcBw">
      <main className="map-app">
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 33.6500901, lng: -117.7385763 }}
          defaultZoom={16}
          mapTypeId="satellite"
          tilt={0}
          gestureHandling="greedy"
          disableDefaultUI
        >
          <SegmentationOverlay key={overlayVersion} prompt={prompt} onError={setMaskError} />
          <LocationControl />
          <GitHubControl />
        </Map>
        <MapQueryPanel prompt={prompt} error={maskError} onSubmit={applyPrompt} />
      </main>
    </APIProvider>
  )
}

export default App

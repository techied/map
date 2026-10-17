import { useState } from 'react'
import { SampleQueries } from './SampleQueries.tsx'

type Props = {
  prompt: string
  error: string
  onSubmit: (prompt: string) => void
}

export function MapQueryPanel({ prompt, error, onSubmit }: Props) {
  const [promptInput, setPromptInput] = useState(prompt)

  return (
    <section className="map-controls" aria-label="Map highlights">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(promptInput)
        }}
      >
        <label htmlFor="mask-prompt">What are you looking for?</label>
        <div className="map-controls-row">
          <div className="map-query-input">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>
            <input
              id="mask-prompt"
              value={promptInput}
              onChange={(event) => setPromptInput(event.target.value)}
              placeholder="e.g. buildings, trees, roads"
            />
          </div>
          <button type="submit" disabled={!promptInput.trim()}>
            Highlight
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 10h12m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>
        <SampleQueries
          prompt={prompt}
          onSelect={(value) => {
            setPromptInput(value)
            onSubmit(value)
          }}
        />
      </form>
      {error && (
        <p className="mask-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { samplePrompts } from './sample-prompts.ts'

type Props = {
  prompt: string
  onSelect: (prompt: string) => void
}

type ScrollButtonProps = {
  direction: -1 | 1
  disabled: boolean
  onClick: () => void
}

function SampleScrollButton({ direction, disabled, onClick }: ScrollButtonProps) {
  return (
    <button
      className="sample-scroll-button"
      type="button"
      aria-label={direction === -1 ? 'Previous sample queries' : 'Next sample queries'}
      aria-controls="sample-query-list"
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d={direction === -1 ? 'm12 5-5 5 5 5' : 'm8 5 5 5-5 5'} />
      </svg>
    </button>
  )
}

export function SampleQueries({ prompt, onSelect }: Props) {
  const [samples] = useState(() => {
    const shuffled = [...samplePrompts]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })
  const sampleList = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const list = sampleList.current
    if (!list) return

    const updateScroll = () => {
      setCanScrollLeft(list.scrollLeft > 1)
      setCanScrollRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 1)
    }
    updateScroll()
    list.addEventListener('scroll', updateScroll, { passive: true })
    const observer = new ResizeObserver(updateScroll)
    observer.observe(list)
    return () => {
      list.removeEventListener('scroll', updateScroll)
      observer.disconnect()
    }
  }, [])

  function scrollSamples(direction: -1 | 1) {
    const list = sampleList.current
    if (!list) return
    list.scrollBy({
      left: direction * list.clientWidth * 0.8,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="sample-prompts" role="group" aria-label="Sample queries">
      <SampleScrollButton
        direction={-1}
        disabled={!canScrollLeft}
        onClick={() => scrollSamples(-1)}
      />
      <div className="sample-prompts-scroll" id="sample-query-list" ref={sampleList}>
        {samples.map(({ label, icon }) => (
          <button
            key={label}
            className="sample-prompt"
            type="button"
            aria-pressed={prompt === label}
            onClick={() => onSelect(label)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>
      <SampleScrollButton
        direction={1}
        disabled={!canScrollRight}
        onClick={() => scrollSamples(1)}
      />
    </div>
  )
}

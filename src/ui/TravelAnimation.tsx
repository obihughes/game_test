import { useEffect, useState } from 'react'
import { TOWNS } from '@/game/world/index.ts'
import type { TravelResult } from '@/store/gameStore.ts'

interface TravelAnimationProps {
  travelResult: TravelResult
  onComplete: () => void
}

export function TravelAnimation({ travelResult, onComplete }: TravelAnimationProps) {
  const [phase, setPhase] = useState<'enter' | 'travel' | 'exit'>('enter')
  const [dayShown, setDayShown] = useState(0)

  const { routeNames, days } = travelResult

  // Phase timeline
  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setPhase('travel'), 300)
    // Tick days up
    let dayTick = 0
    const tickInterval = Math.min(400, (days > 0 ? 1400 / days : 700))
    const dayTimer = setInterval(() => {
      dayTick++
      setDayShown(dayTick)
      if (dayTick >= days) clearInterval(dayTimer)
    }, tickInterval)
    // Begin exit
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    // Complete
    const t3 = setTimeout(() => onComplete(), 2700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearInterval(dayTimer)
    }
  }, [days, onComplete])

  const townLabels = routeNames.map((id) => TOWNS[id]?.name ?? id)

  return (
    <div className={`travel-overlay travel-overlay--${phase}`} aria-live="polite" aria-label="Travelling...">
      <div className="travel-overlay__inner">
        <div className="travel-overlay__route">
          {townLabels.map((name, i) => (
            <span key={i} className="travel-overlay__route-step">
              {i > 0 && <span className="travel-overlay__route-arrow">→</span>}
              <span className={i === townLabels.length - 1 ? 'travel-overlay__route-dest' : 'travel-overlay__route-town'}>
                {name}
              </span>
            </span>
          ))}
        </div>

        <div className="travel-overlay__caravan-track">
          <div className="travel-overlay__track-line" />
          <div className="travel-overlay__caravan" aria-hidden>
            🐎
          </div>
        </div>

        <div className="travel-overlay__days">
          {dayShown > 0 ? (
            <span>
              Day +{dayShown} of {days}
            </span>
          ) : (
            <span>Setting out…</span>
          )}
        </div>
      </div>
    </div>
  )
}

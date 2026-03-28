import { useMemo } from 'react'
import { getLocationStory } from '@/content/locationContent.ts'
import { ROUTES, TOWNS } from '@/game/world/index.ts'
import { travelDaysFor } from '@/game/caravan/horses.ts'
import { LocationPixelIcon } from '@/ui/icons/LocationPixelIcon.tsx'
import { useGameStore } from '@/store/gameStore.ts'

export function TravelScreen() {
  const game = useGameStore((s) => s.game)
  const travelTo = useGameStore((s) => s.travelTo)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)

  const options = useMemo(() => {
    return ROUTES.filter((r) => r.from === game.location)
  }, [game.location])

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Travel</h2>
        <p className="muted">Choose a road. Horses shorten the journey; hirelings take a cut each day.</p>
      </header>
      {lastError ? (
        <p className="error" role="alert">
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}
      <ul className="travel-list">
        {options.map((r) => {
          const name = TOWNS[r.to]?.name ?? r.to
          const days = travelDaysFor(r.baseDays, game.caravan.horses)
          const destStory = getLocationStory(r.to)
          return (
            <li key={r.to} className="travel-row">
              <div className="travel-row__main">
                <LocationPixelIcon className="pixel-icon" townId={r.to} size={40} title={name} />
                <div>
                  <strong>{name}</strong>
                  <div className="muted small">
                    {days} day{days === 1 ? '' : 's'} · Toll {r.toll} gold
                  </div>
                  <p className="travel-row__story muted small" title={destStory}>
                    {destStory}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => travelTo(r.to)}>
                Depart
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
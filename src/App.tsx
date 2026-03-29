import { useCallback, useState } from 'react'
import { TOWNS, getSeasonLabel } from '@/game/world/index.ts'
import { useGameStore, type TravelResult } from '@/store/gameStore.ts'
import { LocationPixelIcon } from '@/ui/icons/LocationPixelIcon.tsx'
import { QuestPanel } from '@/ui/QuestPanel.tsx'
import { TownScreen } from '@/ui/screens/TownScreen.tsx'
import { MapTravelScreen } from '@/ui/screens/MapTravelScreen.tsx'
import { CaravanScreen } from '@/ui/screens/CaravanScreen.tsx'
import { TravelAnimation } from '@/ui/TravelAnimation.tsx'
import { EncounterModal } from '@/ui/EncounterModal.tsx'

type Tab = 'town' | 'map' | 'caravan'

export function App() {
  const game = useGameStore((s) => s.game)
  const reset = useGameStore((s) => s.reset)
  const [tab, setTab] = useState<Tab>('town')
  const [activeTravelResult, setActiveTravelResult] = useState<TravelResult | null>(null)

  const townName = TOWNS[game.location]?.name ?? game.location

  const handleTravelComplete = useCallback(() => {
    setActiveTravelResult(null)
    setTab('town')
  }, [])

  const handleTravelStart = useCallback((result: TravelResult) => {
    setActiveTravelResult(result)
  }, [])

  return (
    <div className="app-shell">
      <div className="gold-hud" title="Your gold and trading net" aria-live="polite">
        <span className="gold-hud__icon" aria-hidden>
          🪙
        </span>
        <span className="gold-hud__amount">{game.gold}</span>
        <span className="gold-hud__trade" title="Sales − purchases (lifetime this save)">
          Net trade:{' '}
          <strong
            className={
              game.tradeGoldEarned - game.tradeGoldSpent >= 0 ? 'gold-hud__net--pos' : 'gold-hud__net--neg'
            }
          >
            {game.tradeGoldEarned - game.tradeGoldSpent >= 0 ? '+' : ''}
            {game.tradeGoldEarned - game.tradeGoldSpent}
          </strong>
        </span>
      </div>
      <header className="top-bar">
        <div>
          <h1>Caravan Merchant</h1>
          <p className="muted top-bar__status">
            <LocationPixelIcon
              townId={game.location}
              size={24}
              className="pixel-icon pixel-icon--header"
              title={townName}
            />
            <span>
              Day {game.day} · {townName}
            </span>
            <span className="season-badge">{getSeasonLabel(game.day)}</span>
          </p>
        </div>
        <button type="button" className="ghost" onClick={() => reset()}>
          New game
        </button>
      </header>

      <div className="layout">
        <nav className="tabs" aria-label="Main sections">
          {(
            [
              ['town', 'Market'],
              ['map', 'Map & Travel'],
              ['caravan', 'Caravan'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'tab active' : 'tab'}
              onClick={() => setTab(id)}
              disabled={activeTravelResult !== null}
            >
              {label}
            </button>
          ))}
        </nav>

        <main className="main">
          {tab === 'town' ? <TownScreen /> : null}
          {tab === 'map' ? (
            <MapTravelScreen onTravelStart={handleTravelStart} />
          ) : null}
          {tab === 'caravan' ? <CaravanScreen /> : null}
        </main>
      </div>

      <QuestPanel game={game} />

      {activeTravelResult ? (
        <TravelAnimation travelResult={activeTravelResult} onComplete={handleTravelComplete} />
      ) : null}

      {!activeTravelResult && game.lastEncounter ? (
        <EncounterModal encounter={game.lastEncounter} />
      ) : null}
    </div>
  )
}

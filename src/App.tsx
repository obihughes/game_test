import { useState } from 'react'
import { TOWNS } from '@/game/world/index.ts'
import { useGameStore } from '@/store/gameStore.ts'
import { LocationPixelIcon } from '@/ui/icons/LocationPixelIcon.tsx'
import { QuestPanel } from '@/ui/QuestPanel.tsx'
import { TownScreen } from '@/ui/screens/TownScreen.tsx'
import { MapTravelScreen } from '@/ui/screens/MapTravelScreen.tsx'
import { CaravanScreen } from '@/ui/screens/CaravanScreen.tsx'

type Tab = 'town' | 'map' | 'caravan'

export function App() {
  const game = useGameStore((s) => s.game)
  const travelTo = useGameStore((s) => s.travelTo)
  const reset = useGameStore((s) => s.reset)
  const [tab, setTab] = useState<Tab>('town')

  const townName = TOWNS[game.location]?.name ?? game.location

  return (
    <div className="app-shell">
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
              Day {game.day} · {townName} · {game.gold} gold
            </span>
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
            >
              {label}
            </button>
          ))}
        </nav>

        <main className="main">
          {tab === 'town' ? <TownScreen /> : null}
          {tab === 'map' ? <MapTravelScreen /> : null}
          {tab === 'caravan' ? <CaravanScreen /> : null}
        </main>

        <QuestPanel activeQuestId={game.activeQuestId} />
      </div>
    </div>
  )
}
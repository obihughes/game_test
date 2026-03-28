import { useState } from 'react'
import { TOWNS } from '@/game/world/index.ts'
import { useGameStore } from '@/store/gameStore.ts'
import { MapView } from '@/ui/map/MapView.tsx'
import { QuestPanel } from '@/ui/QuestPanel.tsx'
import { TownScreen } from '@/ui/screens/TownScreen.tsx'
import { TravelScreen } from '@/ui/screens/TravelScreen.tsx'
import { CaravanScreen } from '@/ui/screens/CaravanScreen.tsx'

type Tab = 'town' | 'map' | 'travel' | 'caravan'

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
          <p className="muted">
            Day {game.day} · {townName} · {game.gold} gold
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
              ['map', 'Map'],
              ['travel', 'Travel'],
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
          {tab === 'map' ? (
            <section className="panel">
              <header className="panel-header">
                <h2>Realm map</h2>
                <p className="muted">Click a connected town to travel.</p>
              </header>
              <MapView location={game.location} onSelectTown={(id) => travelTo(id)} />
            </section>
          ) : null}
          {tab === 'travel' ? <TravelScreen /> : null}
          {tab === 'caravan' ? <CaravanScreen /> : null}
        </main>

        <QuestPanel activeQuestId={game.activeQuestId} />
      </div>
    </div>
  )
}
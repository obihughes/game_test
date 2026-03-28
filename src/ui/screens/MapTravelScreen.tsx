import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { findRoute, ROUTES, TOWNS, type Town } from '@/game/world/index.ts'
import { MAP_POSITIONS } from '@/content/mapLayout.ts'
import { MapLocationGlyph } from '@/ui/icons/LocationPixelIcon.tsx'
import { mapTheme } from '@/ui/map/mapTheme.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { computeTravelLeg } from '@/game/world/travel.ts'
import { getSeasonTravelPenalty, getSeason } from '@/game/world/seasons.ts'
import { bestSellPriceAtTown } from '@/game/economy/merchants.ts'
import { GOOD_IDS, GOODS } from '@/game/economy/index.ts'
import { dailyHireCost } from '@/game/caravan/actions.ts'
import { useGameStore } from '@/store/gameStore.ts'
import styles from '@/ui/map/map.module.css'

export function MapTravelScreen() {
  const game = useGameStore((s) => s.game)
  const travelTo = useGameStore((s) => s.travelTo)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const [hoveredTown, setHoveredTown] = useState<string | null>(null)
  const [pendingTravelTown, setPendingTravelTown] = useState<string | null>(null)

  useEffect(() => {
    if (!pendingTravelTown) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPendingTravelTown(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pendingTravelTown])

  const edges = useMemo(() => {
    const seen = new Set<string>()
    const list: { from: string; to: string }[] = []
    for (const r of ROUTES) {
      const key = [r.from, r.to].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ from: r.from, to: r.to })
    }
    return list
  }, [])

  const reachableTowns = useMemo(
    () => (Object.values(TOWNS) as Town[]).filter((t) => t.id !== game.location && findRoute(game.location, t.id)),
    [game.location],
  )

  const routeMidpoints = useMemo(
    () =>
      edges
        .map((e) => {
          const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
          const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
          if (!a || !b) return null
          const route = findRoute(e.from, e.to) ?? findRoute(e.to, e.from)
          return { key: `${e.from}-${e.to}`, from: e.from, to: e.to, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, days: route?.baseDays ?? 0 }
        })
        .filter(Boolean) as { key: string; from: string; to: string; mx: number; my: number; days: number }[],
    [edges],
  )

  const hoveredInfo = useMemo(() => {
    if (!hoveredTown || hoveredTown === game.location) return null
    const route = findRoute(game.location, hoveredTown)
    if (!route) return null
    const { days, toll } = computeTravelLeg(game, route)
    const name = TOWNS[hoveredTown]?.name ?? hoveredTown
    const story = getLocationStory(hoveredTown)
    const hintParts: { score: number; line: string }[] = []
    for (const id of GOOD_IDS) {
      const qty = game.inventory[id] ?? 0
      if (qty <= 0) continue
      const hereSell = bestSellPriceAtTown(game.location, id, game.day)
      const thereSell = bestSellPriceAtTown(hoveredTown, id, game.day)
      const perUnit = thereSell - hereSell
      if (perUnit > 0) {
        hintParts.push({ score: perUnit * qty, line: `${GOODS[id]!.name}: +${perUnit}/unit vs here` })
      }
    }
    hintParts.sort((a, b) => b.score - a.score)
    return { name, days, toll, story, cargoHints: hintParts.slice(0, 2).map((h) => h.line), townId: hoveredTown }
  }, [hoveredTown, game])

  const pendingInfo = useMemo(() => {
    if (!pendingTravelTown) return null
    const route = findRoute(game.location, pendingTravelTown)
    if (!route) return null
    const { days, toll } = computeTravelLeg(game, route)
    const upkeep = dailyHireCost(game) * days
    const totalCost = toll + upkeep
    const goldAfter = game.gold - totalCost
    const name = TOWNS[pendingTravelTown]?.name ?? pendingTravelTown
    const isWinter = getSeason(game.day) === 'winter'
    const seasonPenalty = getSeasonTravelPenalty(game.day)
    return { name, days, toll, upkeep, totalCost, goldAfter, isWinter, seasonPenalty, townId: pendingTravelTown }
  }, [pendingTravelTown, game])

  function handleTravelRequest(townId: string) {
    setPendingTravelTown(townId)
  }

  function confirmTravel() {
    if (!pendingTravelTown) return
    const town = pendingTravelTown
    setPendingTravelTown(null)
    travelTo(town)
  }

  return (
    <section className={styles.mapScreen}>
      {lastError ? (
        <p className="error" role="alert" style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem' }}>
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}

      <div className={styles.mapWrap}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          role="img"
          aria-label="World map"
          style={{ '--map-road': mapTheme.road, '--map-label': mapTheme.label } as CSSProperties}
        >
          <defs>
            <radialGradient id="mapBg" cx="28%" cy="22%" r="78%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e261e" />
              <stop offset="55%" stopColor="#1c1612" />
              <stop offset="100%" stopColor="#0d0b08" />
            </radialGradient>
            <pattern id="mapDots" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="0.28" fill="#ffffff" fillOpacity="0.045" />
            </pattern>
          </defs>

          <rect width="100" height="100" fill="url(#mapBg)" />
          <rect width="100" height="100" fill="url(#mapDots)" />

          {edges.map((e) => {
            const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
            const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
            if (!a || !b) return null
            const isHoveredRoute =
              hoveredTown &&
              ((e.from === game.location && e.to === hoveredTown) ||
                (e.to === game.location && e.from === hoveredTown))
            const isActiveRoute = e.from === game.location || e.to === game.location
            return (
              <line
                key={`${e.from}-${e.to}`}
                className={isHoveredRoute ? styles.roadHighlight : styles.road}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                opacity={isHoveredRoute ? 1 : isActiveRoute ? 0.8 : 0.38}
              />
            )
          })}

          {routeMidpoints.map((m) => {
            const isActive = m.from === game.location || m.to === game.location
            return (
              <text
                key={m.key}
                className={styles.routeLabel}
                x={m.mx}
                y={m.my + 1.5}
                opacity={isActive ? 0.9 : 0.28}
              >
                {m.days}d
              </text>
            )
          })}

          {(Object.values(TOWNS) as Town[]).map((t) => {
            const pos = MAP_POSITIONS[t.id]
            if (!pos) return null
            const here = t.id === game.location
            const route = findRoute(game.location, t.id)
            const canGo = Boolean(route)
            const dim = !(canGo || here)
            const isHovered = hoveredTown === t.id
            return (
              <g key={t.id} className={here ? styles.townCurrentWrap : undefined}>
                <circle
                  className={styles.townHit}
                  cx={pos.x}
                  cy={pos.y}
                  r={8}
                  fill="rgba(0,0,0,0.02)"
                  opacity={dim ? 0.35 : 1}
                  style={{ cursor: canGo && !here ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
                  onClick={() => { if (canGo && !here) handleTravelRequest(t.id) }}
                  onMouseEnter={() => { if (canGo && !here) setHoveredTown(t.id) }}
                  onMouseLeave={() => setHoveredTown(null)}
                />
                <g style={{ pointerEvents: 'none' as const }} opacity={dim ? 0.35 : 1}>
                  <MapLocationGlyph
                    townId={t.id}
                    x={pos.x}
                    y={pos.y}
                    size={here ? 9 : isHovered && canGo ? 8 : 7}
                  />
                </g>
                <text
                  className={styles.label}
                  x={pos.x}
                  y={pos.y - 9}
                  opacity={dim ? 0.35 : 1}
                  fontWeight={here ? '700' : isHovered ? '600' : '500'}
                >
                  {t.name}
                  {here ? ' ◆' : ''}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <aside className={styles.mapSidebar}>
        <div className={styles.infoPanel}>
          {hoveredInfo ? (
            <>
              <div className={styles.infoPanelHeader}>
                <span className={styles.infoPanelName}>{hoveredInfo.name}</span>
                <span className={styles.infoPanelMeta}>
                  {hoveredInfo.days} day{hoveredInfo.days === 1 ? '' : 's'}
                  {hoveredInfo.toll > 0 ? ` · ${hoveredInfo.toll}g toll` : ' · No toll'}
                </span>
              </div>
              {hoveredInfo.story ? <p className={styles.infoPanelStory}>{hoveredInfo.story}</p> : null}
              {hoveredInfo.cargoHints.length > 0 ? (
                <div className={styles.infoPanelCargo}>
                  <span className={styles.infoPanelCargoLabel}>Cargo advantage: </span>
                  <ul className={styles.infoPanelCargoList}>
                    {hoveredInfo.cargoHints.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button type="button" className={styles.travelBtn} onClick={() => handleTravelRequest(hoveredInfo.townId)}>
                Travel to {hoveredInfo.name} →
              </button>
            </>
          ) : (
            <p className={styles.infoPanelHint}>Hover a town on the map to see route details</p>
          )}
        </div>

        {reachableTowns.length > 0 ? (
          <div className={styles.destinationList}>
            <h3 className={styles.destinationListTitle}>Destinations</h3>
            <ul className={styles.destinationItems}>
              {reachableTowns.map((t) => {
                const route = findRoute(game.location, t.id)
                if (!route) return null
                const { days, toll } = computeTravelLeg(game, route)
                return (
                  <li key={t.id} className={styles.destinationItem}>
                    <span className={styles.destinationName}>{t.name}</span>
                    <span className={styles.destinationMeta}>
                      {days}d{toll > 0 ? ` · ${toll}g` : ''}
                    </span>
                    <button type="button" className={styles.destinationBtn} onClick={() => handleTravelRequest(t.id)}>
                      Go →
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </aside>

      {pendingInfo ? (
        <div
          className="trade-confirm-backdrop"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setPendingTravelTown(null) }}
        >
          <div
            className="trade-confirm-dialog travel-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Travel to ${pendingInfo.name}`}
          >
            <h3 className="trade-confirm-dialog__title">
              Travel to {pendingInfo.name}?
            </h3>

            {pendingInfo.isWinter && (
              <p className="travel-confirm-dialog__season-warning">
                ❄️ Winter roads — journey takes +{pendingInfo.seasonPenalty} extra day{pendingInfo.seasonPenalty > 1 ? 's' : ''}
              </p>
            )}

            <div className="travel-confirm-dialog__breakdown">
              <div className="travel-confirm-row">
                <span>Journey time</span>
                <strong>{pendingInfo.days} day{pendingInfo.days === 1 ? '' : 's'}</strong>
              </div>
              {pendingInfo.toll > 0 && (
                <div className="travel-confirm-row">
                  <span>Road toll</span>
                  <strong className="cost">−{pendingInfo.toll}g</strong>
                </div>
              )}
              {pendingInfo.upkeep > 0 && (
                <div className="travel-confirm-row">
                  <span>Hire upkeep ({pendingInfo.days}d)</span>
                  <strong className="cost">−{pendingInfo.upkeep}g</strong>
                </div>
              )}
              <div className="travel-confirm-row travel-confirm-row--total">
                <span>Total cost</span>
                <strong className="cost">−{pendingInfo.totalCost}g</strong>
              </div>
              <div className="travel-confirm-row travel-confirm-row--after">
                <span>Gold after</span>
                <strong className={pendingInfo.goldAfter < 0 ? 'cost' : 'gain'}>
                  {pendingInfo.goldAfter}g
                </strong>
              </div>
            </div>

            <div className="trade-confirm-dialog__actions">
              <button type="button" className="ghost" onClick={() => setPendingTravelTown(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={pendingInfo.goldAfter < 0}
                onClick={confirmTravel}
              >
                Depart →
              </button>
            </div>
            {pendingInfo.goldAfter < 0 && (
              <p className="travel-confirm-dialog__cant-afford">Not enough gold for this journey.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

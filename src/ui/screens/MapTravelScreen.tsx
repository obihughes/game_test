import { useMemo, useState, type CSSProperties } from 'react'
import { findRoute, ROUTES, TOWNS, type Town } from '@/game/world/index.ts'
import { MAP_POSITIONS } from '@/content/mapLayout.ts'
import { MapLocationGlyph } from '@/ui/icons/LocationPixelIcon.tsx'
import { mapTheme } from '@/ui/map/mapTheme.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { travelDaysFor } from '@/game/caravan/horses.ts'
import { useGameStore } from '@/store/gameStore.ts'
import styles from '@/ui/map/map.module.css'

export function MapTravelScreen() {
  const game = useGameStore((s) => s.game)
  const travelTo = useGameStore((s) => s.travelTo)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const [hoveredTown, setHoveredTown] = useState<string | null>(null)

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

  const hoveredInfo = useMemo(() => {
    if (!hoveredTown || hoveredTown === game.location) return null
    const route = findRoute(game.location, hoveredTown)
    if (!route) return null
    const days = travelDaysFor(route.baseDays, game.caravan.horses)
    const name = TOWNS[hoveredTown]?.name ?? hoveredTown
    const story = getLocationStory(hoveredTown)
    return { name, days, toll: route.toll, story }
  }, [hoveredTown, game.location, game.caravan.horses])

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Map</h2>
        <p className="muted">Click a connected town to travel.</p>
      </header>
      {lastError ? (
        <p className="error" role="alert">
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}

      <div style={{ position: 'relative' }}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          role="img"
          aria-label="World map"
          style={
            {
              '--map-road': mapTheme.road,
              '--map-label': mapTheme.label,
            } as CSSProperties
          }
        >
          {edges.map((e) => {
            const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
            const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
            if (!a || !b) return null
            return (
              <line
                key={`${e.from}-${e.to}`}
                className={styles.road}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
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
                  r={7.5}
                  fill="rgba(0,0,0,0.02)"
                  opacity={dim ? 0.45 : isHovered ? 0.8 : 1}
                  style={{
                    cursor: canGo && !here ? 'pointer' : 'default',
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() => {
                    if (canGo && !here) travelTo(t.id)
                  }}
                  onMouseEnter={() => {
                    if (canGo && !here) setHoveredTown(t.id)
                  }}
                  onMouseLeave={() => setHoveredTown(null)}
                />
                <g style={{ pointerEvents: 'none' as const }} opacity={dim ? 0.45 : 1}>
                  <MapLocationGlyph townId={t.id} x={pos.x} y={pos.y} size={here ? 8.5 : isHovered && canGo && !here ? 7.5 : 6.5} />
                </g>
                <text className={styles.label} x={pos.x} y={pos.y - 12}>
                  {t.name}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredInfo && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(0, 0, 0, 0.85)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: 10,
              pointerEvents: 'none',
              maxWidth: '200px',
            }}
          >
            <strong>{hoveredInfo.name}</strong>
            <div style={{ marginTop: '4px', color: '#ccc', fontSize: '12px' }}>
              {hoveredInfo.days} day{hoveredInfo.days === 1 ? '' : 's'} · Toll {hoveredInfo.toll} gold
            </div>
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#aaa' }}>{hoveredInfo.story}</p>
          </div>
        )}
      </div>
    </section>
  )
}

import { CART_TIERS, tierConfig } from '@/game/caravan/cartTiers.ts'
import { HORSE_COST, maxHorsesForCart } from '@/game/caravan/horses.ts'
import { HIRE_COST, HIRE_LABEL, HIRE_UPKEEP_PER_DAY } from '@/game/caravan/hires.ts'
import { cargoWeight, maxCargoWeight } from '@/game/caravan/capacity.ts'
import { GOODS, GOOD_IDS } from '@/game/economy/index.ts'
import { GoodIcon } from '@/ui/icons/GoodIcon.tsx'
import { useGameStore } from '@/store/gameStore.ts'
import type { HireRole } from '@/game/core/types.ts'

const hireRoles: HireRole[] = ['guard', 'scout']

export function CaravanScreen() {
  const game = useGameStore((s) => s.game)
  const upgradeCart = useGameStore((s) => s.upgradeCart)
  const purchaseHorse = useGameStore((s) => s.purchaseHorse)
  const hire = useGameStore((s) => s.hire)
  const dismissHire = useGameStore((s) => s.dismissHire)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)

  const tier = tierConfig(game.caravan.cartTier)
  const nextTier = CART_TIERS[game.caravan.cartTier + 1]
  const cap = maxCargoWeight(game)
  const used = cargoWeight(game)
  const horseCap = maxHorsesForCart(game.caravan.cartTier)
  const cargoLines = GOOD_IDS.filter((id) => (game.inventory[id] ?? 0) > 0)

  const capPct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Caravan</h2>
        <p className="muted">
          Wagon: <strong style={{ color: '#e8dcc8' }}>{tier.label}</strong> · {game.caravan.horses} horse{game.caravan.horses !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Capacity bar */}
      <div className="capacity-bar-wrap">
        <div className="capacity-bar-labels">
          <span className="capacity-bar-label">Cargo weight</span>
          <span className="capacity-bar-label capacity-bar-label--right">
            <strong style={{ color: capPct >= 90 ? '#c97a6a' : capPct >= 70 ? '#c9a66b' : '#8fbc7a' }}>{used}</strong>
            <span className="muted"> / {cap}</span>
          </span>
        </div>
        <div className="capacity-bar" aria-label={`${capPct}% full`}>
          <div
            className="capacity-bar__fill"
            style={{
              width: `${capPct}%`,
              background: capPct >= 90 ? '#8b3a3a' : capPct >= 70 ? '#7a5a20' : '#3a6a2a',
            }}
          />
        </div>
      </div>
      {cargoLines.length > 0 ? (
        <div className="caravan-cargo-summary">
          <h3 className="caravan-cargo-summary__title">Cargo</h3>
          <ul className="caravan-cargo-list">
            {cargoLines.map((id) => {
              const g = GOODS[id]!
              const n = game.inventory[id] ?? 0
              return (
                <li key={id} className="caravan-cargo-row">
                  <GoodIcon goodId={id} size={20} className="caravan-cargo-row__icon" />
                  <span className="caravan-cargo-row__name">{g.name}</span>
                  <span className="caravan-cargo-row__qty muted small">
                    ×{n} · {g.weightPerUnit * n} wt
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="muted caravan-cargo-empty">Your wagon is empty — buy goods at the Market.</p>
      )}
      {lastError ? (
        <p className="error" role="alert">
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}
      <div className="caravan-actions">
        {nextTier ? (
          <button type="button" onClick={() => upgradeCart()}>
            Upgrade to {nextTier.label} ({nextTier.upgradeCost} gold)
          </button>
        ) : (
          <p className="muted">Wagon is fully upgraded.</p>
        )}
        <button type="button" onClick={() => purchaseHorse()} disabled={game.caravan.horses >= horseCap}>
          Buy horse ({HORSE_COST} gold) — {game.caravan.horses}/{horseCap}
        </button>
      </div>
      <h3>Hires</h3>
      <ul className="hire-list">
        {hireRoles.map((role) => (
          <li key={role}>
            <span>
              {HIRE_LABEL[role]} — {HIRE_COST[role]} gold upfront
            </span>
            <span className="muted small hire-row__upkeep">
              {game.caravan.hires[role]! > 0 ? (
                <>
                  Hired · {HIRE_UPKEEP_PER_DAY[role]} gold/day while traveling
                </>
              ) : (
                'Available'
              )}
            </span>
            {game.caravan.hires[role]! > 0 ? (
              <button type="button" className="ghost" onClick={() => dismissHire(role)}>
                Dismiss
              </button>
            ) : (
              <button type="button" onClick={() => hire(role)}>
                Hire
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
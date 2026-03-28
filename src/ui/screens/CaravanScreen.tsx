import { CART_TIERS, tierConfig } from '@/game/caravan/cartTiers.ts'
import { HORSE_COST, maxHorsesForCart } from '@/game/caravan/horses.ts'
import { HIRE_COST, HIRE_LABEL } from '@/game/caravan/hires.ts'
import { cargoWeight, maxCargoWeight } from '@/game/caravan/capacity.ts'
import { useGameStore } from '@/store/gameStore.ts'
import type { HireRole } from '@/game/core/types.ts'

const hireRoles: HireRole[] = ['guard', 'scout']

export function CaravanScreen() {
  const game = useGameStore((s) => s.game)
  const upgradeCart = useGameStore((s) => s.upgradeCart)
  const purchaseHorse = useGameStore((s) => s.purchaseHorse)
  const hire = useGameStore((s) => s.hire)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)

  const tier = tierConfig(game.caravan.cartTier)
  const nextTier = CART_TIERS[game.caravan.cartTier + 1]
  const cap = maxCargoWeight(game)
  const used = cargoWeight(game)
  const horseCap = maxHorsesForCart(game.caravan.cartTier)

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Caravan</h2>
        <p className="muted">
          Wagon: {tier.label} · Capacity {used} / {cap}
        </p>
      </header>
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
              {HIRE_LABEL[role]} — {HIRE_COST[role]} gold
            </span>
            <span className="muted small">
              {game.caravan.hires[role]! > 0 ? 'Hired' : 'Available'}
            </span>
            <button type="button" disabled={game.caravan.hires[role]! > 0} onClick={() => hire(role)}>
              Hire
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
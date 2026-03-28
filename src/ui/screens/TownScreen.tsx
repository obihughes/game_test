import { useState } from 'react'
import { GOODS, GOOD_IDS } from '@/game/economy/index.ts'
import { PRICES_BY_TOWN } from '@/game/economy/prices.ts'
import { getDialog } from '@/content/dialog/dialog.ts'
import { spareCapacity } from '@/game/caravan/capacity.ts'
import { useGameStore } from '@/store/gameStore.ts'
import type { GoodId } from '@/game/core/types.ts'

export function TownScreen() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buy)
  const sell = useGameStore((s) => s.sell)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const [qty, setQty] = useState(1)

  const townPrices = PRICES_BY_TOWN[game.location]
  const spare = spareCapacity(game)

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Market</h2>
        <p className="muted">{getDialog('ui_welcome')}</p>
      </header>
      {lastError ? (
        <p className="error" role="alert">
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}
      <p className="stat-line">
        Cargo: <strong>{spare}</strong> spare weight · Gold: <strong>{game.gold}</strong>
      </p>
      <div className="qty-row">
        <label>
          Trade quantity{' '}
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>
      <ul className="goods-list">
        {GOOD_IDS.map((id) => {
          const g = GOODS[id]!
          const row = townPrices[id]
          const inv = game.inventory[id] ?? 0
          if (!row) return null
          return (
            <li key={id} className="goods-row">
              <div>
                <strong>{g.name}</strong>
                <div className="muted small">{getDialog(g.dialogFlavorId)}</div>
              </div>
              <div className="prices">
                Buy {row.buy} · Sell {row.sell}
              </div>
              <div className="inv">Stock: {inv}</div>
              <div className="actions">
                <button type="button" onClick={() => buy(id as GoodId, qty)}>
                  Buy
                </button>
                <button type="button" onClick={() => sell(id as GoodId, qty)}>
                  Sell
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
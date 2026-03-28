import { useEffect, useState } from 'react'
import { GOODS, GOOD_IDS } from '@/game/economy/index.ts'
import { merchantDef, merchantsForTown, priceRowFor } from '@/game/economy/merchants.ts'
import { getDialog } from '@/content/dialog/dialog.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { spareCapacity } from '@/game/caravan/capacity.ts'
import { TOWNS } from '@/game/world/index.ts'
import { LocationPixelIcon } from '@/ui/icons/LocationPixelIcon.tsx'
import { GoodIcon } from '@/ui/icons/GoodIcon.tsx'
import { useGameStore } from '@/store/gameStore.ts'
import type { GoodId } from '@/game/core/types.ts'

export function TownScreen() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buy)
  const sell = useGameStore((s) => s.sell)
  const setActiveMerchant = useGameStore((s) => s.setActiveMerchant)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const [qty, setQty] = useState(1)

  const merchants = merchantsForTown(game.location)
  const active = merchantDef(game.location, game.activeMerchantId) ?? merchants[0]

  useEffect(() => {
    const list = merchantsForTown(game.location)
    if (!list.length) return
    if (!merchantDef(game.location, game.activeMerchantId)) {
      setActiveMerchant(list[0]!.id)
    }
  }, [game.location, game.activeMerchantId, setActiveMerchant])

  const spare = spareCapacity(game)
  const townName = TOWNS[game.location]?.name ?? game.location
  const story = getLocationStory(game.location)

  const catalogEntries = active
    ? (Object.keys(active.catalog) as GoodId[])
        .sort((a, b) => GOOD_IDS.indexOf(a) - GOOD_IDS.indexOf(b))
        .map((id) => {
          const row = active.catalog[id]
          return row ? { id, row } : null
        })
        .filter(Boolean) as { id: GoodId; row: { buy: number; sell: number } }[]
    : []

  const cargoGoods: GoodId[] = GOOD_IDS.filter((id) => (game.inventory[id] ?? 0) > 0)

  return (
    <section className="market-screen">
      <div className="market-screen__header">
        <div className="market-screen__title-bar">
          <LocationPixelIcon className="pixel-icon" townId={game.location} size={40} />
          <div className="market-screen__title-text">
            <h2>{townName}</h2>
            <p className="market-screen__story">{story}</p>
          </div>
        </div>

        <div className="market-screen__stats">
          <span>
            Gold: <strong>{game.gold}</strong>
          </span>
          <span>
            Cargo: <strong>{spare}</strong> spare
          </span>
        </div>

        {lastError && (
          <p className="market-screen__error" role="alert">
            {lastError}{' '}
            <button type="button" className="linkish" onClick={() => clearError()}>
              Dismiss
            </button>
          </p>
        )}
      </div>

      <div className="market-screen__merchant-select">
        <label className="merchant-select__label">Trading with:</label>
        <select
          className="merchant-select__dropdown"
          value={active?.id ?? ''}
          onChange={(e) => setActiveMerchant(e.target.value)}
        >
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="market-screen__qty-control">
        <label className="qty-control__label">Quantity:</label>
        <input
          type="number"
          className="qty-control__input"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      <div className="market-screen__content">
        <div className="market-column market-column--catalog">
          <h3 className="market-column__title">Available</h3>
          {catalogEntries.length === 0 ? (
            <p className="market-column__empty">Nothing in stock.</p>
          ) : (
            <ul className="trade-list">
              {catalogEntries.map(({ id, row }) => {
                const g = GOODS[id]!
                return (
                  <li key={id} className="trade-row">
                    <div className="trade-row__item">
                      <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                      <div className="trade-row__name">
                        <strong>{g.name}</strong>
                        <span className="trade-row__flavor muted small">{getDialog(g.dialogFlavorId)}</span>
                      </div>
                    </div>
                    <div className="trade-row__prices">
                      <span className="trade-row__price">
                        Buy: <strong>{row.buy}</strong>
                      </span>
                      <span className="trade-row__price">
                        Sell: <strong>{row.sell}</strong>
                      </span>
                    </div>
                    <button type="button" className="trade-row__btn trade-row__btn--buy" onClick={() => buy(id as GoodId, qty)}>
                      Buy
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="market-column market-column--cargo">
          <h3 className="market-column__title">Your cargo</h3>
          {cargoGoods.length === 0 ? (
            <p className="market-column__empty">Empty.</p>
          ) : (
            <ul className="trade-list">
              {cargoGoods.map((id) => {
                const g = GOODS[id]!
                const count = game.inventory[id] ?? 0
                const row = active ? priceRowFor(game.location, active.id, id) : undefined
                const w = g.weightPerUnit * count
                return (
                  <li key={id} className="trade-row">
                    <div className="trade-row__item">
                      <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                      <div className="trade-row__name">
                        <strong>{g.name}</strong>
                        <span className="trade-row__flavor muted small">×{count} · {w} wt</span>
                      </div>
                    </div>
                    {row ? (
                      <>
                        <div className="trade-row__prices">
                          <span className="trade-row__price">
                            Sell: <strong>{row.sell}</strong>
                          </span>
                        </div>
                        <button type="button" className="trade-row__btn trade-row__btn--sell" onClick={() => sell(id as GoodId, qty)}>
                          Sell
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="trade-row__prices">
                          <span className="trade-row__price muted small">Not buying</span>
                        </div>
                        <div className="trade-row__btn trade-row__btn--disabled">—</div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

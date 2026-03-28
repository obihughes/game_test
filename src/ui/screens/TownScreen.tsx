import { useEffect, useId, useState } from 'react'
import { averageInventoryBuyPrice, GOODS, GOOD_IDS } from '@/game/economy/index.ts'
import {
  effectivePriceRow,
  isLocalDeal,
  merchantDef,
  merchantsForTown,
} from '@/game/economy/merchants.ts'
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
  const confirmTitleId = useId()
  const confirmBodyId = useId()
  const [pendingTrade, setPendingTrade] = useState<
    | null
    | {
        kind: 'buy' | 'sell'
        goodId: GoodId
        qty: number
        unitGold: number
        totalGold: number
      }
  >(null)

  const merchants = merchantsForTown(game.location)
  const active = merchantDef(game.location, game.activeMerchantId) ?? merchants[0]

  useEffect(() => {
    const list = merchantsForTown(game.location)
    if (!list.length) return
    if (!merchantDef(game.location, game.activeMerchantId)) {
      setActiveMerchant(list[0]!.id)
    }
  }, [game.location, game.activeMerchantId, setActiveMerchant])

  useEffect(() => {
    if (!pendingTrade) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPendingTrade(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pendingTrade])

  const spare = spareCapacity(game)
  const townName = TOWNS[game.location]?.name ?? game.location
  const story = getLocationStory(game.location)

  const catalogEntries = active
    ? (Object.keys(active.catalog) as GoodId[])
        .sort((a, b) => GOOD_IDS.indexOf(a) - GOOD_IDS.indexOf(b))
        .map((id) => {
          const row = effectivePriceRow(game.location, active.id, id, game.day)
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
        <div className="merchant-select__row">
          <label className="merchant-select__label">Trading with:</label>
          <select
            className="merchant-select__dropdown"
            value={active?.id ?? ''}
            onChange={(e) => setActiveMerchant(e.target.value)}
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.roleLabel} — {m.label}
              </option>
            ))}
          </select>
        </div>
        {active ? (
          <p className="merchant-select__hint muted small">
            <strong>{active.roleLabel}</strong> — {active.tagline}
          </p>
        ) : null}
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
        <div className="qty-presets" aria-label="Quick quantity presets">
          {([1, 5, 10, 25] as const).map((n) => (
            <button
              key={n}
              type="button"
              className={qty === n ? 'qty-preset qty-preset--active' : 'qty-preset'}
              onClick={() => setQty(n)}
            >
              {n}
            </button>
          ))}
        </div>
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
                      {active && isLocalDeal(game.location, active.id, id, game.day) ? (
                        <span className="trade-row__badge" title="Below typical market buy price today">
                          Local deal
                        </span>
                      ) : null}
                      <span className="trade-row__price">
                        Buy: <strong>{row.buy}</strong>
                      </span>
                      <span className="trade-row__price">
                        Sell: <strong>{row.sell}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="trade-row__btn trade-row__btn--buy"
                      onClick={() =>
                        setPendingTrade({
                          kind: 'buy',
                          goodId: id,
                          qty,
                          unitGold: row.buy,
                          totalGold: row.buy * qty,
                        })
                      }
                    >
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
                const row = active ? effectivePriceRow(game.location, active.id, id, game.day) : undefined
                const w = g.weightPerUnit * count
                const avgBuy = averageInventoryBuyPrice(game, id)
                const sellDelta =
                  row && avgBuy !== null ? Math.round((row.sell - avgBuy) * 10) / 10 : null
                return (
                  <li key={id} className="trade-row">
                    <div className="trade-row__item">
                      <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                      <div className="trade-row__name">
                        <strong>{g.name}</strong>
                        <span className="trade-row__flavor muted small">×{count} · {w} wt</span>
                        {avgBuy !== null ? (
                          <span className="trade-row__flavor trade-row__avg-buy muted small">
                            Avg buy: <strong>{avgBuy === Math.floor(avgBuy) ? avgBuy : avgBuy.toFixed(1)}</strong>
                          </span>
                        ) : (
                          <span className="trade-row__flavor muted small">Avg buy: —</span>
                        )}
                      </div>
                    </div>
                    {row ? (
                      <>
                        <div className="trade-row__prices">
                          <span className="trade-row__price">
                            Sell: <strong>{row.sell}</strong>
                          </span>
                          {sellDelta !== null ? (
                            <span
                              className={
                                sellDelta >= 0
                                  ? 'trade-row__vs-avg trade-row__vs-avg--up'
                                  : 'trade-row__vs-avg trade-row__vs-avg--down'
                              }
                            >
                              {sellDelta >= 0 ? '+' : ''}
                              {sellDelta === Math.floor(sellDelta) ? sellDelta : sellDelta.toFixed(1)} vs avg
                            </span>
                          ) : null}
                        </div>
                        <div className="trade-row__sell-actions">
                          <button
                            type="button"
                            className="trade-row__btn trade-row__btn--sell"
                            onClick={() =>
                              setPendingTrade({
                                kind: 'sell',
                                goodId: id,
                                qty,
                                unitGold: row.sell,
                                totalGold: row.sell * qty,
                              })
                            }
                          >
                            Sell
                          </button>
                          <button
                            type="button"
                            className="trade-row__btn trade-row__btn--sell-all ghost small"
                            title={`Sell all ${count} at ${row.sell} each`}
                            onClick={() =>
                              setPendingTrade({
                                kind: 'sell',
                                goodId: id,
                                qty: count,
                                unitGold: row.sell,
                                totalGold: row.sell * count,
                              })
                            }
                          >
                            Sell all
                          </button>
                        </div>
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

      {pendingTrade ? (
        <div
          className="trade-confirm-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPendingTrade(null)
          }}
        >
          <div
            className="trade-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmBodyId}
          >
            <h3 id={confirmTitleId} className="trade-confirm-dialog__title">
              {pendingTrade.kind === 'buy' ? 'Confirm purchase' : 'Confirm sale'}
            </h3>
            <p id={confirmBodyId} className="trade-confirm-dialog__body">
              {pendingTrade.kind === 'buy' ? (
                <>
                  Buy <strong>{pendingTrade.qty}</strong> × {GOODS[pendingTrade.goodId]!.name} at{' '}
                  <strong>{pendingTrade.unitGold}</strong> each?
                  <br />
                  <span className="trade-confirm-dialog__total">Total: {pendingTrade.totalGold} gold</span>
                </>
              ) : (
                <>
                  Sell <strong>{pendingTrade.qty}</strong> × {GOODS[pendingTrade.goodId]!.name} at{' '}
                  <strong>{pendingTrade.unitGold}</strong> each?
                  <br />
                  <span className="trade-confirm-dialog__total">You receive: {pendingTrade.totalGold} gold</span>
                </>
              )}
            </p>
            <div className="trade-confirm-dialog__actions">
              <button type="button" className="ghost" onClick={() => setPendingTrade(null)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = pendingTrade
                  setPendingTrade(null)
                  if (p.kind === 'buy') buy(p.goodId, p.qty)
                  else sell(p.goodId, p.qty)
                }}
              >
                {pendingTrade.kind === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

import { useEffect, useId, useState } from 'react'
import { averageInventoryBuyPrice, GOODS, GOOD_IDS } from '@/game/economy/index.ts'
import {
  effectivePriceRow,
  isLocalDeal,
  merchantDef,
  merchantsForTown,
} from '@/game/economy/merchants.ts'
import { getPriceTrendDirection, trendArrow, getPriceTrend } from '@/game/economy/priceHistory.ts'
import { getSeasonModifierLabel } from '@/game/world/seasons.ts'
import { getDialog } from '@/content/dialog/dialog.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { spareCapacity, cargoWeight, maxCargoWeight } from '@/game/caravan/capacity.ts'
import { TOWNS } from '@/game/world/index.ts'
import { LocationPixelIcon } from '@/ui/icons/LocationPixelIcon.tsx'
import { GoodIcon } from '@/ui/icons/GoodIcon.tsx'
import { useGameStore, type CartItem } from '@/store/gameStore.ts'
import {
  WAREHOUSE_BUILD_COST,
  WAREHOUSE_UPGRADE_COST,
  PROCESSING_RECIPES,
  getWarehouseCapacity,
  getWarehouseUsed,
} from '@/game/investments/warehouse.ts'
import type { GoodId } from '@/game/core/types.ts'

type MarketTab = 'market' | 'warehouse'

export function TownScreen() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buy)
  const sell = useGameStore((s) => s.sell)
  const executeBatch = useGameStore((s) => s.executeBatch)
  const setActiveMerchant = useGameStore((s) => s.setActiveMerchant)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const buildWarehouse = useGameStore((s) => s.buildWarehouse)
  const upgradeWarehouse = useGameStore((s) => s.upgradeWarehouse)
  const depositGoods = useGameStore((s) => s.depositGoods)
  const withdrawGoods = useGameStore((s) => s.withdrawGoods)
  const processRecipe = useGameStore((s) => s.processRecipe)

  const [qty, setQty] = useState(1)
  const [marketTab, setMarketTab] = useState<MarketTab>('market')
  const [showLore, setShowLore] = useState(false)
  const [whQty, setWhQty] = useState<Record<string, number>>({})
  const confirmTitleId = useId()
  const confirmBodyId = useId()

  // Single-item confirm (for qty > 1 or explicit confirmation)
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

  // Cart: staged items before checkout
  const [cart, setCart] = useState<CartItem[]>([])
  const [hoveredSparkline, setHoveredSparkline] = useState<string | null>(null)

  const merchants = merchantsForTown(game.location)
  const active = merchantDef(game.location, game.activeMerchantId) ?? merchants[0]

  useEffect(() => {
    const list = merchantsForTown(game.location)
    if (!list.length) return
    if (!merchantDef(game.location, game.activeMerchantId)) {
      setActiveMerchant(list[0]!.id)
    }
  }, [game.location, game.activeMerchantId, setActiveMerchant])

  // Clear cart when switching towns
  useEffect(() => {
    setCart([])
  }, [game.location])

  useEffect(() => {
    if (!pendingTrade) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPendingTrade(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pendingTrade])

  const spare = spareCapacity(game)
  const currentWeight = cargoWeight(game)
  const maxWeight = maxCargoWeight(game)
  const townName = TOWNS[game.location]?.name ?? game.location
  const story = getLocationStory(game.location)
  const warehouse = game.townWarehouses[game.location]

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

  function maxBuyQty(goodId: GoodId, buyPrice: number): number {
    const g = GOODS[goodId]!
    const byGold = buyPrice > 0 ? Math.floor(game.gold / buyPrice) : 999
    const byWeight = g.weightPerUnit > 0 ? Math.floor(spare / g.weightPerUnit) : 999
    return Math.max(0, Math.min(byGold, byWeight))
  }

  function getWhQty(key: string, max: number): number {
    return Math.min(Math.max(1, whQty[key] ?? 1), max)
  }

  function setWhQtyFor(key: string, val: number) {
    setWhQty((prev) => ({ ...prev, [key]: val }))
  }

  // Cart helpers
  function cartBuyTotal(): number {
    return cart
      .filter((i) => i.kind === 'buy')
      .reduce((sum, i) => {
        const row = active ? effectivePriceRow(game.location, active.id, i.goodId, game.day) : undefined
        return sum + (row ? row.buy * i.qty : 0)
      }, 0)
  }

  function cartSellTotal(): number {
    return cart
      .filter((i) => i.kind === 'sell')
      .reduce((sum, i) => {
        const row = active ? effectivePriceRow(game.location, active.id, i.goodId, game.day) : undefined
        return sum + (row ? row.sell * i.qty : 0)
      }, 0)
  }

  function cartWeightDelta(): number {
    return cart.reduce((sum, i) => {
      const g = GOODS[i.goodId]
      if (!g) return sum
      const delta = g.weightPerUnit * i.qty
      return i.kind === 'buy' ? sum + delta : sum - delta
    }, 0)
  }

  function addToCart(kind: 'buy' | 'sell', goodId: GoodId, itemQty: number) {
    setCart((prev) => {
      const existing = prev.findIndex((c) => c.goodId === goodId && c.kind === kind)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing]!, qty: updated[existing]!.qty + itemQty }
        return updated
      }
      return [...prev, { goodId, qty: itemQty, kind }]
    })
  }

  function removeFromCart(goodId: GoodId, kind: 'buy' | 'sell') {
    setCart((prev) => prev.filter((c) => !(c.goodId === goodId && c.kind === kind)))
  }

  function updateCartQty(goodId: GoodId, kind: 'buy' | 'sell', newQty: number) {
    if (newQty <= 0) {
      removeFromCart(goodId, kind)
      return
    }
    setCart((prev) =>
      prev.map((c) => (c.goodId === goodId && c.kind === kind ? { ...c, qty: newQty } : c)),
    )
  }

  function handleBuyClick(goodId: GoodId, buyPrice: number) {
    if (qty === 1) {
      // Direct execute, no confirm
      buy(goodId, 1)
    } else {
      setPendingTrade({ kind: 'buy', goodId, qty, unitGold: buyPrice, totalGold: buyPrice * qty })
    }
  }

  function handleSellClick(goodId: GoodId, sellPrice: number, sellQty: number) {
    if (sellQty === 1) {
      sell(goodId, 1)
    } else {
      setPendingTrade({ kind: 'sell', goodId, qty: sellQty, unitGold: sellPrice, totalGold: sellPrice * sellQty })
    }
  }

  function handleSellAllClick(goodId: GoodId, sellPrice: number, count: number) {
    if (count === 1) {
      sell(goodId, 1)
    } else {
      setPendingTrade({ kind: 'sell', goodId, qty: count, unitGold: sellPrice, totalGold: sellPrice * count })
    }
  }

  const cartBuy = cartBuyTotal()
  const cartSell = cartSellTotal()
  const cartWt = cartWeightDelta()
  const goldAfterCart = game.gold - cartBuy + cartSell
  const weightAfterCart = currentWeight + cartWt
  const canCheckout = cart.length > 0 && goldAfterCart >= 0 && weightAfterCart <= maxWeight

  return (
    <section className="market-screen">
      <div className="market-screen__header">
        <div className="market-screen__title-bar">
          <LocationPixelIcon className="pixel-icon" townId={game.location} size={36} />
          <div className="market-screen__title-text">
            <div className="market-screen__title-row">
              <h2>{townName}</h2>
              {story && (
                <button
                  type="button"
                  className="lore-btn"
                  title="Town lore"
                  onClick={() => setShowLore((v) => !v)}
                  aria-expanded={showLore}
                >
                  📜
                </button>
              )}
            </div>
          </div>
          <div className="market-screen__stats">
            <span className="stat-pill stat-pill--weight">
              <span className="stat-pill__label">Cargo</span>
              <strong>{currentWeight}</strong>
              <span className="stat-pill__sep">/</span>
              <span>{maxWeight}</span>
            </span>
            <span className="stat-pill stat-pill--spare">
              <span className="stat-pill__label">Spare</span>
              <strong>{spare}</strong>
            </span>
          </div>
        </div>

        {showLore && story && (
          <p className="market-screen__story market-screen__story--expanded">{story}</p>
        )}

        {lastError && (
          <p className="market-screen__error" role="alert">
            {lastError}{' '}
            <button type="button" className="linkish" onClick={() => clearError()}>
              Dismiss
            </button>
          </p>
        )}
      </div>

      {/* Tab switcher */}
      <div className="market-tabs">
        <button
          type="button"
          className={marketTab === 'market' ? 'market-tab market-tab--active' : 'market-tab'}
          onClick={() => setMarketTab('market')}
        >
          🏪 Market
        </button>
        <button
          type="button"
          className={marketTab === 'warehouse' ? 'market-tab market-tab--active' : 'market-tab'}
          onClick={() => setMarketTab('warehouse')}
        >
          🏗️ Warehouse {warehouse ? `(Lv${warehouse.level})` : ''}
        </button>
      </div>

      {marketTab === 'market' ? (
        <>
          {/* Merchant card selector */}
          <div className="merchant-cards">
            {merchants.map((m) => (
              <button
                key={m.id}
                type="button"
                className={
                  active?.id === m.id
                    ? 'merchant-card merchant-card--active'
                    : 'merchant-card'
                }
                onClick={() => setActiveMerchant(m.id)}
              >
                <span className="merchant-card__icon">{m.icon}</span>
                <span className="merchant-card__info">
                  <span className="merchant-card__role">{m.roleLabel}</span>
                  <span className="merchant-card__name">{m.label}</span>
                </span>
              </button>
            ))}
          </div>

          {active ? (
            <p className="merchant-tagline muted small">{active.tagline}</p>
          ) : null}

          {/* Quantity control */}
          <div className="market-screen__qty-control">
            <label className="qty-control__label">Qty:</label>
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
            <span className="qty-control__hint muted small">
              {qty === 1 ? 'Single buys/sells are instant' : 'Or add to cart for multi-item checkout'}
            </span>
          </div>

          <div className="market-screen__content">
            {/* Available to buy */}
            <div className="market-column market-column--catalog">
              <h3 className="market-column__title">Available to buy</h3>
              {catalogEntries.length === 0 ? (
                <p className="market-column__empty">Nothing in stock.</p>
              ) : (
                <ul className="trade-list">
                  {catalogEntries.map(({ id, row }) => {
                    const g = GOODS[id]!
                    const trend = active
                      ? getPriceTrendDirection(game.location, active.id, id, game.day)
                      : 'flat'
                    const seasonLabel = getSeasonModifierLabel(id, game.day)
                    const maxQty = maxBuyQty(id, row.buy)
                    const sparklineData = active
                      ? getPriceTrend(game.location, active.id, id, game.day, 7)
                      : []
                    const sparklineKey = `buy-${id}`
                    const inCart = cart.find((c) => c.goodId === id && c.kind === 'buy')
                    return (
                      <li key={id} className={`trade-row${inCart ? ' trade-row--in-cart' : ''}`}>
                        <div className="trade-row__item">
                          <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                          <div className="trade-row__name">
                            <strong>{g.name}</strong>
                            <span className="trade-row__flavor muted small">{getDialog(g.dialogFlavorId)}</span>
                            <span className="trade-row__flavor muted small">{g.weightPerUnit} wt/unit</span>
                          </div>
                        </div>
                        <div className="trade-row__prices">
                          <div className="trade-row__price-line">
                            {active && isLocalDeal(game.location, active.id, id, game.day) ? (
                              <span className="trade-row__badge" title="Below typical market buy price today">
                                Deal
                              </span>
                            ) : null}
                            {seasonLabel ? (
                              <span
                                className={
                                  seasonLabel.startsWith('+')
                                    ? 'trade-row__season-badge trade-row__season-badge--up'
                                    : 'trade-row__season-badge trade-row__season-badge--down'
                                }
                                title="Season price modifier"
                              >
                                {seasonLabel}
                              </span>
                            ) : null}
                          </div>
                          <span className="trade-row__price">
                            Buy:{' '}
                            <strong>{row.buy}</strong>g
                            <span
                              className={`trade-row__trend trade-row__trend--${trend}`}
                              title={`Price trend: ${trend}`}
                              onMouseEnter={() => setHoveredSparkline(sparklineKey)}
                              onMouseLeave={() => setHoveredSparkline(null)}
                            >
                              {trendArrow(trend)}
                            </span>
                          </span>
                          {hoveredSparkline === sparklineKey && sparklineData.length > 1 ? (
                            <Sparkline data={sparklineData.map((p) => p.buy)} />
                          ) : null}
                        </div>
                        <div className="trade-row__buy-actions">
                          <button
                            type="button"
                            className="trade-row__btn trade-row__btn--buy"
                            disabled={maxQty <= 0}
                            title={qty === 1 ? 'Buy 1 instantly' : `Buy ${qty} (confirm)`}
                            onClick={() => handleBuyClick(id, row.buy)}
                          >
                            Buy {qty === 1 ? '1' : `×${qty}`}
                          </button>
                          {maxQty > 1 ? (
                            <button
                              type="button"
                              className="trade-row__btn trade-row__btn--buy ghost small"
                              title={`Add ${qty} to cart`}
                              onClick={() => addToCart('buy', id, qty)}
                            >
                              + Cart
                            </button>
                          ) : null}
                          {maxQty > 0 ? (
                            <button
                              type="button"
                              className="trade-row__btn trade-row__btn--buy ghost small"
                              title={`Buy max (${maxQty})`}
                              onClick={() => {
                                setQty(maxQty)
                                setPendingTrade({
                                  kind: 'buy',
                                  goodId: id,
                                  qty: maxQty,
                                  unitGold: row.buy,
                                  totalGold: row.buy * maxQty,
                                })
                              }}
                            >
                              Max {maxQty}
                            </button>
                          ) : null}
                        </div>
                        {inCart ? (
                          <div className="trade-row__cart-badge">
                            🛒 ×{inCart.qty} in cart
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Your cargo */}
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
                    const trend = active
                      ? getPriceTrendDirection(game.location, active.id, id, game.day)
                      : 'flat'
                    const seasonLabel = getSeasonModifierLabel(id, game.day)
                    const sparklineData = active
                      ? getPriceTrend(game.location, active.id, id, game.day, 7)
                      : []
                    const sparklineKey = `sell-${id}`
                    const inCart = cart.find((c) => c.goodId === id && c.kind === 'sell')
                    return (
                      <li key={id} className={`trade-row${inCart ? ' trade-row--in-cart' : ''}`}>
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
                              {seasonLabel ? (
                                <span
                                  className={
                                    seasonLabel.startsWith('+')
                                      ? 'trade-row__season-badge trade-row__season-badge--up'
                                      : 'trade-row__season-badge trade-row__season-badge--down'
                                  }
                                >
                                  {seasonLabel}
                                </span>
                              ) : null}
                              <span className="trade-row__price">
                                Sell:{' '}
                                <strong>{row.sell}</strong>g
                                <span
                                  className={`trade-row__trend trade-row__trend--${trend}`}
                                  title={`Price trend: ${trend}`}
                                  onMouseEnter={() => setHoveredSparkline(sparklineKey)}
                                  onMouseLeave={() => setHoveredSparkline(null)}
                                >
                                  {trendArrow(trend)}
                                </span>
                              </span>
                              {hoveredSparkline === sparklineKey && sparklineData.length > 1 ? (
                                <Sparkline data={sparklineData.map((p) => p.sell)} />
                              ) : null}
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
                                title={qty === 1 ? 'Sell 1 instantly' : `Sell ${qty} (confirm)`}
                                onClick={() => handleSellClick(id, row.sell, qty)}
                              >
                                Sell {qty === 1 ? '1' : `×${qty}`}
                              </button>
                              <button
                                type="button"
                                className="trade-row__btn trade-row__btn--sell ghost small"
                                title={`Add ${qty} to cart`}
                                onClick={() => addToCart('sell', id, qty)}
                              >
                                + Cart
                              </button>
                              <button
                                type="button"
                                className="trade-row__btn trade-row__btn--sell ghost small"
                                title={`Sell all ${count} at ${row.sell} each`}
                                onClick={() => handleSellAllClick(id, row.sell, count)}
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
                        {inCart ? (
                          <div className="trade-row__cart-badge trade-row__cart-badge--sell">
                            🛒 ×{inCart.qty} in cart
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Cart / checkout panel */}
          {cart.length > 0 ? (
            <div className="cart-panel">
              <div className="cart-panel__header">
                <h3 className="cart-panel__title">🛒 Cart</h3>
                <button
                  type="button"
                  className="ghost small"
                  onClick={() => setCart([])}
                >
                  Clear all
                </button>
              </div>
              <ul className="cart-list">
                {cart.map((item) => {
                  const g = GOODS[item.goodId]
                  const row = active
                    ? effectivePriceRow(game.location, active.id, item.goodId, game.day)
                    : undefined
                  const unitPrice = row ? (item.kind === 'buy' ? row.buy : row.sell) : 0
                  const total = unitPrice * item.qty
                  const wt = g ? g.weightPerUnit * item.qty : 0
                  return (
                    <li key={`${item.kind}-${item.goodId}`} className="cart-row">
                      <GoodIcon goodId={item.goodId} size={18} className="cart-row__icon" />
                      <span className={`cart-row__kind cart-row__kind--${item.kind}`}>
                        {item.kind === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                      <span className="cart-row__name">{g?.name ?? item.goodId}</span>
                      <div className="cart-row__qty-wrap">
                        <button
                          type="button"
                          className="cart-row__qty-btn"
                          onClick={() => updateCartQty(item.goodId, item.kind, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="cart-row__qty">{item.qty}</span>
                        <button
                          type="button"
                          className="cart-row__qty-btn"
                          onClick={() => updateCartQty(item.goodId, item.kind, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-row__wt muted small">{wt} wt</span>
                      <span className={`cart-row__total ${item.kind === 'buy' ? 'cost' : 'gain'}`}>
                        {item.kind === 'buy' ? '−' : '+'}{total}g
                      </span>
                      <button
                        type="button"
                        className="cart-row__remove ghost small"
                        onClick={() => removeFromCart(item.goodId, item.kind)}
                        aria-label="Remove from cart"
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="cart-panel__summary">
                <div className="cart-summary-row">
                  <span>Gold after checkout</span>
                  <strong className={goldAfterCart < 0 ? 'cost' : ''}>{goldAfterCart}g</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Cargo after checkout</span>
                  <strong className={weightAfterCart > maxWeight ? 'cost' : ''}>
                    {weightAfterCart} / {maxWeight} wt
                  </strong>
                </div>
                {cartBuy > 0 && (
                  <div className="cart-summary-row cart-summary-row--sub">
                    <span>Buying</span>
                    <span className="cost">−{cartBuy}g</span>
                  </div>
                )}
                {cartSell > 0 && (
                  <div className="cart-summary-row cart-summary-row--sub">
                    <span>Selling</span>
                    <span className="gain">+{cartSell}g</span>
                  </div>
                )}
              </div>
              <div className="cart-panel__actions">
                {goldAfterCart < 0 && (
                  <p className="cart-panel__warn muted small">Not enough gold.</p>
                )}
                {weightAfterCart > maxWeight && (
                  <p className="cart-panel__warn muted small">Exceeds cargo capacity.</p>
                )}
                <button
                  type="button"
                  className="cart-checkout-btn"
                  disabled={!canCheckout}
                  onClick={() => {
                    executeBatch(cart)
                    setCart([])
                  }}
                >
                  Checkout ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        /* Warehouse tab */
        <WarehousePanel
          game={game}
          warehouse={warehouse}
          whQty={whQty}
          getWhQty={getWhQty}
          setWhQtyFor={setWhQtyFor}
          onBuild={() => buildWarehouse(game.location)}
          onUpgrade={() => upgradeWarehouse(game.location)}
          onDeposit={(goodId, qty) => depositGoods(game.location, goodId, qty)}
          onWithdraw={(goodId, qty) => withdrawGoods(game.location, goodId, qty)}
          onProcess={(recipeId) => processRecipe(game.location, recipeId)}
        />
      )}

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
                  <strong>{pendingTrade.unitGold}</strong>g each?
                  <br />
                  <span className="trade-confirm-dialog__total">Total: {pendingTrade.totalGold}g</span>
                </>
              ) : (
                <>
                  Sell <strong>{pendingTrade.qty}</strong> × {GOODS[pendingTrade.goodId]!.name} at{' '}
                  <strong>{pendingTrade.unitGold}</strong>g each?
                  <br />
                  <span className="trade-confirm-dialog__total">You receive: {pendingTrade.totalGold}g</span>
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

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const w = 80
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  const last = pts[pts.length - 1]!.split(',')
  return (
    <svg
      className="trade-sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#c9a66b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill="#c9a66b" />
    </svg>
  )
}

// ── Warehouse Panel ───────────────────────────────────────────────────────────

interface WarehousePanelProps {
  game: import('@/game/core/types.ts').GameState
  warehouse: import('@/game/core/types.ts').WarehouseState | undefined
  whQty: Record<string, number>
  getWhQty: (key: string, max: number) => number
  setWhQtyFor: (key: string, val: number) => void
  onBuild: () => void
  onUpgrade: () => void
  onDeposit: (goodId: GoodId, qty: number) => void
  onWithdraw: (goodId: GoodId, qty: number) => void
  onProcess: (recipeId: string) => void
}

function WarehousePanel({
  game,
  warehouse,
  getWhQty,
  setWhQtyFor,
  onBuild,
  onUpgrade,
  onDeposit,
  onWithdraw,
  onProcess,
}: WarehousePanelProps) {
  if (!warehouse) {
    return (
      <div className="warehouse-panel">
        <div className="warehouse-empty">
          <p className="warehouse-empty__text">
            No warehouse in {TOWNS[game.location]?.name ?? game.location}. Build one to store goods and process materials.
          </p>
          <div className="warehouse-empty__cost">
            <span>Build cost:</span>
            <strong>{WAREHOUSE_BUILD_COST}g</strong>
          </div>
          <button
            type="button"
            className="warehouse-build-btn"
            disabled={game.gold < WAREHOUSE_BUILD_COST}
            onClick={onBuild}
          >
            Build Warehouse
          </button>
          {game.gold < WAREHOUSE_BUILD_COST ? (
            <p className="muted small">Need {WAREHOUSE_BUILD_COST - game.gold}g more.</p>
          ) : null}
        </div>
      </div>
    )
  }

  const cap = getWarehouseCapacity(warehouse)
  const used = getWarehouseUsed(warehouse)
  const fillPct = Math.min(100, (used / cap) * 100)
  const storedGoods = GOOD_IDS.filter((id) => (warehouse.stored[id] ?? 0) > 0)
  const cargoGoods = GOOD_IDS.filter((id) => (game.inventory[id] ?? 0) > 0)

  return (
    <div className="warehouse-panel">
      <div className="warehouse-header">
        <div className="warehouse-header__title">
          <span className="warehouse-header__level">Level {warehouse.level} Warehouse</span>
          {warehouse.level < 2 ? (
            <button
              type="button"
              className="ghost small warehouse-upgrade-btn"
              disabled={game.gold < WAREHOUSE_UPGRADE_COST}
              onClick={onUpgrade}
              title={`Upgrade to Level 2 for ${WAREHOUSE_UPGRADE_COST}g`}
            >
              Upgrade (−{WAREHOUSE_UPGRADE_COST}g)
            </button>
          ) : (
            <span className="warehouse-header__maxed muted small">Fully upgraded</span>
          )}
        </div>
        <div className="capacity-bar-wrap">
          <div className="capacity-bar-labels">
            <span className="capacity-bar-label">Storage</span>
            <span className="capacity-bar-label capacity-bar-label--right">
              <strong>{used}</strong> / {cap} wt
            </span>
          </div>
          <div className="capacity-bar">
            <div
              className="capacity-bar__fill"
              style={{
                width: `${fillPct}%`,
                background: fillPct > 85 ? '#c97a6a' : fillPct > 60 ? '#c9a66b' : '#7cba6a',
              }}
            />
          </div>
        </div>
      </div>

      <div className="warehouse-columns">
        {/* Stored goods */}
        <div className="warehouse-col">
          <h4 className="warehouse-col__title">Stored here</h4>
          {storedGoods.length === 0 ? (
            <p className="market-column__empty">Nothing stored.</p>
          ) : (
            <ul className="trade-list">
              {storedGoods.map((id) => {
                const g = GOODS[id]!
                const stored = warehouse.stored[id] ?? 0
                const key = `wh-withdraw-${id}`
                const wq = getWhQty(key, stored)
                return (
                  <li key={id} className="trade-row warehouse-row">
                    <div className="trade-row__item">
                      <GoodIcon goodId={id} size={20} className="trade-row__icon" />
                      <div className="trade-row__name">
                        <strong>{g.name}</strong>
                        <span className="trade-row__flavor muted small">×{stored} · {g.weightPerUnit * stored} wt</span>
                      </div>
                    </div>
                    <div className="warehouse-row__controls">
                      <input
                        type="number"
                        className="qty-control__input qty-control__input--sm"
                        min={1}
                        max={stored}
                        value={wq}
                        onChange={(e) => setWhQtyFor(key, Math.max(1, Math.min(stored, Number(e.target.value) || 1)))}
                      />
                      <button
                        type="button"
                        className="trade-row__btn trade-row__btn--sell small"
                        onClick={() => onWithdraw(id, wq)}
                      >
                        Withdraw
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Cargo to deposit */}
        <div className="warehouse-col">
          <h4 className="warehouse-col__title">Deposit from cargo</h4>
          {cargoGoods.length === 0 ? (
            <p className="market-column__empty">Cargo empty.</p>
          ) : (
            <ul className="trade-list">
              {cargoGoods.map((id) => {
                const g = GOODS[id]!
                const count = game.inventory[id] ?? 0
                const key = `wh-deposit-${id}`
                const wq = getWhQty(key, count)
                const freeWt = cap - used
                const canDeposit = freeWt >= g.weightPerUnit
                return (
                  <li key={id} className="trade-row warehouse-row">
                    <div className="trade-row__item">
                      <GoodIcon goodId={id} size={20} className="trade-row__icon" />
                      <div className="trade-row__name">
                        <strong>{g.name}</strong>
                        <span className="trade-row__flavor muted small">×{count} in cargo</span>
                      </div>
                    </div>
                    <div className="warehouse-row__controls">
                      <input
                        type="number"
                        className="qty-control__input qty-control__input--sm"
                        min={1}
                        max={count}
                        value={wq}
                        onChange={(e) => setWhQtyFor(key, Math.max(1, Math.min(count, Number(e.target.value) || 1)))}
                      />
                      <button
                        type="button"
                        className="trade-row__btn trade-row__btn--buy small"
                        disabled={!canDeposit}
                        onClick={() => onDeposit(id, wq)}
                      >
                        Deposit
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Processing recipes */}
      <div className="warehouse-recipes">
        <h4 className="warehouse-col__title">Processing</h4>
        <ul className="recipe-list">
          {PROCESSING_RECIPES.map((recipe) => {
            const canAfford = game.gold >= recipe.goldCost
            const hasInputs = recipe.inputs.every(
              (inp) => (game.inventory[inp.goodId] ?? 0) >= inp.qty,
            )
            return (
              <li key={recipe.id} className="recipe-row">
                <div className="recipe-row__info">
                  <strong className="recipe-row__label">{recipe.label}</strong>
                  <span className="recipe-row__desc muted small">{recipe.description}</span>
                  <div className="recipe-row__ingredients">
                    {recipe.inputs.map((inp) => (
                      <span
                        key={inp.goodId}
                        className={
                          (game.inventory[inp.goodId] ?? 0) >= inp.qty
                            ? 'recipe-ingredient recipe-ingredient--have'
                            : 'recipe-ingredient recipe-ingredient--missing'
                        }
                      >
                        {inp.qty}× {GOODS[inp.goodId]?.name ?? inp.goodId}
                      </span>
                    ))}
                    <span className="recipe-ingredient recipe-ingredient--cost">+{recipe.goldCost}g</span>
                    <span className="recipe-row__arrow">→</span>
                    {recipe.outputs.map((out) => (
                      <span key={out.goodId} className="recipe-ingredient recipe-ingredient--output">
                        {out.qty}× {GOODS[out.goodId]?.name ?? out.goodId}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="recipe-row__btn"
                  disabled={!canAfford || !hasInputs}
                  onClick={() => onProcess(recipe.id)}
                  title={!hasInputs ? 'Missing ingredients in cargo' : !canAfford ? 'Not enough gold' : ''}
                >
                  Process
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

import { useEffect, useId, useMemo, useState } from 'react'
import {
  averageInventoryBuyPrice,
  bestSellOfferAtTown,
  GOODS,
  GOOD_IDS,
  townMarketPriceRow,
  townDemandGoods,
  townPrimaryGoods,
} from '@/game/economy/index.ts'
import { isLocalDeal } from '@/game/economy/merchants.ts'
import { getPriceTrendDirection, trendArrow, getPriceTrend } from '@/game/economy/priceHistory.ts'
import { getSeasonModifierLabel } from '@/game/world/seasons.ts'
import { getDialog } from '@/content/dialog/dialog.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { spareCapacity, cargoWeight, maxCargoWeight } from '@/game/caravan/capacity.ts'
import { getTownDemandReason, getTownEconomyProfile, TOWNS } from '@/game/world/index.ts'
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
type TradeKind = 'buy' | 'sell'
type TradeOffer = {
  row: { buy: number; sell: number }
}
type BuyEntry = {
  id: GoodId
  offer: TradeOffer
  offers: TradeOffer[]
  isPrimary: boolean
  trend: 'up' | 'down' | 'flat'
  seasonLabel: string | null
  sparklineData: number[]
}
type SellEntry = {
  id: GoodId
  count: number
  offer: TradeOffer | null
  offers: TradeOffer[]
  avgBuy: number | null
  sellDelta: number | null
  isWanted: boolean
  isFallback: boolean
  demandReason: string | null
  weight: number
  trend: 'up' | 'down' | 'flat'
  seasonLabel: string | null
  sparklineData: number[]
}

export function TownScreen() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buy)
  const sell = useGameStore((s) => s.sell)
  const executeBatch = useGameStore((s) => s.executeBatch)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const buildWarehouse = useGameStore((s) => s.buildWarehouse)
  const upgradeWarehouse = useGameStore((s) => s.upgradeWarehouse)
  const depositGoods = useGameStore((s) => s.depositGoods)
  const withdrawGoods = useGameStore((s) => s.withdrawGoods)
  const processRecipe = useGameStore((s) => s.processRecipe)

  const [marketTab, setMarketTab] = useState<MarketTab>('market')
  const [showLore, setShowLore] = useState(false)
  const [showCartDetails, setShowCartDetails] = useState(true)
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [whQty, setWhQty] = useState<Record<string, number>>({})
  const confirmTitleId = useId()
  const confirmBodyId = useId()
  const marketTipToggleId = useId()
  const marketTipPanelId = useId()

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

  const [cart, setCart] = useState<CartItem[]>([])
  const [hoveredSparkline, setHoveredSparkline] = useState<string | null>(null)
  const [marketTipOpen, setMarketTipOpen] = useState(false)

  const primaryGoodIds = useMemo(() => townPrimaryGoods(game.location, 5), [game.location])
  const wantedGoodIds = useMemo(() => townDemandGoods(game.location, 5), [game.location])
  const primaryGoods = useMemo(() => new Set(primaryGoodIds), [primaryGoodIds])
  const wantedGoods = useMemo(() => new Set(wantedGoodIds), [wantedGoodIds])

  useEffect(() => {
    setCart([])
    setTradeQty({})
    setExpandedRows({})
    setShowCartDetails(true)
    setMarketTipOpen(false)
  }, [game.location])

  useEffect(() => {
    if (!pendingTrade) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPendingTrade(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pendingTrade])

  useEffect(() => {
    if (marketTab !== 'market') setMarketTipOpen(false)
  }, [marketTab])

  const spare = spareCapacity(game)
  const currentWeight = cargoWeight(game)
  const maxWeight = maxCargoWeight(game)
  const townName = TOWNS[game.location]?.name ?? game.location
  const story = getLocationStory(game.location)
  const economyProfile = useMemo(() => getTownEconomyProfile(game.location), [game.location])
  const warehouse = game.townWarehouses[game.location]

  const cargoGoods = useMemo(
    () => GOOD_IDS.filter((id) => (game.inventory[id] ?? 0) > 0),
    [game.inventory],
  )

  const buyEntries = useMemo<BuyEntry[]>(
    () =>
      GOOD_IDS.map((id) => {
        const offers = merchants
          .map((merchant) => {
            const row = effectivePriceRow(game.location, merchant.id, id, game.day)
            return row ? { merchant, row } : null
          })
          .filter((offer): offer is TradeOffer => offer !== null)
          .sort((a, b) => a.row.buy - b.row.buy)
        if (!offers.length) return null
        const offer = offers[0]!
        return {
          id,
          offer,
          offers,
          isPrimary: primaryGoods.has(id),
          trend: getPriceTrendDirection(game.location, offer.merchant.id, id, game.day),
          seasonLabel: getSeasonModifierLabel(id, game.day),
          sparklineData: getPriceTrend(game.location, offer.merchant.id, id, game.day, 7).map((p) => p.buy),
        }
      })
        .filter((entry): entry is BuyEntry => entry !== null)
        .sort(
          (a, b) =>
            Number(b.isPrimary) - Number(a.isPrimary) ||
            a.offer.row.buy - b.offer.row.buy ||
            GOODS[a.id]!.name.localeCompare(GOODS[b.id]!.name),
        ),
    [game.location, game.day, merchants, primaryGoods],
  )

  const sellEntries = useMemo<SellEntry[]>(
    () =>
      cargoGoods.map((id) => {
        const offers = merchants
          .map((merchant) => {
            const row = effectivePriceRow(game.location, merchant.id, id, game.day)
            return row ? { merchant, row } : null
          })
          .filter((offer): offer is TradeOffer => offer !== null)
          .sort((a, b) => b.row.sell - a.row.sell)
        const bestOffer = bestSellOfferAtTown(game.location, id, game.day)
        const fallbackMerchant =
          bestOffer?.isFallback ? merchants.find((merchant) => merchant.id === bestOffer.merchantId) ?? null : null
        const offer =
          bestOffer && fallbackMerchant
            ? { merchant: fallbackMerchant, row: bestOffer.row }
            : offers[0] ?? null
        const count = game.inventory[id] ?? 0
        const weight = GOODS[id]!.weightPerUnit * count
        const avgBuy = averageInventoryBuyPrice(game, id)
        const sellDelta =
          offer && avgBuy !== null ? Math.round((offer.row.sell - avgBuy) * 10) / 10 : null
        return {
          id,
          count,
          offer,
          offers,
          avgBuy,
          sellDelta,
          isWanted: wantedGoods.has(id),
          isFallback: bestOffer?.isFallback ?? false,
          demandReason: getTownDemandReason(game.location, id),
          weight,
          trend:
            offer && !(bestOffer?.isFallback ?? false)
              ? getPriceTrendDirection(game.location, offer.merchant.id, id, game.day)
              : 'flat',
          seasonLabel: getSeasonModifierLabel(id, game.day),
          sparklineData: offer && !(bestOffer?.isFallback ?? false)
            ? getPriceTrend(game.location, offer.merchant.id, id, game.day, 7).map((p) => p.sell)
            : [],
        }
      }).sort(
        (a, b) =>
          Number(b.isWanted) - Number(a.isWanted) ||
          (b.offer?.row.sell ?? 0) - (a.offer?.row.sell ?? 0) ||
          GOODS[a.id]!.name.localeCompare(GOODS[b.id]!.name),
      ),
    [cargoGoods, game, merchants, wantedGoods],
  )

  function getWhQty(key: string, max: number): number {
    return Math.min(Math.max(1, whQty[key] ?? 1), max)
  }

  function setWhQtyFor(key: string, val: number) {
    setWhQty((prev) => ({ ...prev, [key]: val }))
  }

  function cartBuyTotal(): number {
    return cart
      .filter((i) => i.kind === 'buy')
      .reduce((sum, i) => {
        const row = effectivePriceRow(game.location, i.merchantId, i.goodId, game.day)
        return sum + (row ? row.buy * i.qty : 0)
      }, 0)
  }

  function cartSellTotal(): number {
    return cart
      .filter((i) => i.kind === 'sell')
      .reduce((sum, i) => {
        const row = effectiveSellPriceRow(game.location, i.merchantId, i.goodId, game.day)
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

  function rowKey(kind: TradeKind, goodId: GoodId): string {
    return `${kind}:${goodId}`
  }

  function toggleRowExpanded(key: string) {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function getTradeQty(key: string, max: number, fallback = 1): number {
    const safeMax = Math.max(1, max)
    return Math.min(Math.max(1, tradeQty[key] ?? fallback), safeMax)
  }

  function setTradeQtyFor(key: string, val: number, max: number) {
    const safeMax = Math.max(1, max)
    setTradeQty((prev) => ({ ...prev, [key]: Math.max(1, Math.min(safeMax, val || 1)) }))
  }

  function setCartItem(item: CartItem) {
    setCart((prev) => {
      const existing = prev.findIndex(
        (c) =>
          c.goodId === item.goodId && c.kind === item.kind && c.merchantId === item.merchantId,
      )
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = item
        return updated
      }
      return [...prev, item]
    })
    setShowCartDetails(true)
  }

  function removeFromCart(goodId: GoodId, kind: TradeKind, merchantId: MerchantId) {
    setCart((prev) =>
      prev.filter((c) => !(c.goodId === goodId && c.kind === kind && c.merchantId === merchantId)),
    )
  }

  function cartContextExcluding(target: {
    goodId: GoodId
    kind: TradeKind
    merchantId: MerchantId
  }): { buy: number; sell: number; weight: number } {
    return cart.reduce(
      (acc, item) => {
        if (
          item.goodId === target.goodId &&
          item.kind === target.kind &&
          item.merchantId === target.merchantId
        ) {
          return acc
        }
        const row =
          item.kind === 'buy'
            ? effectivePriceRow(game.location, item.merchantId, item.goodId, game.day)
            : effectiveSellPriceRow(game.location, item.merchantId, item.goodId, game.day)
        if (!row) return acc
        const unitPrice = item.kind === 'buy' ? row.buy : row.sell
        const weight = (GOODS[item.goodId]?.weightPerUnit ?? 0) * item.qty
        if (item.kind === 'buy') acc.buy += unitPrice * item.qty
        else acc.sell += unitPrice * item.qty
        acc.weight += item.kind === 'buy' ? weight : -weight
        return acc
      },
      { buy: 0, sell: 0, weight: 0 },
    )
  }

  function maxBuyQtyForOffer(goodId: GoodId, merchantId: MerchantId, unitPrice: number): number {
    const good = GOODS[goodId]
    if (!good) return 0
    const otherCart = cartContextExcluding({ goodId, kind: 'buy', merchantId })
    const goldAvailable = game.gold - otherCart.buy + otherCart.sell
    const weightAvailable = maxWeight - (currentWeight + otherCart.weight)
    const byGold = unitPrice > 0 ? Math.floor(Math.max(0, goldAvailable) / unitPrice) : 999
    const byWeight =
      good.weightPerUnit > 0
        ? Math.floor(Math.max(0, weightAvailable) / good.weightPerUnit)
        : 999
    return Math.max(0, Math.min(byGold, byWeight))
  }

  function updateCartQty(
    goodId: GoodId,
    kind: TradeKind,
    merchantId: MerchantId,
    newQty: number,
  ) {
    if (newQty <= 0) {
      removeFromCart(goodId, kind, merchantId)
      return
    }
    const row = effectivePriceRow(game.location, merchantId, goodId, game.day)
    let clampedQty = newQty
    if (kind === 'buy' && row) {
      clampedQty = Math.min(newQty, maxBuyQtyForOffer(goodId, merchantId, row.buy))
    }
    if (kind === 'sell') {
      clampedQty = Math.min(newQty, game.inventory[goodId] ?? 0)
    }
    setCart((prev) =>
      prev.map((c) =>
        c.goodId === goodId && c.kind === kind && c.merchantId === merchantId
          ? { ...c, qty: clampedQty }
          : c,
      ),
    )
  }

  function requestTrade(
    kind: TradeKind,
    goodId: GoodId,
    qty: number,
    merchantId: MerchantId,
    unitGold: number,
  ) {
    if (qty <= 1) {
      if (kind === 'buy') buyAtMerchant(goodId, 1, merchantId)
      else sellToMerchant(goodId, 1, merchantId)
      return
    }
    setPendingTrade({
      kind,
      goodId,
      qty,
      merchantId,
      unitGold,
      totalGold: unitGold * qty,
    })
  }

  const cartBuy = cartBuyTotal()
  const cartSell = cartSellTotal()
  const cartWt = cartWeightDelta()
  const goldAfterCart = game.gold - cartBuy + cartSell
  const weightAfterCart = currentWeight + cartWt
  const spareAfterCart = maxWeight - weightAfterCart
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
              {marketTab === 'market' ? (
                <button
                  type="button"
                  id={marketTipToggleId}
                  className="market-tip-dropdown__toggle market-tip-dropdown__toggle--inline"
                  aria-expanded={marketTipOpen}
                  aria-controls={marketTipPanelId}
                  onClick={() => setMarketTipOpen((open) => !open)}
                >
                  <span>Market tip</span>
                  <span
                    className={`market-tip-dropdown__chevron${marketTipOpen ? ' market-tip-dropdown__chevron--open' : ''}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="market-screen__stats">
            <span className="stat-pill stat-pill--gold">
              <span className="stat-pill__label">Gold</span>
              <strong>{game.gold}</strong>
            </span>
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

        {marketTab === 'market' && marketTipOpen ? (
          <div
            id={marketTipPanelId}
            className="market-tip-dropdown__panel market-tip-dropdown__panel--in-header"
            role="region"
            aria-labelledby={marketTipToggleId}
          >
            <p className="market-tip-card__hint muted small">
              Cheap here shows what this town is known for selling. Wanted here shows what usually earns a premium.
            </p>
            <p className="market-tip-card__hint muted small">{economyProfile.marketBackstory}</p>
            <div className="market-tip-card__group">
              <span className="market-tip-card__label">Cheap here</span>
              <div className="market-tip-card__chips">
                {primaryGoodIds.length > 0 ? (
                  primaryGoodIds.map((goodId) => (
                    <span key={goodId} className="market-tip-card__chip market-tip-card__chip--cheap">
                      {GOODS[goodId]!.name}
                    </span>
                  ))
                ) : (
                  <span className="market-tip-card__empty muted small">No clear specialty.</span>
                )}
              </div>
            </div>
            <div className="market-tip-card__group">
              <span className="market-tip-card__label">Wanted here</span>
              <div className="market-tip-card__chips">
                {wantedGoodIds.length > 0 ? (
                  wantedGoodIds.map((goodId) => (
                    <span key={goodId} className="market-tip-card__chip market-tip-card__chip--wanted">
                      {GOODS[goodId]!.name}
                    </span>
                  ))
                ) : (
                  <span className="market-tip-card__empty muted small">No strong demand signal.</span>
                )}
              </div>
            </div>
            <div className="market-tip-card__group">
              <span className="market-tip-card__label">Thriving industries</span>
              <div className="market-tip-card__chips">
                {economyProfile.thrivingIndustries.map((industry) => (
                  <span key={industry} className="market-tip-card__chip">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div className="market-tip-card__group">
              <span className="market-tip-card__label">Why buyers pay here</span>
              <div className="trade-row__details-meta muted small">
                {economyProfile.importDemand.slice(0, 4).map((entry) => (
                  <span key={entry.goodId}>
                    <strong>{GOODS[entry.goodId]!.name}:</strong> {entry.reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {showLore && story && (
          <>
            <p className="market-screen__story market-screen__story--expanded">{story}</p>
            <p className="market-screen__story market-screen__story--expanded">
              {economyProfile.marketBackstory}
            </p>
            <p className="market-screen__story market-screen__story--expanded">
              Thriving industries: {economyProfile.thrivingIndustries.join(', ')}.
            </p>
          </>
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
        <div className="market-screen__content">
          <div className="market-board">
            <div className="market-column market-column--catalog">
              <div className="market-column__heading">
                <h3 className="market-column__title">Buy in town</h3>
                <span className="muted small">
                  {primaryGoodIds.length} local specialty{primaryGoodIds.length === 1 ? '' : 'ies'} · {buyEntries.length} goods listed
                </span>
              </div>
              {buyEntries.length === 0 ? (
                <p className="market-column__empty">Nothing in stock.</p>
              ) : (
                <ul className="trade-list">
                  {buyEntries.map(({ id, offer, isPrimary, trend, seasonLabel, sparklineData }) => {
                    const good = GOODS[id]!
                    const key = rowKey('buy', id)
                    const inCart = cart.find(
                      (item) =>
                        item.kind === 'buy' && item.goodId === id && item.merchantId === offer.merchant.id,
                    )
                    const maxQty = maxBuyQtyForOffer(id, offer.merchant.id, offer.row.buy)
                    const qtyLimit = Math.max(maxQty, inCart?.qty ?? 1, 1)
                    const qty = getTradeQty(key, qtyLimit, inCart?.qty ?? 1)
                    const sparklineKey = `buy-${id}`
                    const isExpanded = expandedRows[key]
                    return (
                      <li
                        key={id}
                        className={`trade-row${isPrimary ? ' trade-row--primary' : ''}${inCart ? ' trade-row--in-cart' : ''}`}
                      >
                        <div className="trade-row__item">
                          <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                          <div className="trade-row__name">
                            <div className="trade-row__name-line">
                              <strong>{good.name}</strong>
                              {inCart ? (
                                <span className="trade-row__cart-chip">Cart ×{inCart.qty}</span>
                              ) : null}
                            </div>
                            <div className="trade-row__meta muted small">
                              <span>{good.weightPerUnit} wt / unit</span>
                              <button
                                type="button"
                                className="linkish trade-row__details-toggle"
                                onClick={() => toggleRowExpanded(key)}
                              >
                                {isExpanded ? 'Hide details' : 'Details'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="trade-row__prices">
                          <div className="trade-row__price-line">
                            {isPrimary ? (
                              <span className="trade-row__badge trade-row__badge--primary" title="One of this town's cheapest local goods">
                                Local supply
                              </span>
                            ) : null}
                            {isLocalDeal(game.location, offer.merchant.id, id, game.day) ? (
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
                            Buy <strong>{offer.row.buy}</strong>g
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
                            <Sparkline data={sparklineData} />
                          ) : null}
                        </div>
                        <QtyStepper
                          value={qty}
                          max={qtyLimit}
                          disabled={maxQty <= 0}
                          shortcutLabel="Max"
                          shortcutDisabled={maxQty <= 0}
                          onChange={(next) => setTradeQtyFor(key, next, qtyLimit)}
                          onShortcut={() => setTradeQtyFor(key, maxQty, qtyLimit)}
                        />
                        <div className="trade-row__actions">
                          <button
                            type="button"
                            className="trade-row__btn trade-row__btn--buy"
                            disabled={maxQty <= 0}
                            onClick={() =>
                              requestTrade('buy', id, qty, offer.merchant.id, offer.row.buy)
                            }
                          >
                            {qty === 1 ? 'Buy now' : `Buy ×${qty}`}
                          </button>
                          <button
                            type="button"
                            className="trade-row__btn ghost small"
                            disabled={maxQty <= 0}
                            onClick={() =>
                              setCartItem({
                                goodId: id,
                                qty,
                                kind: 'buy',
                                merchantId: offer.merchant.id,
                              })
                            }
                          >
                            {inCart ? 'Update cart' : 'Add to cart'}
                          </button>
                        </div>
                        {isExpanded ? (
                          <div className="trade-row__details">
                            <p className="trade-row__details-copy">{getDialog(good.dialogFlavorId)}</p>
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="market-column market-column--cargo">
              <div className="market-column__heading">
                <h3 className="market-column__title">Sell from cargo</h3>
                <span className="muted small">
                  {wantedGoodIds.length} wanted good{wantedGoodIds.length === 1 ? '' : 's'} · {cargoGoods.length} goods carried
                </span>
              </div>
              {cargoGoods.length === 0 ? (
                <p className="market-column__empty">Cargo empty.</p>
              ) : (
                <ul className="trade-list">
                  {sellEntries.map(
                    ({
                      id,
                      count,
                      offer,
                      avgBuy,
                      sellDelta,
                      isWanted,
                      isFallback,
                      demandReason,
                      weight,
                      trend,
                      seasonLabel,
                      sparklineData,
                    }) => {
                      const good = GOODS[id]!
                      const key = rowKey('sell', id)
                      const inCart = offer
                        ? cart.find(
                            (item) =>
                              item.kind === 'sell' && item.goodId === id && item.merchantId === offer.merchant.id,
                          )
                        : undefined
                      const qty = getTradeQty(key, Math.max(count, 1), inCart?.qty ?? 1)
                      const sparklineKey = `sell-${id}`
                      const isExpanded = expandedRows[key]
                      return (
                        <li
                          key={id}
                          className={`trade-row${isWanted ? ' trade-row--wanted' : ''}${inCart ? ' trade-row--in-cart' : ''}`}
                        >
                          <div className="trade-row__item">
                            <GoodIcon goodId={id} size={24} className="trade-row__icon" />
                            <div className="trade-row__name">
                              <div className="trade-row__name-line">
                                <strong>{good.name}</strong>
                                {inCart ? (
                                  <span className="trade-row__cart-chip trade-row__cart-chip--sell">
                                    Cart ×{inCart.qty}
                                  </span>
                                ) : null}
                              </div>
                              <div className="trade-row__meta muted small">
                                <span>×{count} carried</span>
                                <span>{weight} wt total</span>
                                <button
                                  type="button"
                                  className="linkish trade-row__details-toggle"
                                  onClick={() => toggleRowExpanded(key)}
                                >
                                  {isExpanded ? 'Hide details' : 'Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="trade-row__prices">
                            {offer ? (
                              <>
                                <div className="trade-row__price-line">
                                  {isWanted ? (
                                    <span className="trade-row__badge trade-row__badge--wanted" title="This town pays above its usual market baseline for this good">
                                      Wanted here
                                    </span>
                                  ) : null}
                                  {isFallback ? (
                                    <span className="trade-row__badge" title="If no named stall is posting for this good, local quartermasters, inns, docks, and street buyers still offer a lower townwide price">
                                      Town buyers
                                    </span>
                                  ) : null}
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
                                </div>
                                <span className="trade-row__price">
                                  Sell <strong>{offer.row.sell}</strong>g
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
                                  <Sparkline data={sparklineData} />
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
                              </>
                            ) : (
                              <span className="trade-row__price muted small">Not buying today</span>
                            )}
                          </div>
                          <QtyStepper
                            value={qty}
                            max={Math.max(count, 1)}
                            disabled={!offer}
                            shortcutLabel="All"
                            shortcutDisabled={!offer}
                            onChange={(next) => setTradeQtyFor(key, next, Math.max(count, 1))}
                            onShortcut={() => setTradeQtyFor(key, count, Math.max(count, 1))}
                          />
                          <div className="trade-row__actions">
                            <button
                              type="button"
                              className="trade-row__btn trade-row__btn--sell"
                              disabled={!offer}
                              onClick={() => {
                                if (!offer) return
                                requestTrade('sell', id, qty, offer.merchant.id, offer.row.sell)
                              }}
                            >
                              {qty === 1 ? 'Sell now' : `Sell ×${qty}`}
                            </button>
                            <button
                              type="button"
                              className="trade-row__btn ghost small"
                              disabled={!offer}
                              onClick={() => {
                                if (!offer) return
                                setCartItem({
                                  goodId: id,
                                  qty,
                                  kind: 'sell',
                                  merchantId: offer.merchant.id,
                                })
                              }}
                            >
                              {inCart ? 'Update cart' : 'Add to cart'}
                            </button>
                          </div>
                          {isExpanded ? (
                            <div className="trade-row__details">
                              <p className="trade-row__details-copy">{getDialog(good.dialogFlavorId)}</p>
                              <div className="trade-row__details-meta muted small">
                                {demandReason ? <span>Local demand: {demandReason}</span> : null}
                                {avgBuy !== null ? (
                                  <span>
                                    Avg buy: {avgBuy === Math.floor(avgBuy) ? avgBuy : avgBuy.toFixed(1)}g
                                  </span>
                                ) : (
                                  <span>Avg buy: —</span>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </li>
                      )
                    },
                  )}
                </ul>
              )}
            </div>
          </div>

          <aside className="trade-sidebar">
            <div className="trade-summary-card">
              <div className="trade-summary-card__header">
                <div>
                  <h3 className="trade-summary-card__title">Trade summary</h3>
                  <p className="trade-summary-card__hint muted small">
                    Sells resolve before buys at checkout.
                  </p>
                </div>
                {cart.length > 0 ? (
                  <button
                    type="button"
                    className="ghost small"
                    onClick={() => {
                      setCart([])
                      setShowCartDetails(true)
                    }}
                  >
                    Clear cart
                  </button>
                ) : null}
              </div>
              <div className="trade-summary-card__rows">
                <div className="trade-summary-row">
                  <span>Gold</span>
                  <strong className={goldAfterCart < 0 ? 'cost' : ''}>
                    {game.gold}g → {goldAfterCart}g
                  </strong>
                </div>
                <div className="trade-summary-row">
                  <span>Spare space</span>
                  <strong className={spareAfterCart < 0 ? 'cost' : ''}>
                    {spare} wt → {spareAfterCart} wt
                  </strong>
                </div>
                <div className="trade-summary-row trade-summary-row--sub">
                  <span>Cart items</span>
                  <span>{cart.length}</span>
                </div>
                {cartBuy > 0 ? (
                  <div className="trade-summary-row trade-summary-row--sub">
                    <span>Buying</span>
                    <span className="cost">−{cartBuy}g</span>
                  </div>
                ) : null}
                {cartSell > 0 ? (
                  <div className="trade-summary-row trade-summary-row--sub">
                    <span>Selling</span>
                    <span className="gain">+{cartSell}g</span>
                  </div>
                ) : null}
              </div>
              {cart.length === 0 ? (
                <p className="trade-summary-card__empty muted small">
                  Stage trades from the lists to keep gold and cargo changes in view.
                </p>
              ) : null}
              {goldAfterCart < 0 ? (
                <p className="cart-panel__warn muted small">Not enough gold for this cart.</p>
              ) : null}
              {weightAfterCart > maxWeight ? (
                <p className="cart-panel__warn muted small">Cart would exceed cargo capacity.</p>
              ) : null}
              <button
                type="button"
                className="cart-checkout-btn"
                disabled={!canCheckout}
                onClick={() => {
                  executeBatch(cart)
                  setCart([])
                  setShowCartDetails(true)
                }}
              >
                Checkout ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </button>
            </div>

            <div className="cart-panel cart-panel--sidebar">
              <div className="cart-panel__header">
                <h3 className="cart-panel__title">Cart lines</h3>
                {cart.length > 0 ? (
                  <button
                    type="button"
                    className="ghost small"
                    onClick={() => setShowCartDetails((value) => !value)}
                  >
                    {showCartDetails ? 'Hide' : 'Show'}
                  </button>
                ) : null}
              </div>
              {cart.length === 0 ? (
                <p className="cart-panel__empty muted small">No staged trades yet.</p>
              ) : showCartDetails ? (
                <ul className="cart-list">
                  {cart.map((item) => {
                    const good = GOODS[item.goodId]
                    const row =
                      item.kind === 'buy'
                        ? effectivePriceRow(game.location, item.merchantId, item.goodId, game.day)
                        : effectiveSellPriceRow(game.location, item.merchantId, item.goodId, game.day)
                    const unitPrice = row ? (item.kind === 'buy' ? row.buy : row.sell) : 0
                    const total = unitPrice * item.qty
                    const weight = good ? good.weightPerUnit * item.qty : 0
                    return (
                      <li key={`${item.kind}-${item.goodId}-${item.merchantId}`} className="cart-row">
                        <GoodIcon goodId={item.goodId} size={18} className="cart-row__icon" />
                        <span className={`cart-row__kind cart-row__kind--${item.kind}`}>
                          {item.kind === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                        <span className="cart-row__name-block">
                          <span className="cart-row__name">{good?.name ?? item.goodId}</span>
                        </span>
                        <div className="cart-row__qty-wrap">
                          <button
                            type="button"
                            className="cart-row__qty-btn"
                            onClick={() =>
                              updateCartQty(item.goodId, item.kind, item.merchantId, item.qty - 1)
                            }
                          >
                            −
                          </button>
                          <span className="cart-row__qty">{item.qty}</span>
                          <button
                            type="button"
                            className="cart-row__qty-btn"
                            onClick={() =>
                              updateCartQty(item.goodId, item.kind, item.merchantId, item.qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-row__wt muted small">{weight} wt</span>
                        <span className={`cart-row__total ${item.kind === 'buy' ? 'cost' : 'gain'}`}>
                          {item.kind === 'buy' ? '−' : '+'}{total}g
                        </span>
                        <button
                          type="button"
                          className="cart-row__remove ghost small"
                          onClick={() => removeFromCart(item.goodId, item.kind, item.merchantId)}
                          aria-label="Remove from cart"
                        >
                          ✕
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="cart-panel__empty muted small">Cart lines hidden.</p>
              )}
            </div>
          </aside>
        </div>
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
                  if (p.kind === 'buy') buyAtMerchant(p.goodId, p.qty, p.merchantId)
                  else sellToMerchant(p.goodId, p.qty, p.merchantId)
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

interface QtyStepperProps {
  value: number
  max: number
  disabled?: boolean
  shortcutLabel: string
  shortcutDisabled?: boolean
  onChange: (next: number) => void
  onShortcut: () => void
}

function QtyStepper({
  value,
  max,
  disabled = false,
  shortcutLabel,
  shortcutDisabled = false,
  onChange,
  onShortcut,
}: QtyStepperProps) {
  const safeMax = Math.max(1, max)

  return (
    <div className={`trade-qty${disabled ? ' trade-qty--disabled' : ''}`}>
      <button
        type="button"
        className="trade-qty__btn"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        className="trade-qty__input"
        min={1}
        max={safeMax}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(1, Math.min(safeMax, Number(e.target.value) || 1)))}
      />
      <button
        type="button"
        className="trade-qty__btn"
        disabled={disabled || value >= safeMax}
        onClick={() => onChange(Math.min(safeMax, value + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
      <button
        type="button"
        className="trade-qty__shortcut ghost small"
        disabled={disabled || shortcutDisabled}
        onClick={onShortcut}
      >
        {shortcutLabel}
      </button>
    </div>
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

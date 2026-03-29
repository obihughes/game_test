import type { CaravanBuffId, CaravanBuffState, GameResult, GameState, GoodId } from '../core/types.ts'

export interface UsableItemDefinition {
  label: string
  description: string
  effectSummary: string
  use: (state: GameState, goodId: GoodId) => GameResult
}

const MAX_BONUS_CAPACITY = 45

function isBuffActive(state: GameState, buffId: CaravanBuffId): boolean {
  const buff = state.caravan.buffs[buffId]
  return Boolean(buff && buff.expiresOnDay >= state.day)
}

function pruneExpiredBuffs(state: GameState): GameState {
  const nextBuffs: Partial<Record<CaravanBuffId, CaravanBuffState>> = {}
  for (const [buffId, buff] of Object.entries(state.caravan.buffs) as Array<
    [CaravanBuffId, CaravanBuffState | undefined]
  >) {
    if (buff && buff.expiresOnDay >= state.day) nextBuffs[buffId] = buff
  }
  return {
    ...state,
    caravan: {
      ...state.caravan,
      buffs: nextBuffs,
    },
  }
}

function consumeInventoryUnit(
  state: GameState,
  goodId: GoodId,
): {
  inventory: Record<GoodId, number>
  inventoryCostBasis: Partial<Record<GoodId, number>>
} {
  const have = state.inventory[goodId] ?? 0
  const basis = state.inventoryCostBasis[goodId] ?? 0
  const nextQty = have - 1
  const consumedBasis = have > 0 ? basis / have : 0
  const nextInventory = { ...state.inventory, [goodId]: nextQty }
  const nextCostBasis = { ...state.inventoryCostBasis }
  if (nextQty <= 0) delete nextInventory[goodId]
  const remainingBasis = basis - consumedBasis
  if (nextQty <= 0 || remainingBasis <= 0) delete nextCostBasis[goodId]
  else nextCostBasis[goodId] = remainingBasis
  return { inventory: nextInventory, inventoryCostBasis: nextCostBasis }
}

function applyTimedBuff(
  state: GameState,
  goodId: GoodId,
  buffId: CaravanBuffId,
  durationDays: number,
): GameResult {
  const cleaned = pruneExpiredBuffs(state)
  const consumed = consumeInventoryUnit(cleaned, goodId)
  const nextExpiresOnDay = Math.max(
    (cleaned.caravan.buffs[buffId]?.expiresOnDay ?? cleaned.day) + durationDays,
    cleaned.day + durationDays,
  )
  return {
    ok: true,
    state: {
      ...cleaned,
      inventory: consumed.inventory,
      inventoryCostBasis: consumed.inventoryCostBasis,
      caravan: {
        ...cleaned.caravan,
        buffs: {
          ...cleaned.caravan.buffs,
          [buffId]: {
            expiresOnDay: nextExpiresOnDay,
            sourceGoodId: goodId,
          },
        },
      },
    },
  }
}

function applyBonusCapacity(state: GameState, goodId: GoodId, amount: number): GameResult {
  if (state.caravan.bonusCapacity >= MAX_BONUS_CAPACITY) {
    return { ok: false, reason: 'Your caravan frame cannot safely take more upgrades.' }
  }
  const consumed = consumeInventoryUnit(state, goodId)
  return {
    ok: true,
    state: {
      ...state,
      inventory: consumed.inventory,
      inventoryCostBasis: consumed.inventoryCostBasis,
      caravan: {
        ...state.caravan,
        bonusCapacity: Math.min(MAX_BONUS_CAPACITY, state.caravan.bonusCapacity + amount),
      },
    },
  }
}

export const USABLE_ITEMS: Partial<Record<GoodId, UsableItemDefinition>> = {
  grain: {
    label: 'Feed Horses',
    description: 'Use a grain sack to keep the team well fed on the road.',
    effectSummary: 'Grants Well Fed for 3 travel days.',
    use: (state, goodId) => applyTimedBuff(state, goodId, 'well_fed', 3),
  },
  wine: {
    label: 'Raise Morale',
    description: 'Share river wine around the campfire before a hard journey.',
    effectSummary: 'Grants High Morale for 3 travel days.',
    use: (state, goodId) => applyTimedBuff(state, goodId, 'high_morale', 3),
  },
  herbs: {
    label: 'Prepare Trail Herbs',
    description: 'Brew and chew field herbs to stay sharp and sleep lightly.',
    effectSummary: 'Grants Alertness for 3 travel days.',
    use: (state, goodId) => applyTimedBuff(state, goodId, 'alertness', 3),
  },
  metal_tools: {
    label: 'Reinforce Wagon',
    description: 'Use iron tools and spare fittings to brace the wagon frame.',
    effectSummary: 'Consumes 1 crate for +2 permanent cargo capacity.',
    use: (state, goodId) => applyBonusCapacity(state, goodId, 2),
  },
  cart_upgrade_kit: {
    label: 'Install Upgrade Kit',
    description: 'Fit stronger braces, better lashings, and smarter rack space to the caravan.',
    effectSummary: 'Consumes 1 kit for +15 permanent cargo capacity.',
    use: (state, goodId) => applyBonusCapacity(state, goodId, 15),
  },
  elixir_of_insight: {
    label: 'Drink Elixir',
    description: 'A hard-to-brew draught that steadies the nerves and sharpens the eye.',
    effectSummary: 'Grants Insight for 6 travel days.',
    use: (state, goodId) => applyTimedBuff(state, goodId, 'insight', 6),
  },
}

export function getUsableItem(goodId: GoodId): UsableItemDefinition | null {
  return USABLE_ITEMS[goodId] ?? null
}

export function canUseItem(state: GameState, goodId: GoodId): boolean {
  return Boolean(getUsableItem(goodId) && (state.inventory[goodId] ?? 0) > 0)
}

export function useItem(state: GameState, goodId: GoodId): GameResult {
  const usable = getUsableItem(goodId)
  if (!usable) return { ok: false, reason: 'That item cannot be used directly.' }
  if ((state.inventory[goodId] ?? 0) <= 0) {
    return { ok: false, reason: 'You do not have that item in cargo.' }
  }
  return usable.use(state, goodId)
}

export function buffLabel(buffId: CaravanBuffId): string {
  switch (buffId) {
    case 'well_fed':
      return 'Well Fed'
    case 'high_morale':
      return 'High Morale'
    case 'alertness':
      return 'Alertness'
    case 'insight':
      return 'Insight'
  }
}

export function buffSummary(buffId: CaravanBuffId): string {
  switch (buffId) {
    case 'well_fed':
      return 'Travel legs are 1 day shorter.'
    case 'high_morale':
      return 'Guarded caravans pay even less in tolls.'
    case 'alertness':
      return 'Helps avoid costly trouble on the road.'
    case 'insight':
      return 'Sharper routes and fewer setbacks for several days.'
  }
}

export function getActiveBuffs(state: GameState): Array<{
  id: CaravanBuffId
  label: string
  summary: string
  expiresOnDay: number
}> {
  const active: Array<{
    id: CaravanBuffId
    label: string
    summary: string
    expiresOnDay: number
  }> = []
  for (const [buffId, buff] of Object.entries(state.caravan.buffs) as Array<
    [CaravanBuffId, CaravanBuffState | undefined]
  >) {
    if (!buff || !isBuffActive(state, buffId)) continue
    active.push({
      id: buffId,
      label: buffLabel(buffId),
      summary: buffSummary(buffId),
      expiresOnDay: buff.expiresOnDay,
    })
  }
  return active.sort((a, b) => a.expiresOnDay - b.expiresOnDay)
}

export function hasActiveBuff(state: GameState, buffId: CaravanBuffId): boolean {
  return isBuffActive(state, buffId)
}

export function pruneCaravanBuffs(state: GameState): GameState {
  return pruneExpiredBuffs(state)
}

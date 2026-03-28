export interface CartTier {
  tier: number
  label: string
  capacity: number
  upgradeCost: number
}

export const CART_TIERS: CartTier[] = [
  { tier: 0, label: 'Handcart', capacity: 40, upgradeCost: 0 },
  { tier: 1, label: 'Wagon', capacity: 90, upgradeCost: 180 },
  { tier: 2, label: 'Covered wagon', capacity: 160, upgradeCost: 420 },
  { tier: 3, label: 'Long caravan', capacity: 260, upgradeCost: 900 },
]

export function tierConfig(tier: number): CartTier {
  const t = CART_TIERS[Math.min(tier, CART_TIERS.length - 1)]
  return t ?? CART_TIERS[0]!
}
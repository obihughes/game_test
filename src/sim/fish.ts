import type { FishSpecies, GrowthStage, HungerStage } from './balance.ts';
import { BALANCE } from './balance.ts';

export interface Fish {
  id: number;
  species: FishSpecies;
  growthStage: GrowthStage;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hunger: number;
  hungerStage: HungerStage;
  mealsEaten: number;
  /** Fractional meals accumulated from passive sources like fish feed. */
  growthProgress: number;
  swimPhase: number;
  wanderAngle: number;
  dead: boolean;
  removePending: boolean;
}

let nextFishId = 1;

export function createFish(
  species: FishSpecies,
  x: number,
  y: number,
  id?: number,
): Fish {
  return {
    id: id ?? nextFishId++,
    species,
    growthStage: 'small',
    x,
    y,
    vx: (Math.random() - 0.5) * BALANCE.FISH_BASE_SPEED,
    vy: (Math.random() - 0.5) * BALANCE.FISH_BASE_SPEED * 0.5,
    hunger: 10,
    hungerStage: 'fed',
    mealsEaten: 0,
    growthProgress: 0,
    swimPhase: Math.random() * Math.PI * 2,
    wanderAngle: Math.random() * Math.PI * 2,
    dead: false,
    removePending: false,
  };
}

export function setNextFishId(id: number): void {
  nextFishId = id;
}

export function getGrowthScale(stage: GrowthStage): number {
  switch (stage) {
    case 'small':
      return 0.7;
    case 'medium':
      return 1;
    case 'large':
      return 1.35;
  }
}

/** Numeric ordering of growth stages, used to compare fish sizes. */
export function getGrowthOrder(stage: GrowthStage): number {
  switch (stage) {
    case 'small':
      return 0;
    case 'medium':
      return 1;
    case 'large':
      return 2;
  }
}

export function updateHungerStage(fish: Fish): void {
  if (fish.dead) return;
  if (fish.hunger < BALANCE.HUNGRY_THRESHOLD) {
    fish.hungerStage = 'fed';
  } else if (fish.hunger < BALANCE.STARVING_THRESHOLD) {
    fish.hungerStage = 'hungry';
  } else {
    fish.hungerStage = 'starving';
  }
}

export function advanceGrowth(fish: Fish): void {
  if (fish.growthProgress >= BALANCE.GROWTH_TO_LARGE) {
    fish.growthStage = 'large';
  } else if (fish.growthProgress >= BALANCE.GROWTH_TO_MEDIUM) {
    fish.growthStage = 'medium';
  }
}

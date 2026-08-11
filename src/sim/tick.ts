import { BALANCE } from './balance.ts';
import {
  advanceGrowth,
  updateHungerStage,
  type Fish,
} from './fish.ts';
import {
  applySeek,
  applyWander,
  findNearestAlgae,
  findNearestPrey,
  limitSpeed,
  moveFish,
} from './steering.ts';
import type { GameState } from './state.ts';
import { isFertilizerActive, isFishFeedActive } from './state.ts';

function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function updateFish(fish: Fish, state: GameState, dt: number): void {
  if (fish.dead) {
    fish.vy += 8 * dt;
    fish.vx *= 1 - dt * 0.5;
    moveFish(fish, dt);
    return;
  }

  fish.hunger += BALANCE.HUNGER_RATE * dt;
  updateHungerStage(fish);

  if (fish.hunger >= BALANCE.DEATH_THRESHOLD) {
    fish.dead = true;
    fish.vx *= 0.2;
    fish.vy = -20;
    return;
  }

  if (fish.hungerStage !== 'fed') {
    if (fish.species === 'bass') {
      const prey = findNearestPrey(fish, state);
      if (prey) {
        applySeek(fish, prey.x, prey.y, dt);
      } else {
        applyWander(fish, dt);
      }
    } else {
      const target = findNearestAlgae(fish, state);
      if (target) {
        applySeek(fish, target.x, target.y, dt);
      } else {
        applyWander(fish, dt);
      }
    }
  } else {
    applyWander(fish, dt);
  }

  limitSpeed(fish);
  moveFish(fish, dt);
}

function tryEatAlgae(fish: Fish, state: GameState): void {
  if (fish.dead || fish.species !== 'tilapia' || fish.hungerStage === 'fed') {
    return;
  }

  const eatRadiusSq = BALANCE.ALGAE_EAT_RADIUS ** 2;
  for (let i = state.algae.length - 1; i >= 0; i--) {
    const algae = state.algae[i];
    if (distSq(fish.x, fish.y, algae.x, algae.y) <= eatRadiusSq) {
      state.algae.splice(i, 1);
      fish.hunger = Math.max(0, fish.hunger - BALANCE.MEAL_SATISFACTION);
      fish.mealsEaten++;
      advanceGrowth(fish);
      updateHungerStage(fish);
      return;
    }
  }
}

function tryHuntFish(predator: Fish, state: GameState): void {
  if (predator.dead || predator.species !== 'bass') return;
  if (predator.hungerStage === 'fed') return;

  const eatRadiusSq = BALANCE.BASS_EAT_RADIUS ** 2;
  const prey = findNearestPrey(predator, state);
  if (!prey) return;
  if (distSq(predator.x, predator.y, prey.x, prey.y) > eatRadiusSq) return;

  prey.removePending = true;
  predator.hunger = Math.max(0, predator.hunger - BALANCE.MEAL_SATISFACTION);
  predator.mealsEaten++;
  advanceGrowth(predator);
  updateHungerStage(predator);
}

function spawnAlgae(state: GameState, dt: number): void {
  state.algaeSpawnTimer -= dt;
  if (state.algaeSpawnTimer > 0) return;

  const interval = isFertilizerActive(state)
    ? BALANCE.ALGAE_SPAWN_INTERVAL / BALANCE.FERTILIZER_SPAWN_MULTIPLIER
    : BALANCE.ALGAE_SPAWN_INTERVAL;
  state.algaeSpawnTimer = interval;

  if (state.algae.length >= BALANCE.ALGAE_MAX) return;

  state.algae.push({
    id: state.nextEntityId++,
    x: 30 + Math.random() * (BALANCE.TANK_WIDTH - 60),
    y: 30 + Math.random() * (BALANCE.TANK_HEIGHT - 100),
    lifetime: BALANCE.ALGAE_LIFETIME,
  });
}

function updateAlgae(state: GameState, dt: number): void {
  for (let i = state.algae.length - 1; i >= 0; i--) {
    const algae = state.algae[i];
    algae.lifetime -= dt;
    if (algae.lifetime <= 0) {
      state.algae.splice(i, 1);
    }
  }
}

function applyFishFeed(state: GameState, dt: number): void {
  if (!isFishFeedActive(state)) return;
  for (const fish of state.fish) {
    if (fish.dead) continue;
    fish.growthProgress += BALANCE.FISH_FEED_GROWTH_RATE * dt;
    advanceGrowth(fish);
  }
}

function updateBuffTimers(state: GameState, dt: number): void {
  if (state.fertilizerTimer > 0) {
    state.fertilizerTimer = Math.max(0, state.fertilizerTimer - dt);
  }
  if (state.fishFeedTimer > 0) {
    state.fishFeedTimer = Math.max(0, state.fishFeedTimer - dt);
  }
}

export function advance(state: GameState, dt: number): void {
  for (const fish of state.fish) {
    updateFish(fish, state, dt);
    tryEatAlgae(fish, state);
    tryHuntFish(fish, state);
  }

  spawnAlgae(state, dt);
  updateAlgae(state, dt);
  applyFishFeed(state, dt);
  updateBuffTimers(state, dt);

  state.fish = state.fish.filter((f) => !f.removePending);
  state.autosaveTimer += dt;
}

export function findFishAt(
  state: GameState,
  x: number,
  y: number,
): number | null {
  const radiusSq = 45 ** 2;
  for (const fish of state.fish) {
    if (!fish.dead && distSq(x, y, fish.x, fish.y) <= radiusSq) {
      return fish.id;
    }
  }
  return null;
}

export function findDeadFishAt(
  state: GameState,
  x: number,
  y: number,
): number | null {
  const radiusSq = 45 ** 2;
  for (const fish of state.fish) {
    if (fish.dead && distSq(x, y, fish.x, fish.y) <= radiusSq) {
      return fish.id;
    }
  }
  return null;
}

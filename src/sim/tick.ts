import { BALANCE } from './balance.ts';
import {
  advanceGrowth,
  createFish,
  getGrowthOrder,
  updateHungerStage,
  type Fish,
} from './fish.ts';
import {
  applyFlee,
  applySeek,
  applyWander,
  findNearestAlgae,
  findNearestPellet,
  findNearestPredator,
  findNearestPrey,
  limitSpeed,
  moveFish,
} from './steering.ts';
import type { Algae, FoodPellet, GameState } from './state.ts';
import { isFertilizerActive, isFishFeedActive } from './state.ts';

function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Applies the shared reward for any meal — hunger relief plus partial growth. */
function feedFish(fish: Fish): void {
  fish.hunger = Math.max(0, fish.hunger - BALANCE.MEAL_SATISFACTION);
  fish.mealsEaten++;
  fish.growthProgress += BALANCE.GROWTH_PER_MEAL;
  advanceGrowth(fish);
  updateHungerStage(fish);
}

type FoodKind = 'pellet' | 'algae' | 'prey';

/**
 * Removes the eaten item from the world (or marks prey for removal) and
 * applies the shared meal reward to the eater.
 */
function performEat(
  kind: FoodKind,
  fish: Fish,
  state: GameState,
  target: FoodPellet | Algae | Fish,
): void {
  if (kind === 'pellet') {
    const idx = state.food.indexOf(target as FoodPellet);
    if (idx !== -1) state.food.splice(idx, 1);
  } else if (kind === 'algae') {
    const idx = state.algae.indexOf(target as Algae);
    if (idx !== -1) state.algae.splice(idx, 1);
  } else {
    (target as Fish).removePending = true;
  }
  feedFish(fish);
}

/**
 * Single-pass steering + eating for one fish per frame. Previously the sim
 * searched for the nearest food item once for steering (in this function)
 * and then re-scanned the same arrays again afterward just to check eat
 * range — doubling the search cost for every hungry/starving fish. Now the
 * nearest-food result found here is reused for the post-move eat check.
 */
function updateFish(fish: Fish, state: GameState, dt: number): void {
  if (fish.dead) {
    fish.vy += 8 * dt;
    fish.vx *= 1 - dt * 0.5;
    moveFish(fish, dt);
    return;
  }

  fish.hunger += BALANCE.HUNGER_RATE * dt;
  updateHungerStage(fish);

  if (fish.breedCooldown > 0) {
    fish.breedCooldown = Math.max(0, fish.breedCooldown - dt);
  }

  if (fish.hunger >= BALANCE.DEATH_THRESHOLD) {
    fish.dead = true;
    fish.vx *= 0.2;
    fish.vy = -20;
    return;
  }

  let target: FoodPellet | Algae | Fish | null = null;
  let kind: FoodKind = 'pellet';
  let eatRadiusSq = 0;

  // Predators are noticed before anything else — a fish that's about to be
  // eaten cares more about survival than its next meal.
  const predator = fish.species === 'bass' ? null : findNearestPredator(fish, state);
  let isFleeing = false;

  if (predator) {
    const predatorDistSq = distSq(fish.x, fish.y, predator.x, predator.y);
    const hardFleeRadius = BALANCE.FLEE_DETECTION_RADIUS / 2;
    isFleeing = true;

    if (predatorDistSq < hardFleeRadius * hardFleeRadius) {
      // Danger is immediate — flee overrides food-seeking entirely.
      applyFlee(fish, predator.x, predator.y, dt);
      limitSpeed(fish, isFleeing);
      moveFish(fish, dt);
      return;
    }
  }

  if (fish.hungerStage !== 'fed') {
    // Dropped pellets can feed any species; fall back to species-specific food.
    target = findNearestPellet(fish, state);
    kind = 'pellet';
    eatRadiusSq = BALANCE.PELLET_EAT_RADIUS ** 2;

    if (!target) {
      if (fish.species === 'tilapia') {
        target = findNearestAlgae(fish, state);
        kind = 'algae';
        eatRadiusSq = BALANCE.ALGAE_EAT_RADIUS ** 2;
      } else if (fish.species === 'bass') {
        target = findNearestPrey(fish, state);
        kind = 'prey';
        eatRadiusSq = BALANCE.BASS_EAT_RADIUS ** 2;
      }
    }

    if (target) {
      const seekMultiplier =
        fish.hungerStage === 'starving'
          ? BALANCE.STARVING_SEEK_MULTIPLIER
          : 1;
      applySeek(fish, target.x, target.y, dt, seekMultiplier);
    } else {
      applyWander(fish, dt);
    }
  } else {
    applyWander(fish, dt);
  }

  // A predator lurking further away still gets blended in so the fish
  // drifts away from danger even while it keeps eating or cruising.
  if (predator) {
    applyFlee(fish, predator.x, predator.y, dt);
  }

  limitSpeed(fish, isFleeing);
  moveFish(fish, dt);

  if (target && distSq(fish.x, fish.y, target.x, target.y) <= eatRadiusSq) {
    performEat(kind, fish, state, target);
  }
}

function updatePellets(state: GameState, dt: number): void {
  for (let i = state.food.length - 1; i >= 0; i--) {
    const pellet = state.food[i];
    pellet.y += BALANCE.PELLET_SINK_SPEED * dt;
    pellet.lifetime -= dt;
    if (pellet.lifetime <= 0 || pellet.y > BALANCE.TANK_HEIGHT - 20) {
      state.food.splice(i, 1);
    }
  }
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
  });
}

function applyFishFeed(state: GameState, dt: number): void {
  if (!isFishFeedActive(state)) return;
  for (const fish of state.fish) {
    if (fish.dead) continue;
    fish.growthProgress += BALANCE.FISH_FEED_GROWTH_RATE * dt;
    advanceGrowth(fish);
  }
}

/** Whether a fish meets the minimum requirements to breed right now. */
function canBreed(fish: Fish): boolean {
  return (
    !fish.dead &&
    !fish.removePending &&
    fish.breedCooldown <= 0 &&
    fish.hunger <= BALANCE.BREED_MAX_HUNGER &&
    getGrowthOrder(fish.growthStage) >= getGrowthOrder(BALANCE.BREED_MIN_STAGE)
  );
}

/**
 * Pairs up nearby, well-fed, grown fish of the same species and spawns a
 * small offspring between them. Population is capped to avoid runaway
 * growth, and each fish can only breed once per pass through this list.
 */
function processBreeding(state: GameState): void {
  if (state.fish.length >= BALANCE.MAX_FISH) return;

  const proximitySq = BALANCE.BREED_PROXIMITY ** 2;
  const bred = new Set<number>();

  for (let i = 0; i < state.fish.length; i++) {
    const a = state.fish[i];
    if (bred.has(a.id) || !canBreed(a)) continue;

    for (let j = i + 1; j < state.fish.length; j++) {
      const b = state.fish[j];
      if (bred.has(b.id) || b.species !== a.species || !canBreed(b)) continue;
      if (distSq(a.x, a.y, b.x, b.y) > proximitySq) continue;

      const babyX = (a.x + b.x) / 2;
      const babyY = (a.y + b.y) / 2;
      const baby = createFish(a.species, babyX, babyY, state.nextEntityId++);
      state.fish.push(baby);

      a.breedCooldown = BALANCE.BREED_COOLDOWN;
      b.breedCooldown = BALANCE.BREED_COOLDOWN;
      bred.add(a.id);
      bred.add(b.id);

      if (state.fish.length >= BALANCE.MAX_FISH) return;
      break;
    }
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
  }

  updatePellets(state, dt);
  spawnAlgae(state, dt);
  applyFishFeed(state, dt);
  processBreeding(state);
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

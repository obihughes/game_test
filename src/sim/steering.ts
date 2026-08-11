import type { Fish } from './fish.ts';
import { getGrowthOrder } from './fish.ts';
import { BALANCE } from './balance.ts';
import type { Algae, FoodPellet, GameState } from './state.ts';

function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/**
 * Scales a base perception radius by how hungry the fish is, so a starving
 * fish will notice food anywhere in the tank instead of only what's nearby.
 */
function perceptionRadius(fish: Fish, baseRadius: number): number {
  switch (fish.hungerStage) {
    case 'starving':
      return baseRadius * BALANCE.STARVING_PERCEPTION_MULTIPLIER;
    case 'hungry':
      return baseRadius * BALANCE.HUNGRY_PERCEPTION_MULTIPLIER;
    default:
      return baseRadius;
  }
}

function wanderTargetBounds(): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const pad = BALANCE.FISH_BOUNDARY_MARGIN + BALANCE.FISH_WANDER_TARGET_PADDING;
  return {
    minX: pad,
    minY: pad,
    maxX: BALANCE.TANK_WIDTH - pad,
    maxY: BALANCE.TANK_HEIGHT - pad,
  };
}

/** How wide (radians) the forward cone is when biasing the next wander target. */
const WANDER_FORWARD_CONE = Math.PI * 0.65;

/**
 * Picks a new interior cruise target. When the fish already has a heading,
 * the target is biased into a forward-facing cone so fish sweep onward
 * instead of doubling back on themselves — this is what makes the idle
 * swim path read as smooth, continuous motion rather than random darting.
 */
export function pickWanderTarget(fish: Fish): void {
  const bounds = wanderTargetBounds();
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const reach = (Math.min(spanX, spanY) / 2) * (0.6 + Math.random() * 0.5);

  const speed = Math.hypot(fish.vx, fish.vy);
  const heading =
    speed > 4 ? Math.atan2(fish.vy, fish.vx) : Math.random() * Math.PI * 2;
  const angle = heading + (Math.random() - 0.5) * WANDER_FORWARD_CONE;

  let targetX = fish.x + Math.cos(angle) * reach;
  let targetY = fish.y + Math.sin(angle) * reach;

  // Clamp into the tank interior; if the forward cone pointed straight at a
  // wall, this pulls the target along the wall rather than through it.
  targetX = Math.min(bounds.maxX, Math.max(bounds.minX, targetX));
  targetY = Math.min(bounds.maxY, Math.max(bounds.minY, targetY));

  fish.wanderTargetX = targetX;
  fish.wanderTargetY = targetY;
}

function ensureWanderTarget(fish: Fish): void {
  if (fish.wanderTargetX == null || fish.wanderTargetY == null) {
    pickWanderTarget(fish);
  }
}

/** Nearest algae within perception radius, used by tilapia when hungry. */
export function findNearestAlgae(fish: Fish, state: GameState): Algae | null {
  let nearest: Algae | null = null;
  let best = perceptionRadius(fish, BALANCE.FISH_PERCEPTION_RADIUS) ** 2;

  for (const algae of state.algae) {
    const d = distSq(fish.x, fish.y, algae.x, algae.y);
    if (d < best) {
      best = d;
      nearest = algae;
    }
  }
  return nearest;
}

/** Nearest dropped pellet within perception radius — any fish can eat these. */
export function findNearestPellet(
  fish: Fish,
  state: GameState,
): FoodPellet | null {
  let nearest: FoodPellet | null = null;
  let best = perceptionRadius(fish, BALANCE.FISH_PERCEPTION_RADIUS) ** 2;

  for (const pellet of state.food) {
    const d = distSq(fish.x, fish.y, pellet.x, pellet.y);
    if (d < best) {
      best = d;
      nearest = pellet;
    }
  }
  return nearest;
}

/** Nearest fish strictly smaller than the predator, used by bass when hungry. */
export function findNearestPrey(predator: Fish, state: GameState): Fish | null {
  let nearest: Fish | null = null;
  let best = perceptionRadius(predator, BALANCE.BASS_HUNT_RADIUS) ** 2;
  const predatorOrder = getGrowthOrder(predator.growthStage);

  for (const fish of state.fish) {
    if (fish.id === predator.id || fish.dead || fish.removePending) continue;
    if (getGrowthOrder(fish.growthStage) >= predatorOrder) continue;
    const d = distSq(predator.x, predator.y, fish.x, fish.y);
    if (d < best) {
      best = d;
      nearest = fish;
    }
  }
  return nearest;
}

/**
 * Nearest bass strictly bigger than this fish within flee range — used so
 * smaller fish notice predators and dart away before they're hunted down.
 * Bass never flee (nothing hunts them here), so this only matters for prey.
 */
export function findNearestPredator(fish: Fish, state: GameState): Fish | null {
  let nearest: Fish | null = null;
  let best = BALANCE.FLEE_DETECTION_RADIUS ** 2;
  const fishOrder = getGrowthOrder(fish.growthStage);

  for (const other of state.fish) {
    if (other.id === fish.id || other.dead || other.removePending) continue;
    if (other.species !== 'bass') continue;
    if (getGrowthOrder(other.growthStage) <= fishOrder) continue;
    const d = distSq(fish.x, fish.y, other.x, other.y);
    if (d < best) {
      best = d;
      nearest = other;
    }
  }
  return nearest;
}

/**
 * Nearest same-species fish that is off its breed cooldown — used so
 * breed-eligible fish actively drift toward a potential mate instead of
 * relying purely on random proximity.
 */
export function findNearestMate(fish: Fish, state: GameState): Fish | null {
  let nearest: Fish | null = null;
  let bestSq = Infinity;

  for (const other of state.fish) {
    if (other.id === fish.id || other.dead || other.removePending) continue;
    if (other.species !== fish.species) continue;
    if (other.breedCooldown > 0) continue;
    const d =
      (fish.x - other.x) * (fish.x - other.x) +
      (fish.y - other.y) * (fish.y - other.y);
    if (d < bestSq) {
      bestSq = d;
      nearest = other;
    }
  }
  return nearest;
}

/** Steers directly away from a predator's position, ramping up as it gets closer. */
export function applyFlee(
  fish: Fish,
  predatorX: number,
  predatorY: number,
  dt: number,
): void {
  const dx = fish.x - predatorX;
  const dy = fish.y - predatorY;
  const dist = Math.hypot(dx, dy) || 1;
  // Closer predators trigger a sharper dart away; farther ones a milder nudge.
  const urgency = Math.min(
    1.5,
    BALANCE.FLEE_DETECTION_RADIUS / Math.max(dist, 1),
  );
  const strength = BALANCE.FLEE_STRENGTH * urgency;
  fish.vx += (dx / dist) * strength * dt;
  fish.vy += (dy / dist) * strength * dt;
}

export function clampToTank(fish: Fish): void {
  const margin = BALANCE.FISH_BOUNDARY_MARGIN;
  const maxX = BALANCE.TANK_WIDTH - margin;
  const maxY = BALANCE.TANK_HEIGHT - margin;
  let repickTarget = false;

  if (fish.x < margin) {
    fish.x = margin;
    if (fish.vx < 0) fish.vx *= -0.25;
    repickTarget = true;
  } else if (fish.x > maxX) {
    fish.x = maxX;
    if (fish.vx > 0) fish.vx *= -0.25;
    repickTarget = true;
  }

  if (fish.y < margin) {
    fish.y = margin;
    if (fish.vy < 0) fish.vy *= -0.25;
    repickTarget = true;
  } else if (fish.y > maxY) {
    fish.y = maxY;
    if (fish.vy > 0) fish.vy *= -0.25;
    repickTarget = true;
  }

  if (repickTarget && !fish.dead) {
    pickWanderTarget(fish);
  }
}

export function applyWander(fish: Fish, dt: number): void {
  ensureWanderTarget(fish);

  const dx = fish.wanderTargetX! - fish.x;
  const dy = fish.wanderTargetY! - fish.y;
  const dist = Math.hypot(dx, dy) || 1;

  if (dist < BALANCE.FISH_WANDER_ARRIVE_RADIUS) {
    pickWanderTarget(fish);
    return;
  }

  // Gentle drag smooths out direction changes so the fish glides through
  // turns instead of snapping onto the new target heading.
  fish.vx *= BALANCE.FISH_WANDER_DRAG;
  fish.vy *= BALANCE.FISH_WANDER_DRAG;

  const strength = BALANCE.FISH_WANDER_STRENGTH * 0.55;
  fish.vx += (dx / dist) * strength * dt;
  fish.vy += (dy / dist) * strength * dt;

  // Subtle jitter keeps motion from looking perfectly mechanical, without
  // overpowering the steering toward the target.
  fish.wanderAngle += (Math.random() - 0.5) * 0.6 * dt;
  fish.vx += Math.cos(fish.wanderAngle) * BALANCE.FISH_WANDER_STRENGTH * 0.05 * dt;
  fish.vy += Math.sin(fish.wanderAngle) * BALANCE.FISH_WANDER_STRENGTH * 0.04 * dt;
}

export function applySeek(
  fish: Fish,
  targetX: number,
  targetY: number,
  dt: number,
  strengthMultiplier = 1,
): void {
  const dx = targetX - fish.x;
  const dy = targetY - fish.y;
  const dist = Math.hypot(dx, dy) || 1;
  const strength = BALANCE.FISH_SEEK_STRENGTH * strengthMultiplier;
  const ax = (dx / dist) * strength;
  const ay = (dy / dist) * strength;
  fish.vx += ax * dt;
  fish.vy += ay * dt;
}

/**
 * Caps velocity based on hunger and whether the fish is actively fleeing a
 * predator. Multipliers are combined with `max`, not multiplied together,
 * so a starving fish that's also fleeing doesn't become unrealistically
 * fast — it just moves at whichever single boost is largest.
 */
export function limitSpeed(fish: Fish, isFleeing = false): void {
  let multiplier = 1;
  if (fish.hungerStage === 'hungry') {
    multiplier = Math.max(multiplier, BALANCE.HUNGRY_SPEED_MULTIPLIER);
  } else if (fish.hungerStage === 'starving') {
    multiplier = Math.max(multiplier, BALANCE.STARVING_SPEED_MULTIPLIER);
  }
  if (isFleeing) {
    multiplier = Math.max(multiplier, BALANCE.FLEE_SPEED_BOOST);
  }

  const speed = Math.hypot(fish.vx, fish.vy);
  const maxSpeed = BALANCE.FISH_BASE_SPEED * multiplier * (fish.dead ? 0.3 : 1);
  if (speed > maxSpeed) {
    fish.vx = (fish.vx / speed) * maxSpeed;
    fish.vy = (fish.vy / speed) * maxSpeed;
  }
}

export function moveFish(fish: Fish, dt: number): void {
  // Tail beat rate tracks actual speed so idle fish undulate lazily while
  // darting/fleeing fish whip their tails rapidly. Floor keeps even
  // near-stationary fish (including sinking dead ones) visibly animating.
  const speed = Math.hypot(fish.vx, fish.vy);
  const tailBeatRate = Math.max(3, 4 + speed * 0.06);
  fish.swimPhase += dt * tailBeatRate;
  fish.x += fish.vx * dt;
  fish.y += fish.vy * dt + Math.sin(fish.swimPhase) * 0.5;
  clampToTank(fish);
}

import type { Fish } from './fish.ts';
import { getGrowthOrder } from './fish.ts';
import { BALANCE } from './balance.ts';
import type { Algae, FoodPellet, GameState } from './state.ts';

function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Nearest algae within perception radius, used by tilapia when hungry. */
export function findNearestAlgae(fish: Fish, state: GameState): Algae | null {
  let nearest: Algae | null = null;
  let best = BALANCE.FISH_PERCEPTION_RADIUS ** 2;

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
  let best = BALANCE.FISH_PERCEPTION_RADIUS ** 2;

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
  let best = BALANCE.BASS_HUNT_RADIUS ** 2;
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

export function clampToTank(fish: Fish): void {
  const margin = BALANCE.FISH_BOUNDARY_MARGIN;
  const maxX = BALANCE.TANK_WIDTH - margin;
  const maxY = BALANCE.TANK_HEIGHT - margin;

  if (fish.x < margin) {
    fish.x = margin;
    fish.vx = Math.max(fish.vx, 20);
    fish.vx *= 0.8;
  } else if (fish.x > maxX) {
    fish.x = maxX;
    fish.vx = Math.min(fish.vx, -20);
    fish.vx *= 0.8;
  }

  if (fish.y < margin) {
    fish.y = margin;
    fish.vy = Math.max(fish.vy, 15);
    fish.vy *= 0.8;
  } else if (fish.y > maxY) {
    fish.y = maxY;
    fish.vy = Math.min(fish.vy, -15);
    fish.vy *= 0.8;
  }
}

export function applyWander(fish: Fish, dt: number): void {
  fish.wanderAngle += (Math.random() - 0.5) * 2 * dt;
  const ax = Math.cos(fish.wanderAngle) * BALANCE.FISH_WANDER_STRENGTH;
  const ay = Math.sin(fish.wanderAngle) * BALANCE.FISH_WANDER_STRENGTH * 0.6;
  fish.vx += ax * dt;
  fish.vy += ay * dt;

  // Avoid boundaries with soft steering
  const margin = BALANCE.FISH_BOUNDARY_MARGIN + 80;
  if (fish.x < margin) {
    fish.vx += BALANCE.FISH_WANDER_STRENGTH * 0.5 * dt;
  }
  if (fish.x > BALANCE.TANK_WIDTH - margin) {
    fish.vx -= BALANCE.FISH_WANDER_STRENGTH * 0.5 * dt;
  }
  if (fish.y < margin) {
    fish.vy += BALANCE.FISH_WANDER_STRENGTH * 0.4 * dt;
  }
  if (fish.y > BALANCE.TANK_HEIGHT - margin) {
    fish.vy -= BALANCE.FISH_WANDER_STRENGTH * 0.4 * dt;
  }
}

export function applySeek(
  fish: Fish,
  targetX: number,
  targetY: number,
  dt: number,
): void {
  const dx = targetX - fish.x;
  const dy = targetY - fish.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ax = (dx / dist) * BALANCE.FISH_SEEK_STRENGTH;
  const ay = (dy / dist) * BALANCE.FISH_SEEK_STRENGTH;
  fish.vx += ax * dt;
  fish.vy += ay * dt;
}

export function limitSpeed(fish: Fish): void {
  const speed = Math.hypot(fish.vx, fish.vy);
  const maxSpeed = BALANCE.FISH_BASE_SPEED * (fish.dead ? 0.3 : 1);
  if (speed > maxSpeed) {
    fish.vx = (fish.vx / speed) * maxSpeed;
    fish.vy = (fish.vy / speed) * maxSpeed;
  }
}

export function moveFish(fish: Fish, dt: number): void {
  fish.swimPhase += dt * 6;
  fish.x += fish.vx * dt;
  fish.y += fish.vy * dt + Math.sin(fish.swimPhase) * 0.5;
  clampToTank(fish);
}

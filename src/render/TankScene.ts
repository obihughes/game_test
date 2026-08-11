import Phaser from 'phaser';
import { BALANCE } from '../sim/balance.ts';
import type { FishSpecies } from '../sim/balance.ts';
import {
  createInitialState,
  removeDeadFish,
  sellFish,
  dropFood,
  buyFish,
  buyFertilizer,
  buyFishFeed,
  type GameState,
} from '../sim/state.ts';
import {
  advance,
  findFishAt,
  findDeadFishAt,
} from '../sim/tick.ts';
import {
  loadState,
  saveState,
  shouldAutosave,
  resetAutosaveTimer,
} from '../sim/save.ts';
import { generateProceduralTextures, getFishTextureKey } from './textures.ts';
import { FxManager } from './fx.ts';
import { Hud } from '../ui/hud.ts';
import { Shop } from '../ui/shop.ts';

export class TankScene extends Phaser.Scene {
  private state!: GameState;
  private fishSprites = new Map<number, Phaser.GameObjects.Image>();
  private algaeSprites = new Map<number, Phaser.GameObjects.Image>();
  private foodSprites = new Map<number, Phaser.GameObjects.Image>();
  private fx!: FxManager;
  private hud!: Hud;
  private shop!: Shop;
  private fastForward = false;
  private prevAlgaeCount = 0;
  private prevFoodCount = 0;
  private audioCtx: AudioContext | null = null;
  /** Bumped once per frame; sprites tagged with a stale tick are pruned without allocating a Set. */
  private frameTick = 0;
  constructor() {
    super('TankScene');
  }

  create(): void {
    generateProceduralTextures(this);

    this.state = loadState() ?? createInitialState();
    this.prevAlgaeCount = this.state.algae.length;
    this.prevFoodCount = this.state.food.length;

    this.drawTankBackground();
    this.fx = new FxManager(this);

    const uiOverlay = document.getElementById('ui-overlay')!;
    this.hud = new Hud(uiOverlay, () => this.state, {
      onAddMoney: () => this.shop.update(),
      onToggleFastForward: () => {
        this.fastForward = !this.fastForward;
      },
      getFastForward: () => this.fastForward,
    });
    this.shop = new Shop(uiOverlay, () => this.state, {
      onBuyFish: (species: FishSpecies) => {
        if (buyFish(this.state, species)) {
          this.shop.update();
        }
      },
      onBuyFertilizer: () => {
        if (buyFertilizer(this.state)) {
          this.shop.update();
        }
      },
      onBuyFishFeed: () => {
        if (buyFishFeed(this.state)) {
          this.shop.update();
        }
      },
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointer(pointer.x, pointer.y);
    });
  }

  private drawTankBackground(): void {
    const w = BALANCE.TANK_WIDTH;
    const h = BALANCE.TANK_HEIGHT;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d3b66, 0x0d3b66, 0x1a6b9a, 0x1a6b9a, 1);
    bg.fillRect(0, 0, w, h);

    const sand = this.add.graphics();
    sand.fillStyle(0xc2b280, 1);
    sand.fillRect(0, h - 40, w, 40);

    for (let i = 0; i < 8; i++) {
      const plant = this.add.graphics();
      const x = 60 + i * 95;
      plant.fillStyle(0x2d6a4f, 0.8);
      plant.fillTriangle(x, h - 40, x - 12, h - 100, x + 12, h - 40);
      plant.fillTriangle(x + 8, h - 40, x - 4, h - 80, x + 20, h - 40);
    }
  }

  /**
   * Lazily creates a single shared AudioContext and reuses it for every
   * beep. Constructing a new AudioContext per call is expensive (it spins
   * up an audio processing thread), and beeps fire frequently while hungry
   * fish are actively eating — reusing one context avoids that overhead.
   */
  private getAudioContext(): AudioContext | null {
    if (this.audioCtx) return this.audioCtx;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    this.audioCtx = new AudioCtx();
    return this.audioCtx;
  }

  private playBeep(freq: number, duration = 0.08): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio may be blocked until user gesture.
    }
  }

  private handlePointer(x: number, y: number): void {
    const deadFishId = findDeadFishAt(this.state, x, y);
    if (deadFishId !== null) {
      removeDeadFish(this.state, deadFishId);
      return;
    }

    const fishId = findFishAt(this.state, x, y);
    if (fishId !== null) {
      const fish = this.state.fish.find((f) => f.id === fishId);
      if (fish && sellFish(this.state, fishId)) {
        this.fx.playSellEffect(fish.x, fish.y);
        this.playBeep(880, 0.1);
        this.shop.update();
        return;
      }
    }

    if (dropFood(this.state, x, y)) {
      this.playBeep(440, 0.05);
      this.shop.update();
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const simDt = this.fastForward ? dt * BALANCE.FAST_FORWARD_MULTIPLIER : dt;
    advance(this.state, simDt);
    this.syncSprites();
    this.fx.update(simDt, BALANCE.TANK_WIDTH, BALANCE.TANK_HEIGHT);
    this.hud.update(this.state);

    if (
      this.state.algae.length < this.prevAlgaeCount ||
      this.state.food.length < this.prevFoodCount
    ) {
      this.playBeep(660, 0.06);
    }
    this.prevAlgaeCount = this.state.algae.length;
    this.prevFoodCount = this.state.food.length;

    if (shouldAutosave(this.state)) {
      saveState(this.state);
      resetAutosaveTimer(this.state);
    }
  }

  private syncSprites(): void {
    this.frameTick++;
    this.syncFish();
    this.syncAlgae();
    this.syncFood();
  }

  private syncFish(): void {
    for (const fish of this.state.fish) {
      const key = getFishTextureKey(fish);
      let sprite = this.fishSprites.get(fish.id);
      if (!sprite) {
        sprite = this.add.image(fish.x, fish.y, key).setDepth(5);
        this.fishSprites.set(fish.id, sprite);
      } else if (sprite.texture.key !== key) {
        sprite.setTexture(key);
      }
      sprite.setPosition(fish.x, fish.y);
      sprite.setFlipX(fish.vx > 0);

      // Apply hunger/death tinting with caching
      let tint = 0xffffff;
      let alpha = 1;
      if (fish.dead) {
        tint = 0x888888;
        alpha = 0.7;
      } else if (fish.hungerStage === 'starving') {
        tint = 0xffcccc;
        alpha = 1;
      } else if (fish.hungerStage === 'hungry') {
        tint = 0xffb366;
        alpha = 1;
      }

      const lastTint = sprite.getData('lastTint') ?? null;
      const lastAlpha = sprite.getData('lastAlpha') ?? null;
      if (lastTint !== tint || lastAlpha !== alpha) {
        sprite.setTint(tint);
        sprite.setAlpha(alpha);
        sprite.setData('lastTint', tint);
        sprite.setData('lastAlpha', alpha);
      }

      // Wobble amplitude varies with hunger state
      let wobbleAmp = 0.08;
      if (fish.hungerStage === 'starving') {
        wobbleAmp = 0.04;
      } else if (fish.hungerStage === 'fed') {
        wobbleAmp = 0.1;
      }
      const wobble = Math.sin(fish.swimPhase) * wobbleAmp;
      sprite.setRotation(wobble);

      if (fish.dead) {
        sprite.setAngle(90);
      }

      sprite.setData('frameTick', this.frameTick);
    }

    for (const [id, sprite] of this.fishSprites) {
      if (sprite.getData('frameTick') !== this.frameTick) {
        sprite.destroy();
        this.fishSprites.delete(id);
      }
    }
  }

  private syncAlgae(): void {
    for (const algae of this.state.algae) {
      let sprite = this.algaeSprites.get(algae.id);
      if (!sprite) {
        sprite = this.add.image(algae.x, algae.y, 'algae').setDepth(4);
        this.algaeSprites.set(algae.id, sprite);
      }
      sprite.setPosition(algae.x, algae.y);
      sprite.setData('frameTick', this.frameTick);
    }

    for (const [id, sprite] of this.algaeSprites) {
      if (sprite.getData('frameTick') !== this.frameTick) {
        sprite.destroy();
        this.algaeSprites.delete(id);
      }
    }
  }

  private syncFood(): void {
    for (const pellet of this.state.food) {
      let sprite = this.foodSprites.get(pellet.id);
      if (!sprite) {
        sprite = this.add.image(pellet.x, pellet.y, 'pellet').setDepth(8);
        this.foodSprites.set(pellet.id, sprite);
      }
      sprite.setPosition(pellet.x, pellet.y);
      sprite.setData('frameTick', this.frameTick);
    }

    for (const [id, sprite] of this.foodSprites) {
      if (sprite.getData('frameTick') !== this.frameTick) {
        sprite.destroy();
        this.foodSprites.delete(id);
      }
    }
  }

  shutdown(): void {
    saveState(this.state);
    this.fx.destroy();
    this.hud.destroy();
    this.shop.destroy();
    if (this.audioCtx) {
      void this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

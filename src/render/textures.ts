import Phaser from 'phaser';
import type { FishSpecies, GrowthStage } from '../sim/balance.ts';
import { getGrowthScale } from '../sim/fish.ts';

const SPECIES_COLORS: Record<
  FishSpecies,
  { body: number; fin: number; accent: number }
> = {
  tilapia: { body: 0x9bb06a, fin: 0x6d8a3f, accent: 0xd9e6a8 },
  bass: { body: 0x39593f, fin: 0x22351f, accent: 0x8fae6e },
};

const CANVAS_WIDTH = 176;
const CANVAS_HEIGHT = 128;
const CX = 88;
const CY = 64;
const TAIL_FRAMES = 4;

type Graphics = Phaser.GameObjects.Graphics;

function drawTilapia(
  gfx: Graphics,
  scale: number,
  bend: number,
): void {
  const colors = SPECIES_COLORS.tilapia;
  const bodyLen = 34 * scale;
  const bodyHt = 20 * scale;

  gfx.clear();

  // Body: rounded ellipse - solid base
  gfx.fillStyle(colors.body, 1);
  gfx.fillEllipse(CX, CY, bodyLen * 1.8, bodyHt * 1.6);

  // Dorsal shading band
  gfx.fillStyle(0x5c7a35, 0.8);
  gfx.fillEllipse(CX - bodyLen * 0.2, CY - bodyHt * 0.4, bodyLen * 1.2, bodyHt * 0.6);

  // Belly highlight
  gfx.fillStyle(0xd9e6a8, 0.6);
  gfx.fillEllipse(CX, CY + bodyHt * 0.3, bodyLen * 1.4, bodyHt * 0.7);

  // Barred pattern typical of tilapia
  gfx.fillStyle(0x5c7a35, 0.6);
  gfx.fillRect(CX - bodyLen * 0.5, CY - bodyHt * 0.7, 2.5 * scale, bodyHt * 1.4);
  gfx.fillRect(CX - bodyLen * 0.1, CY - bodyHt * 0.7, 2.5 * scale, bodyHt * 1.4);
  gfx.fillRect(CX + bodyLen * 0.3, CY - bodyHt * 0.7, 2.5 * scale, bodyHt * 1.4);

  // Caudal fin (tail) — varies with bend
  const tailBend = bend * 8 * scale;
  gfx.fillStyle(colors.fin, 1);
  gfx.fillTriangle(
    CX + bodyLen * 0.5,
    CY - bodyHt * 0.2,
    CX + bodyLen * 0.8 + tailBend * 0.5,
    CY - bodyHt * 0.7,
    CX + bodyLen * 1.2,
    CY,
  );
  gfx.fillTriangle(
    CX + bodyLen * 0.5,
    CY + bodyHt * 0.2,
    CX + bodyLen * 0.8 + tailBend * 0.5,
    CY + bodyHt * 0.7,
    CX + bodyLen * 1.2,
    CY,
  );

  // Dorsal fin
  gfx.fillStyle(colors.fin, 0.9);
  gfx.fillTriangle(
    CX - bodyLen * 0.15,
    CY - bodyHt * 0.5,
    CX + bodyLen * 0.05,
    CY - bodyHt * 1.1,
    CX + bodyLen * 0.35,
    CY - bodyHt * 0.5,
  );

  // Pectoral fin
  gfx.fillStyle(colors.fin, 0.8);
  gfx.fillTriangle(
    CX - bodyLen * 0.05,
    CY + bodyHt * 0.3,
    CX - bodyLen * 0.2,
    CY + bodyHt * 0.8,
    CX + bodyLen * 0.05,
    CY + bodyHt * 0.35,
  );

  // Outline
  gfx.lineStyle(2, 0x000000, 0.4);
  gfx.strokeEllipse(CX, CY, bodyLen * 1.8, bodyHt * 1.6);

  // Eye
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.4, CY - bodyHt * 0.2, 2.5 * scale);
  gfx.fillStyle(0x000000, 1);
  gfx.fillCircle(CX - bodyLen * 0.4, CY - bodyHt * 0.2, 1.5 * scale);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.38, CY - bodyHt * 0.28, 0.8 * scale);
}

function drawBass(
  gfx: Graphics,
  scale: number,
  bend: number,
): void {
  const colors = SPECIES_COLORS.bass;
  const bodyLen = 34 * scale;
  const bodyHt = 24 * scale;

  gfx.clear();

  // Body: stouter, more torpedo-shaped than tilapia — a predator silhouette
  gfx.fillStyle(colors.body, 1);
  gfx.fillEllipse(CX, CY, bodyLen * 2.0, bodyHt * 1.5);

  // Dorsal shading band
  gfx.fillStyle(0x22351f, 0.8);
  gfx.fillEllipse(CX - bodyLen * 0.15, CY - bodyHt * 0.4, bodyLen * 1.3, bodyHt * 0.6);

  // Belly highlight
  gfx.fillStyle(0x8fae6e, 0.5);
  gfx.fillEllipse(CX, CY + bodyHt * 0.3, bodyLen * 1.5, bodyHt * 0.6);

  // Mottled predator pattern
  gfx.fillStyle(0x22351f, 0.7);
  gfx.fillCircle(CX - bodyLen * 0.5, CY - bodyHt * 0.2, 2 * scale);
  gfx.fillCircle(CX - bodyLen * 0.1, CY - bodyHt * 0.35, 1.8 * scale);
  gfx.fillCircle(CX + bodyLen * 0.3, CY - bodyHt * 0.1, 1.8 * scale);
  gfx.fillCircle(CX + bodyLen * 0.1, CY + bodyHt * 0.25, 1.5 * scale);

  // Caudal fin (tail) — broad and forked
  const tailBend = bend * 9 * scale;
  gfx.fillStyle(colors.fin, 1);
  gfx.fillTriangle(
    CX + bodyLen * 0.55,
    CY - bodyHt * 0.2,
    CX + bodyLen * 0.9 + tailBend * 0.5,
    CY - bodyHt * 0.8,
    CX + bodyLen * 1.3,
    CY,
  );
  gfx.fillTriangle(
    CX + bodyLen * 0.55,
    CY + bodyHt * 0.2,
    CX + bodyLen * 0.9 + tailBend * 0.5,
    CY + bodyHt * 0.8,
    CX + bodyLen * 1.3,
    CY,
  );

  // Spiny dorsal fin — taller and sharper than tilapia's
  gfx.fillStyle(colors.fin, 0.9);
  gfx.fillTriangle(
    CX - bodyLen * 0.25,
    CY - bodyHt * 0.5,
    CX,
    CY - bodyHt * 1.25,
    CX + bodyLen * 0.4,
    CY - bodyHt * 0.5,
  );

  // Pectoral fin
  gfx.fillStyle(colors.fin, 0.8);
  gfx.fillTriangle(
    CX - bodyLen * 0.05,
    CY + bodyHt * 0.3,
    CX - bodyLen * 0.25,
    CY + bodyHt * 0.85,
    CX + bodyLen * 0.05,
    CY + bodyHt * 0.35,
  );

  // Outline
  gfx.lineStyle(2, 0x000000, 0.4);
  gfx.strokeEllipse(CX, CY, bodyLen * 2.0, bodyHt * 1.5);

  // Eye — larger, predatory
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.45, CY - bodyHt * 0.2, 3 * scale);
  gfx.fillStyle(0x000000, 1);
  gfx.fillCircle(CX - bodyLen * 0.45, CY - bodyHt * 0.2, 1.8 * scale);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.42, CY - bodyHt * 0.28, 0.9 * scale);
}

function textureKey(
  species: FishSpecies,
  stage: GrowthStage,
  frame: number,
): string {
  return `fish-${species}-${stage}-f${frame}`;
}

export function generateProceduralTextures(scene: Phaser.Scene): void {
  const speciesList: FishSpecies[] = ['tilapia', 'bass'];
  const stages: GrowthStage[] = ['small', 'medium', 'large'];
  const drawFunctions: Record<FishSpecies, typeof drawTilapia> = {
    tilapia: drawTilapia,
    bass: drawBass,
  };

  for (const species of speciesList) {
    for (const stage of stages) {
      const scale = getGrowthScale(stage);
      const drawFn = drawFunctions[species];

      for (let frame = 0; frame < TAIL_FRAMES; frame++) {
        const bend = Math.sin((frame / TAIL_FRAMES) * Math.PI * 2);
        const key = textureKey(species, stage, frame);

        if (scene.textures.exists(key)) continue;

        const gfx = scene.make.graphics({ x: 0, y: 0 });
        drawFn(gfx, scale, bend);
        gfx.generateTexture(key, CANVAS_WIDTH, CANVAS_HEIGHT);
        gfx.destroy();
      }
    }
  }

  if (!scene.textures.exists('algae')) {
    const gfx = scene.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0x3d8b3d, 0.9);
    gfx.fillCircle(9, 9, 8);
    gfx.fillStyle(0x5fbf5f, 0.8);
    gfx.fillCircle(6, 6, 4);
    gfx.fillStyle(0x2d6a2d, 0.7);
    gfx.fillCircle(12, 12, 3);
    gfx.generateTexture('algae', 18, 18);
    gfx.destroy();
  }

  if (!scene.textures.exists('bubble')) {
    const gfx = scene.make.graphics({ x: 0, y: 0 });
    gfx.lineStyle(1.5, 0xffffff, 0.5);
    gfx.strokeCircle(6, 6, 5);
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillCircle(4, 4, 2);
    gfx.generateTexture('bubble', 12, 12);
    gfx.destroy();
  }
}

export function getFishTextureKey(fish: {
  species: FishSpecies;
  growthStage: GrowthStage;
  swimPhase: number;
  dead: boolean;
}): string {
  if (fish.dead) {
    return textureKey(fish.species, fish.growthStage, 0);
  }
  const frame = Math.floor(
    (fish.swimPhase / (Math.PI * 2)) * TAIL_FRAMES,
  ) % TAIL_FRAMES;
  return textureKey(fish.species, fish.growthStage, frame);
}

export function getTailFrames(): number {
  return TAIL_FRAMES;
}

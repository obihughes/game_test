import Phaser from 'phaser';
import type { FishSpecies, GrowthStage } from '../sim/balance.ts';
import { BALANCE } from '../sim/balance.ts';
import { getGrowthScale } from '../sim/fish.ts';

const SPECIES_COLORS: Record<
  FishSpecies,
  {
    body: number;
    dorsalShade: number;
    belly: number;
    bar: number;
    fin: number;
    finTip: number;
  }
> = {
  tilapia: {
    body: 0xa8c07a,
    dorsalShade: 0x5c7a35,
    belly: 0xe8f0c0,
    bar: 0x4d6a2a,
    fin: 0x6d8a3f,
    finTip: 0xc0503a,
  },
  bass: {
    body: 0x3f5c3a,
    dorsalShade: 0x1f2e1a,
    belly: 0xd8dcc0,
    bar: 0x1a2814,
    fin: 0x2e4527,
    finTip: 0xb8a84a,
  },
};

const CANVAS_WIDTH = 176;
const CANVAS_HEIGHT = 128;
const CX = 88;
const CY = 64;
const TAIL_FRAMES = 8;

type Graphics = Phaser.GameObjects.Graphics;

/** Fills a closed polygon from a flat list of [x, y] pairs. Used for
 * multi-point fin shapes that a single triangle/ellipse can't express. */
function fillPolygon(gfx: Graphics, points: number[]): void {
  gfx.beginPath();
  gfx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    gfx.lineTo(points[i], points[i + 1]);
  }
  gfx.closePath();
  gfx.fillPath();
}

function drawTilapia(gfx: Graphics, scale: number, bend: number): void {
  const c = SPECIES_COLORS.tilapia;
  const bodyLen = 34 * scale;
  const bodyHt = 20 * scale;
  // Body flexes into a subtle S-curve: head sways opposite the tail bend,
  // so the whole silhouette reads as a swimming stroke rather than a stiff
  // body with only the tail moving.
  const headSway = -bend * 3 * scale;
  const tailSway = bend * 3 * scale;
  const tailBend = bend * 9 * scale;
  const finSweep = bend * 3 * scale;

  gfx.clear();

  gfx.fillStyle(c.body, 1);
  gfx.fillEllipse(CX, CY, bodyLen * 1.8, bodyHt * 1.6);

  // Head lobe, offset for the S-curve
  gfx.fillEllipse(CX - bodyLen * 0.55, CY + headSway * 0.5, bodyLen * 0.9, bodyHt * 1.25);

  // Tail peduncle taper — narrows toward the caudal fin
  gfx.fillEllipse(CX + bodyLen * 0.62, CY + tailSway * 0.4, bodyLen * 0.45, bodyHt * 0.6);

  // Dorsal shading band
  gfx.fillStyle(c.dorsalShade, 0.75);
  gfx.fillEllipse(CX - bodyLen * 0.2, CY - bodyHt * 0.42, bodyLen * 1.25, bodyHt * 0.55);

  // Belly highlight
  gfx.fillStyle(c.belly, 0.65);
  gfx.fillEllipse(CX, CY + bodyHt * 0.35, bodyLen * 1.4, bodyHt * 0.65);

  // Vertical barring, the classic tilapia marking
  for (let i = 0; i < 6; i++) {
    const bx = CX - bodyLen * 0.6 + i * bodyLen * 0.28;
    const alpha = 0.35 + (i % 2) * 0.15;
    gfx.fillStyle(c.bar, alpha);
    gfx.fillRect(bx, CY - bodyHt * 0.75, 2 * scale, bodyHt * 1.5);
  }

  // Lateral line
  gfx.lineStyle(1 * scale, c.dorsalShade, 0.35);
  gfx.beginPath();
  gfx.moveTo(CX - bodyLen * 0.5, CY - bodyHt * 0.05);
  gfx.lineTo(CX + bodyLen * 0.55, CY - bodyHt * 0.1);
  gfx.strokePath();

  // Scale shimmer highlights
  gfx.fillStyle(0xffffff, 0.25);
  gfx.fillEllipse(CX - bodyLen * 0.15, CY - bodyHt * 0.2, bodyLen * 0.18, bodyHt * 0.12);
  gfx.fillEllipse(CX + bodyLen * 0.15, CY - bodyHt * 0.05, bodyLen * 0.15, bodyHt * 0.1);

  // Caudal fin (tail) — varies with bend
  gfx.fillStyle(c.fin, 1);
  gfx.fillTriangle(
    CX + bodyLen * 0.5, CY - bodyHt * 0.2,
    CX + bodyLen * 0.8 + tailBend * 0.5, CY - bodyHt * 0.7,
    CX + bodyLen * 1.2, CY,
  );
  gfx.fillTriangle(
    CX + bodyLen * 0.5, CY + bodyHt * 0.2,
    CX + bodyLen * 0.8 + tailBend * 0.5, CY + bodyHt * 0.7,
    CX + bodyLen * 1.2, CY,
  );
  gfx.fillStyle(c.finTip, 0.5);
  gfx.fillTriangle(
    CX + bodyLen * 0.95, CY - bodyHt * 0.45,
    CX + bodyLen * 0.8 + tailBend * 0.5, CY - bodyHt * 0.7,
    CX + bodyLen * 1.2, CY,
  );

  // Anal fin
  gfx.fillStyle(c.fin, 0.85);
  gfx.fillTriangle(
    CX + bodyLen * 0.15, CY + bodyHt * 0.55,
    CX + bodyLen * 0.35, CY + bodyHt * 0.95,
    CX + bodyLen * 0.45, CY + bodyHt * 0.5,
  );

  // Dorsal fin — serrated multi-point ridge
  gfx.fillStyle(c.fin, 0.9);
  fillPolygon(gfx, [
    CX - bodyLen * 0.2, CY - bodyHt * 0.5,
    CX - bodyLen * 0.08, CY - bodyHt * 1.15,
    CX + bodyLen * 0.02, CY - bodyHt * 0.85,
    CX + bodyLen * 0.12, CY - bodyHt * 1.2,
    CX + bodyLen * 0.22, CY - bodyHt * 0.85,
    CX + bodyLen * 0.35, CY - bodyHt * 0.5,
  ]);

  // Pectoral fin — sweeps back and forth with the body bend
  gfx.fillStyle(c.fin, 0.8);
  gfx.fillTriangle(
    CX - bodyLen * 0.05, CY + bodyHt * 0.3,
    CX - bodyLen * 0.2 + finSweep, CY + bodyHt * 0.8,
    CX + bodyLen * 0.05, CY + bodyHt * 0.35,
  );

  // Ventral (pelvic) fins
  gfx.fillStyle(c.fin, 0.7);
  gfx.fillTriangle(
    CX + bodyLen * 0.1, CY + bodyHt * 0.5,
    CX + bodyLen * 0.02 + finSweep * 0.5, CY + bodyHt * 0.85,
    CX + bodyLen * 0.22, CY + bodyHt * 0.5,
  );

  // Outline
  gfx.lineStyle(2, 0x000000, 0.4);
  gfx.strokeEllipse(CX, CY, bodyLen * 1.8, bodyHt * 1.6);

  // Mouth
  gfx.lineStyle(1.5 * scale, 0x2a3a1a, 0.6);
  gfx.beginPath();
  gfx.moveTo(CX - bodyLen * 0.95, CY + bodyHt * 0.08);
  gfx.lineTo(CX - bodyLen * 0.82, CY + bodyHt * 0.15);
  gfx.strokePath();

  // Gill mark
  gfx.lineStyle(1.2 * scale, c.dorsalShade, 0.5);
  gfx.beginPath();
  gfx.moveTo(CX - bodyLen * 0.55, CY - bodyHt * 0.5);
  gfx.lineTo(CX - bodyLen * 0.62, CY + bodyHt * 0.45);
  gfx.strokePath();

  // Eye
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.4, CY - bodyHt * 0.2, 2.5 * scale);
  gfx.fillStyle(0x000000, 1);
  gfx.fillCircle(CX - bodyLen * 0.4, CY - bodyHt * 0.2, 1.5 * scale);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(CX - bodyLen * 0.38, CY - bodyHt * 0.28, 0.8 * scale);
}

function drawBass(gfx: Graphics, scale: number, bend: number): void {
  const c = SPECIES_COLORS.bass;
  const bodyLen = 34 * scale;
  const bodyHt = 24 * scale;
  const headSway = -bend * 3 * scale;
  const tailSway = bend * 3 * scale;
  const tailBend = bend * 10 * scale;
  const finSweep = bend * 3.5 * scale;

  gfx.clear();

  // Body: stouter, more torpedo-shaped than tilapia — a predator silhouette
  gfx.fillStyle(c.body, 1);
  gfx.fillEllipse(CX, CY, bodyLen * 2.0, bodyHt * 1.5);

  // Head lobe with a wider jaw, offset for the S-curve
  gfx.fillEllipse(CX - bodyLen * 0.6, CY + headSway * 0.5, bodyLen * 1.0, bodyHt * 1.2);

  // Tail peduncle taper
  gfx.fillEllipse(CX + bodyLen * 0.65, CY + tailSway * 0.4, bodyLen * 0.5, bodyHt * 0.55);

  // Dorsal shading band
  gfx.fillStyle(c.dorsalShade, 0.8);
  gfx.fillEllipse(CX - bodyLen * 0.15, CY - bodyHt * 0.4, bodyLen * 1.3, bodyHt * 0.6);

  // Belly highlight
  gfx.fillStyle(c.belly, 0.55);
  gfx.fillEllipse(CX, CY + bodyHt * 0.3, bodyLen * 1.5, bodyHt * 0.6);

  // Classic largemouth-bass lateral stripe — jagged blotches along the midline
  for (let i = 0; i < 6; i++) {
    const bx = CX - bodyLen * 0.55 + i * bodyLen * 0.3;
    const wobbleY = Math.sin(i * 1.3) * bodyHt * 0.1;
    gfx.fillStyle(c.bar, 0.55);
    gfx.fillEllipse(bx, CY + wobbleY, bodyLen * 0.22, bodyHt * 0.22);
  }

  // Lateral line
  gfx.lineStyle(1 * scale, c.dorsalShade, 0.35);
  gfx.beginPath();
  gfx.moveTo(CX - bodyLen * 0.55, CY - bodyHt * 0.05);
  gfx.lineTo(CX + bodyLen * 0.6, CY - bodyHt * 0.1);
  gfx.strokePath();

  // Caudal fin (tail) — broad and forked
  gfx.fillStyle(c.fin, 1);
  gfx.fillTriangle(
    CX + bodyLen * 0.55, CY - bodyHt * 0.2,
    CX + bodyLen * 0.9 + tailBend * 0.5, CY - bodyHt * 0.8,
    CX + bodyLen * 1.3, CY,
  );
  gfx.fillTriangle(
    CX + bodyLen * 0.55, CY + bodyHt * 0.2,
    CX + bodyLen * 0.9 + tailBend * 0.5, CY + bodyHt * 0.8,
    CX + bodyLen * 1.3, CY,
  );
  gfx.fillStyle(c.finTip, 0.4);
  gfx.fillTriangle(
    CX + bodyLen, CY - bodyHt * 0.5,
    CX + bodyLen * 0.9 + tailBend * 0.5, CY - bodyHt * 0.8,
    CX + bodyLen * 1.3, CY,
  );

  // Anal fin
  gfx.fillStyle(c.fin, 0.85);
  gfx.fillTriangle(
    CX + bodyLen * 0.2, CY + bodyHt * 0.5,
    CX + bodyLen * 0.4, CY + bodyHt * 0.95,
    CX + bodyLen * 0.5, CY + bodyHt * 0.45,
  );

  // Spiny dorsal fin (front, sharp) + soft dorsal (rear, rounded) — taller
  // and more angular than tilapia's
  gfx.fillStyle(c.fin, 0.9);
  fillPolygon(gfx, [
    CX - bodyLen * 0.3, CY - bodyHt * 0.5,
    CX - bodyLen * 0.22, CY - bodyHt * 1.3,
    CX - bodyLen * 0.1, CY - bodyHt * 0.85,
    CX + bodyLen * 0.02, CY - bodyHt * 1.3,
    CX + bodyLen * 0.14, CY - bodyHt * 0.85,
    CX + bodyLen * 0.26, CY - bodyHt * 1.25,
    CX + bodyLen * 0.4, CY - bodyHt * 0.5,
  ]);
  gfx.fillStyle(c.fin, 0.7);
  gfx.fillTriangle(
    CX + bodyLen * 0.4, CY - bodyHt * 0.5,
    CX + bodyLen * 0.55, CY - bodyHt * 0.85,
    CX + bodyLen * 0.68, CY - bodyHt * 0.45,
  );

  // Pectoral fin
  gfx.fillStyle(c.fin, 0.8);
  gfx.fillTriangle(
    CX - bodyLen * 0.05, CY + bodyHt * 0.3,
    CX - bodyLen * 0.25 + finSweep, CY + bodyHt * 0.85,
    CX + bodyLen * 0.05, CY + bodyHt * 0.35,
  );

  // Ventral fins
  gfx.fillStyle(c.fin, 0.7);
  gfx.fillTriangle(
    CX + bodyLen * 0.05, CY + bodyHt * 0.5,
    CX - bodyLen * 0.02 + finSweep * 0.5, CY + bodyHt * 0.9,
    CX + bodyLen * 0.2, CY + bodyHt * 0.5,
  );

  // Outline
  gfx.lineStyle(2, 0x000000, 0.4);
  gfx.strokeEllipse(CX, CY, bodyLen * 2.0, bodyHt * 1.5);

  // Open-mouth wedge — hints at the bass's characteristic large jaw
  gfx.fillStyle(0x14200f, 0.55);
  fillPolygon(gfx, [
    CX - bodyLen * 1.0, CY + bodyHt * 0.05,
    CX - bodyLen * 0.75, CY - bodyHt * 0.05,
    CX - bodyLen * 0.75, CY + bodyHt * 0.2,
  ]);

  // Gill mark
  gfx.lineStyle(1.3 * scale, c.dorsalShade, 0.55);
  gfx.beginPath();
  gfx.moveTo(CX - bodyLen * 0.6, CY - bodyHt * 0.5);
  gfx.lineTo(CX - bodyLen * 0.68, CY + bodyHt * 0.45);
  gfx.strokePath();

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
      const scale = getGrowthScale(stage) * (BALANCE.SPECIES_SIZE_SCALE[species] ?? 1.0);
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

  if (!scene.textures.exists('pellet')) {
    const gfx = scene.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0x8d5524, 1);
    gfx.fillCircle(6, 6, 6);
    gfx.fillStyle(0xb5651d, 0.8);
    gfx.fillCircle(5, 5, 3);
    gfx.generateTexture('pellet', 12, 12);
    gfx.destroy();
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

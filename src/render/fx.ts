import Phaser from 'phaser';

export class FxManager {
  private readonly scene: Phaser.Scene;
  private readonly bubbles: Phaser.GameObjects.Image[] = [];
  private bubbleTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(dt: number, tankWidth: number, tankHeight: number): void {
    this.bubbleTimer += dt;
    if (this.bubbleTimer > 0.8 && this.bubbles.length < 20) {
      this.bubbleTimer = 0;
      const bubble = this.scene.add
        .image(
          40 + Math.random() * (tankWidth - 80),
          tankHeight - 20,
          'bubble',
        )
        .setAlpha(0.4 + Math.random() * 0.3)
        .setScale(0.5 + Math.random() * 0.8)
        .setDepth(1);
      this.bubbles.push(bubble);
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      bubble.y -= 25 * dt;
      bubble.x += Math.sin(bubble.y * 0.05) * 0.3;
      if (bubble.y < -10) {
        bubble.destroy();
        this.bubbles.splice(i, 1);
      }
    }
  }

  playEatEffect(x: number, y: number): void {
    const pop = this.scene.add
      .circle(x, y, 4, 0xffffff, 0.8)
      .setDepth(20);
    this.scene.tweens.add({
      targets: pop,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 250,
      onComplete: () => pop.destroy(),
    });
  }

  playSellEffect(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const spark = this.scene.add
        .circle(x, y, 2, 0xffd700, 1)
        .setDepth(20);
      const angle = (i / 6) * Math.PI * 2;
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 300,
        onComplete: () => spark.destroy(),
      });
    }
  }

  destroy(): void {
    for (const bubble of this.bubbles) bubble.destroy();
    this.bubbles.length = 0;
  }
}

import Phaser from 'phaser';
import { BALANCE } from './sim/balance.ts';
import { TankScene } from './render/TankScene.ts';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BALANCE.TANK_WIDTH,
  height: BALANCE.TANK_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0d3b66',
  scene: [TankScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: false,
  },
  audio: {
    disableWebAudio: false,
  },
};

new Phaser.Game(config);

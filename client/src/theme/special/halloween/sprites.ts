/**
 * Pre-rendered 3D sprites (Three.js scenes, rendered offline with an alpha channel):
 * each sheet is one seamless loop, `cols` frames per row, read left to right, top to bottom.
 */
import batUrl from './sprites/bat.webp';
import ghostUrl from './sprites/ghost.webp';
import pumpkinUrl from './sprites/pumpkin.webp';
import spiderUrl from './sprites/spider.webp';

export interface SpriteSheet {
  url: string;
  frames: number;
  cols: number;
  /** Frame size in px. */
  w: number;
  h: number;
  fps: number;
}

export const SPRITES = {
  ghost: { url: ghostUrl, frames: 64, cols: 8, w: 145, h: 200, fps: 20 },
  bat: { url: batUrl, frames: 14, cols: 8, w: 180, h: 122, fps: 25 },
  spider: { url: spiderUrl, frames: 40, cols: 8, w: 169, h: 180, fps: 16.7 },
  pumpkin: { url: pumpkinUrl, frames: 24, cols: 8, w: 180, h: 154, fps: 12 },
} satisfies Record<string, SpriteSheet>;

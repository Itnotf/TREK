import type { SpriteSheet } from './sprites';

/**
 * The Halloween ambient layer: one full-viewport canvas over the page content
 * (under the navbar, menus and dialogs) that draws low fog, rising embers, bat
 * flocks, a ghost now and then and the odd flash of lightning.
 *
 * Everything that can be is pre-rendered once into sprites, the loop runs at
 * ~30 fps and stops while the tab is hidden. With `still` (reduced motion) it
 * paints the fog once and never starts the loop.
 */

type Fog = { x: number; y: number; r: number; vx: number; a: number; sprite: number; phase: number };
type Ember = { x: number; y: number; vy: number; sway: number; phase: number; size: number; life: number };
type Bat = { x: number; y: number; vx: number; vy: number; size: number; wobble: number; seed: number };
type GhostState = { x: number; y: number; vx: number; t: number; dur: number; size: number };

const FRAME_MS = 1000 / 30;
const DPR_CAP = 1.5;

function sprite(size: number, paint: (ctx: CanvasRenderingContext2D, s: number) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) paint(ctx, size);
  return c;
}

/** A lumpy fog puff: a handful of overlapping radial blobs in one colour. */
function fogSprite(rgb: string, seed: number): HTMLCanvasElement {
  return sprite(256, (ctx, s) => {
    let k = seed;
    const rnd = () => (k = (k * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 7; i++) {
      const cx = s * (0.3 + rnd() * 0.4);
      const cy = s * (0.35 + rnd() * 0.3);
      const r = s * (0.18 + rnd() * 0.22);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb},0.55)`);
      g.addColorStop(0.6, `rgba(${rgb},0.18)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function glowSprite(): HTMLCanvasElement {
  return sprite(32, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,214,140,1)');
    g.addColorStop(0.25, 'rgba(255,150,50,0.65)');
    g.addColorStop(1, 'rgba(255,110,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** The pre-rendered 3D sheets the sky draws from, loaded by the caller. */
export interface SkySprites {
  bat: { img: HTMLImageElement; sheet: SpriteSheet };
  ghost: { img: HTMLImageElement; sheet: SpriteSheet };
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  { img, sheet }: { img: HTMLImageElement; sheet: SpriteSheet },
  frame: number,
  w: number
) {
  const i = Math.floor(frame) % sheet.frames;
  const sx = (i % sheet.cols) * sheet.w;
  const sy = Math.floor(i / sheet.cols) * sheet.h;
  const h = (w * sheet.h) / sheet.w;
  ctx.drawImage(img, sx, sy, sheet.w, sheet.h, -w / 2, -h / 2, w, h);
}

export interface HalloweenSkyOptions {
  /** Paint once, never animate (reduced motion). */
  still: boolean;
  /** Skip the fog (transparency off). */
  noFog: boolean;
}

export class HalloweenSky {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private time = 0;
  private fog: Fog[] = [];
  private embers: Ember[] = [];
  private bats: Bat[] = [];
  private ghost: GhostState | null = null;
  private flash = 0;
  private nextFlock = 6;
  private nextGhost = 25;
  private nextBolt = 40;
  private fogSprites: HTMLCanvasElement[];
  private glow: HTMLCanvasElement;
  private stopped = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: HalloweenSkyOptions,
    private sprites: SkySprites
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.fogSprites = [fogSprite('120,70,180', 3), fogSprite('96,150,96', 11), fogSprite('150,110,200', 29)];
    this.glow = glowSprite();
    this.resize();
    this.seed();
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (opts.still) this.paint();
    else this.start();
  }

  destroy() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  /** The transformation moment: lightning plus a swarm bursting out of the middle. */
  burst() {
    if (this.opts.still) return;
    this.flash = 1;
    const cx = this.w / 2;
    const cy = this.h * 0.42;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.3;
      const sp = 260 + Math.random() * 320;
      this.bats.push({
        x: cx + Math.cos(a) * 20,
        y: cy + Math.sin(a) * 20,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.7 - 40,
        size: 12 + Math.random() * 18,
        wobble: Math.random() * 6,
        seed: Math.random() * 100,
      });
    }
  }

  private onVisibility = () => {
    if (this.opts.still) return;
    if (document.hidden) cancelAnimationFrame(this.raf);
    else this.start();
  };

  private resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.opts.still) this.paint();
  };

  private seed() {
    const compact = this.w < 700;
    const fogCount = compact ? 5 : 9;
    this.fog = Array.from({ length: fogCount }, (_, i) => ({
      x: Math.random() * this.w,
      y: this.h * (0.72 + Math.random() * 0.34),
      r: (compact ? 220 : 340) + Math.random() * 220,
      vx: (8 + Math.random() * 14) * (i % 2 ? 1 : -1),
      a: 0.1 + Math.random() * 0.08,
      sprite: i % this.fogSprites.length,
      phase: Math.random() * 6,
    }));
    this.embers = Array.from({ length: compact ? 12 : 24 }, () => this.newEmber(true));
  }

  private newEmber(anywhere: boolean): Ember {
    return {
      x: Math.random() * this.w,
      y: anywhere ? this.h * (0.4 + Math.random() * 0.6) : this.h + 10,
      vy: 14 + Math.random() * 26,
      sway: 10 + Math.random() * 22,
      phase: Math.random() * 6,
      size: 1 + Math.random() * 1.8,
      life: 0,
    };
  }

  private spawnFlock() {
    const fromLeft = Math.random() < 0.5;
    const n = 3 + Math.floor(Math.random() * 5);
    const y0 = this.h * (0.12 + Math.random() * 0.45);
    const sp = 120 + Math.random() * 80;
    for (let i = 0; i < n; i++) {
      this.bats.push({
        x: fromLeft ? -40 - i * 36 - Math.random() * 30 : this.w + 40 + i * 36 + Math.random() * 30,
        y: y0 + (Math.random() - 0.5) * 90,
        vx: (fromLeft ? 1 : -1) * (sp + Math.random() * 40),
        vy: (Math.random() - 0.5) * 30,
        size: 9 + Math.random() * 12,
        wobble: Math.random() * 6,
        seed: Math.random() * 100,
      });
    }
  }

  private start() {
    if (this.stopped) return;
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    const tick = (now: number) => {
      if (this.stopped) return;
      this.raf = requestAnimationFrame(tick);
      const elapsed = now - this.last;
      if (elapsed < FRAME_MS) return;
      this.last = now;
      this.step(Math.min(elapsed / 1000, 0.1));
      this.paint();
    };
    this.raf = requestAnimationFrame(tick);
  }

  private step(dt: number) {
    this.time += dt;
    for (const f of this.fog) {
      f.x += f.vx * dt;
      if (f.x < -f.r) f.x = this.w + f.r;
      if (f.x > this.w + f.r) f.x = -f.r;
    }
    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      e.life += dt;
      e.y -= e.vy * dt;
      if (e.y < this.h * 0.25) this.embers[i] = this.newEmber(false);
    }
    for (const b of this.bats) {
      b.wobble += dt * 2.2;
      b.x += b.vx * dt;
      b.y += (b.vy + Math.sin(b.wobble + b.seed) * 40) * dt;
    }
    this.bats = this.bats.filter((b) => b.x > -200 && b.x < this.w + 200 && b.y > -200 && b.y < this.h + 200);

    this.nextFlock -= dt;
    if (this.nextFlock <= 0) {
      this.spawnFlock();
      this.nextFlock = 16 + Math.random() * 18;
    }
    this.nextGhost -= dt;
    if (!this.ghost && this.nextGhost <= 0) {
      const ltr = Math.random() < 0.5;
      this.ghost = {
        x: ltr ? -80 : this.w + 80,
        y: this.h * (0.3 + Math.random() * 0.4),
        vx: (ltr ? 1 : -1) * (50 + Math.random() * 30),
        t: 0,
        dur: (this.w + 160) / 65,
        size: 70 + Math.random() * 40,
      };
      this.nextGhost = 45 + Math.random() * 40;
    }
    if (this.ghost) {
      const g = this.ghost;
      g.t += dt;
      g.x += g.vx * dt;
      if (g.t > g.dur + 2) this.ghost = null;
    }
    this.nextBolt -= dt;
    if (this.nextBolt <= 0) {
      this.flash = 0.45;
      this.nextBolt = 70 + Math.random() * 60;
    }
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.8);
  }

  private paint() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    if (!this.opts.noFog) {
      ctx.globalCompositeOperation = 'lighter';
      for (const f of this.fog) {
        const breathe = 0.85 + Math.sin(this.time * 0.4 + f.phase) * 0.15;
        ctx.globalAlpha = f.a * breathe;
        const s = f.r * 2;
        ctx.drawImage(this.fogSprites[f.sprite], f.x - f.r, f.y - f.r * 0.6, s, s * 0.6);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    if (!this.opts.still) {
      ctx.globalCompositeOperation = 'lighter';
      for (const e of this.embers) {
        const flicker = 0.5 + Math.sin(e.life * 9 + e.phase) * 0.3;
        const fade = Math.min(1, (e.y - h * 0.25) / (h * 0.3));
        ctx.globalAlpha = Math.max(0, flicker * fade) * 0.8;
        const x = e.x + Math.sin(e.life * 1.3 + e.phase) * e.sway;
        const s = e.size * 7;
        ctx.drawImage(this.glow, x - s / 2, e.y - s / 2, s, s);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      if (this.ghost) {
        const g = this.ghost;
        const fadeIn = Math.min(1, g.t / 2);
        const fadeOut = Math.min(1, Math.max(0, (g.dur - g.t) / 2));
        const fade = fadeIn * fadeOut;
        const y = g.y + Math.sin(g.t * 1.6) * 14;
        ctx.save();
        ctx.translate(g.x, y);
        // a cold halo first, then the ghost itself, half there
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.18 * fade;
        const halo = g.size * 2.2;
        ctx.drawImage(this.glow, -halo / 2, -halo / 2, halo, halo);
        ctx.globalCompositeOperation = 'source-over';
        if (g.vx < 0) ctx.scale(-1, 1);
        ctx.rotate(Math.sin(g.t * 1.1) * 0.06);
        ctx.globalAlpha = 0.62 * fade;
        drawFrame(ctx, this.sprites.ghost, this.time * this.sprites.ghost.sheet.fps, g.size);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      for (const b of this.bats) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, Math.abs(b.vx)) * 0.35 * Math.sign(b.vx || 1));
        if (b.vx < 0) ctx.scale(-1, 1);
        const rate = this.sprites.bat.sheet.fps * (0.85 + (b.seed % 1) * 0.3);
        drawFrame(ctx, this.sprites.bat, this.time * rate + b.seed, b.size * 2.4);
        ctx.restore();
      }

      if (this.flash > 0) {
        ctx.globalAlpha = this.flash * 0.22;
        ctx.fillStyle = '#d9ccff';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    }
  }
}

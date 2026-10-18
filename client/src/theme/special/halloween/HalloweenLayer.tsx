import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cobweb } from './art';
import './halloween.css';
import { HalloweenSky, type SkySprites } from './halloweenSky';
import Sprite from './Sprite';
import { SPRITES } from './sprites';

/**
 * Everything the Halloween theme hangs over the app, mounted only while
 * `html[data-scheme="halloween"]` is set (see `SpecialThemeLayer`).
 *
 * Two fixed, click-through layers, portalled to <body> so no page's stacking
 * context can trap them:
 *  - the sky (canvas: fog, embers, bats, ghost) above the page content and
 *    below the navbar (`--z-decor-ambient`);
 *  - the decor (corner webs, dangling spiders) above the
 *    navbar and below every menu, dialog and toast (`--z-decor`).
 * Only a spider's body takes clicks, so poking one sends it back up its thread.
 */

function readFlags() {
  const root = document.documentElement;
  const still =
    root.hasAttribute('data-reduce-motion') || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return { still, noFog: root.hasAttribute('data-no-transparency') };
}

function useMotionFlags() {
  const [flags, setFlags] = useState(readFlags);
  useEffect(() => {
    const update = () => setFlags(readFlags());
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduce-motion', 'data-no-transparency'],
    });
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener('change', update);
    return () => {
      mo.disconnect();
      mq?.removeEventListener('change', update);
    };
  }, []);
  return flags;
}

function Sky({
  intro,
  onIntro,
  still,
  noFog,
}: {
  intro: boolean;
  onIntro: () => void;
  still: boolean;
  noFog: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sky = useRef<HalloweenSky | null>(null);
  const [sprites, setSprites] = useState<SkySprites | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    Promise.all([load(SPRITES.bat.url), load(SPRITES.ghost.url)])
      .then(([bat, ghost]) => {
        if (!cancelled)
          setSprites({ bat: { img: bat, sheet: SPRITES.bat }, ghost: { img: ghost, sheet: SPRITES.ghost } });
      })
      // A sheet that fails to load leaves the sky out; the rest of the theme stands on its own.
      .catch((e: unknown) => console.warn('halloween sprites', e));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !sprites) return;
    try {
      sky.current = new HalloweenSky(canvas, { still, noFog }, sprites);
    } catch {
      // No 2d context (old WebView, headless): the theme still works without its sky.
      return;
    }
    return () => {
      sky.current?.destroy();
      sky.current = null;
    };
  }, [still, noFog, sprites]);
  // Its own effect so that marking the intro as played does not rebuild the sky mid-swarm.
  useEffect(() => {
    if (!intro || !sky.current) return;
    sky.current.burst();
    onIntro();
  }, [intro, onIntro, sprites]);
  return <canvas ref={ref} className="hw-sky" />;
}

/* ── Dangling spiders ─────────────────────────────────────────────────────── */

type Drop = { id: number; x: number; depth: number; phase: 'down' | 'hang' | 'up'; size: number; offset: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function SpiderDrops({ still }: { still: boolean }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (still) return;
    const timers = new Set<number>();
    const later = (ms: number, fn: () => void) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const spawn = () => {
      const id = nextId.current++;
      const drop: Drop = {
        id,
        x: rand(8, 92),
        depth: rand(18, 46),
        phase: 'down',
        size: rand(54, 78),
        offset: Math.random(),
      };
      setDrops((d) => [...d.slice(-2), drop]);
      // Descend (CSS transition), dangle for a while, climb back, vanish.
      later(rand(7000, 11000), () => setDrops((d) => d.map((x) => (x.id === id ? { ...x, phase: 'up' } : x))));
      later(16000, () => setDrops((d) => d.filter((x) => x.id !== id)));
      later(rand(15000, 30000), spawn);
    };
    later(2500, spawn);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [still]);

  // Next frame after mount: flip 'down' so the transition actually runs.
  useEffect(() => {
    if (!drops.some((d) => d.phase === 'down')) return;
    const raf = requestAnimationFrame(() =>
      setDrops((d) => d.map((x) => (x.phase === 'down' ? { ...x, phase: 'hang' } : x)))
    );
    return () => cancelAnimationFrame(raf);
  }, [drops]);

  const flee = (id: number) => setDrops((d) => d.map((x) => (x.id === id ? { ...x, phase: 'up' } : x)));

  if (still) {
    return (
      <div
        className="hw-drop hw-drop--hang hw-drop--still"
        style={{ insetInlineEnd: '14%', ['--hw-depth' as string]: '22vh' }}
      >
        <Sprite sheet={SPRITES.spider} height={64} still />
      </div>
    );
  }

  return (
    <>
      {drops.map((d) => (
        <div
          key={d.id}
          className={`hw-drop hw-drop--${d.phase}`}
          style={{ insetInlineStart: `${d.x}%`, ['--hw-depth' as string]: `${d.depth}vh` }}
        >
          <button type="button" tabIndex={-1} aria-hidden="true" className="hw-drop-body" onClick={() => flee(d.id)}>
            <Sprite sheet={SPRITES.spider} height={d.size} offset={d.offset} />
          </button>
        </div>
      ))}
    </>
  );
}

export default function HalloweenLayer({
  intro,
  onIntro,
  panelsOnly,
}: {
  intro: boolean;
  onIntro: () => void;
  /** Map pages: the stylesheet dresses the side panels, nothing is laid over the map. */
  panelsOnly: boolean;
}) {
  const { still, noFog } = useMotionFlags();
  if (panelsOnly) return null;
  return createPortal(
    <>
      <div className="hw-ambient" aria-hidden="true">
        <Sky intro={intro} onIntro={onIntro} still={still} noFog={noFog} />
        <div className="hw-vignette" />
      </div>
      <div className="hw-decor" aria-hidden="true">
        <Cobweb size={210} seed={7} className="hw-web hw-web--tl" />
        <Cobweb size={180} seed={19} broken className="hw-web hw-web--tr" />
        <Cobweb size={120} seed={31} spokes={7} rings={5} className="hw-web hw-web--bl" />
        <div className="hw-patch">
          <Sprite sheet={SPRITES.pumpkin} height={70} still={still} offset={0.1} className="hw-patch-1" />
          <Sprite sheet={SPRITES.pumpkin} height={50} still={still} offset={0.55} className="hw-patch-2" />
          <Sprite sheet={SPRITES.pumpkin} height={38} still={still} offset={0.8} className="hw-patch-3" />
        </div>
        <SpiderDrops still={still} />
      </div>
    </>,
    document.body
  );
}

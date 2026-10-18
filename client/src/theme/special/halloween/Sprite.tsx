import { useEffect, useRef } from 'react';
import type { SpriteSheet } from './sprites';

/**
 * Plays a sprite sheet in a span: steps `background-position` through the
 * frames on requestAnimationFrame at the sheet's own fps. `still` holds the
 * first frame (reduced motion). `offset` starts the loop part-way through so
 * several copies on one screen don't move in lockstep.
 */
export default function Sprite({
  sheet,
  height,
  still = false,
  offset = 0,
  className = '',
}: {
  sheet: SpriteSheet;
  height: number;
  still?: boolean;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const scale = height / sheet.h;
  const fw = sheet.w * scale;
  const fh = height;
  const rows = Math.ceil(sheet.frames / sheet.cols);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = (i: number) => {
      el.style.backgroundPosition = `${-(i % sheet.cols) * fw}px ${-Math.floor(i / sheet.cols) * fh}px`;
    };
    const first = Math.floor(offset * sheet.frames) % sheet.frames;
    show(first);
    if (still) return;
    let raf = 0;
    let last = -1;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const i = (first + Math.floor(((now - t0) / 1000) * sheet.fps)) % sheet.frames;
      if (i !== last) {
        last = i;
        show(i);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sheet, fw, fh, still, offset]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`inline-block bg-no-repeat ${className}`}
      style={{
        width: fw,
        height: fh,
        backgroundImage: `url(${sheet.url})`,
        backgroundSize: `${sheet.cols * fw}px ${rows * fh}px`,
      }}
    />
  );
}

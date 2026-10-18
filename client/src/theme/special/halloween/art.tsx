/**
 * The cobweb, drawn as SVG and coloured from the --hw-* tokens in
 * halloween.tokens.css. The figures (ghost, bats, spiders, pumpkins) are
 * pre-rendered 3D sprites (sprites.ts); silk is the one thing that stays
 * sharpest as vector lines.
 */

/* ── Cobweb ─────────────────────────────────────────────────────────────────
   A corner web anchored at (0,0): spokes fan out over a quarter circle and the
   capture spiral hangs between them, each strand sagging towards the hub the way
   silk does under its own weight. Deterministic per `seed`, so a re-render never
   reshuffles the threads. */

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Web = { spokes: string; rings: string; strays: string; dew: [number, number, number][] };

function cobwebPaths(seed: number, spokes: number, rings: number): Web {
  const r = rng(seed);
  const angles: number[] = [];
  for (let i = 0; i < spokes; i++) {
    const t = i / (spokes - 1);
    angles.push((t * 90 + (i > 0 && i < spokes - 1 ? (r() - 0.5) * 8 : 0)) * (Math.PI / 180));
  }
  const len = angles.map(() => 90 + r() * 10);
  let spokePath = '';
  angles.forEach((a, i) => {
    // spokes bow a touch, as anchored silk does
    const ex = Math.cos(a) * len[i];
    const ey = Math.sin(a) * len[i];
    const bow = (r() - 0.5) * 4;
    spokePath += `M0 0Q${(ex / 2 - Math.sin(a) * bow).toFixed(1)} ${(ey / 2 + Math.cos(a) * bow).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  });
  let ringPath = '';
  let strays = '';
  const dew: [number, number, number][] = [];
  for (let k = 1; k <= rings; k++) {
    // the capture spiral tightens towards the hub
    const base = Math.pow(k / (rings + 0.5), 1.15) * 96;
    const pts = angles.map((a) => {
      const rr = base * (0.93 + r() * 0.12);
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
    // the odd gap: a ring that tore between two spokes
    const gap = r() < 0.35 ? 1 + Math.floor(r() * (pts.length - 2)) : -1;
    ringPath += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const sag = 0.8 - r() * 0.07;
      if (i === gap) {
        // torn: one end hangs down
        strays += `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${(mx * sag).toFixed(1)} ${(my * sag + 6).toFixed(1)} ${(mx + 2).toFixed(1)} ${(my + 10 + r() * 8).toFixed(1)}`;
        ringPath += `M${x1.toFixed(1)} ${y1.toFixed(1)}`;
      } else {
        ringPath += `Q${(mx * sag).toFixed(1)} ${(my * sag).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      }
      if (r() < 0.12) dew.push([+(mx * (sag + 0.06)).toFixed(1), +(my * (sag + 0.06)).toFixed(1), 0.5 + r() * 0.6]);
    }
  }
  return { spokes: spokePath, rings: ringPath, strays, dew };
}

const WEB_CACHE = new Map<string, Web>();

export function Cobweb({
  size,
  seed = 7,
  spokes = 12,
  rings = 11,
  className = '',
  broken = false,
}: {
  size: number;
  seed?: number;
  spokes?: number;
  rings?: number;
  className?: string;
  /** Leaves a long torn strand dangling off the outer ring. */
  broken?: boolean;
}) {
  const key = `${seed}:${spokes}:${rings}`;
  let web = WEB_CACHE.get(key);
  if (!web) {
    web = cobwebPaths(seed, spokes, rings);
    WEB_CACHE.set(key, web);
  }
  return (
    <svg width={size} height={size} viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        {/* a soft second pass under the silk reads as the glow of moonlit thread */}
        <path d={web.spokes} stroke="var(--hw-web-faint)" strokeWidth="1.6" />
        <path d={web.spokes} stroke="var(--hw-web)" strokeWidth="0.5" />
        <path d={web.rings} stroke="var(--hw-web-faint)" strokeWidth="1.1" />
        <path d={web.rings} stroke="var(--hw-web)" strokeWidth="0.36" />
        <path d={web.strays} stroke="var(--hw-web)" strokeWidth="0.32" />
        {broken && <path d="M74 44 Q80 58 76 72 Q74 78 77 84" stroke="var(--hw-web)" strokeWidth="0.35" />}
        <g fill="var(--hw-dew, #fff)">
          {web.dew.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className="hw-dew" style={{ animationDelay: `${(i * 0.73) % 5}s` }} />
          ))}
        </g>
      </g>
    </svg>
  );
}

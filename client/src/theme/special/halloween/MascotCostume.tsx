/**
 * The mascot's Halloween costume, drawn in the mascot's own 88×96 viewBox.
 *
 * The hat sits inside `.trek-body`, so it breathes, hops and nods with the mark;
 * its brim follows the head's top bar (≈ y 22, tilted a few degrees) and stays
 * clear of every scene prop, which all live at x ≥ 58 or below y 25 on the left.
 * The pumpkin stands by the left foot, outside the body, so it stays put while
 * the mascot bounces next to it.
 */

/** Witch hat, crooked tip, orange band with a buckle, and a spider on a thread. */
export function MascotHat() {
  return (
    <g className="hw-mascot-hat" transform="rotate(-6 42 22)">
      <g className="hw-mascot-hat-sway">
        {/* cone, bent backwards at the tip */}
        <path
          d="M30.5 21.6 C33.5 15.5 37 10 41 6.2 C44.5 3 49 1.4 54.5 2.6 C50.5 4.4 48.4 6.6 47.6 9.6 C48.4 13.6 50.6 17.6 53.6 21.4 Z"
          fill="var(--hw-hat)"
        />
        <path d="M41 6.2 C44.5 3 49 1.4 54.5 2.6 C50.8 3.6 47.4 5.2 45 8.4 Z" fill="var(--hw-hat-hi)" opacity="0.8" />
        {/* band + buckle */}
        <path d="M32.2 18.3 C38.5 17.2 45.5 17 51.8 18.1 L53 21 C46 19.9 38.4 20 31 21.2 Z" fill="var(--hw-hat-band)" />
        <rect
          x="39.6"
          y="17.3"
          width="4.6"
          height="3.6"
          rx="0.6"
          fill="none"
          stroke="var(--hw-buckle)"
          strokeWidth="0.9"
        />
        {/* brim */}
        <ellipse cx="42.2" cy="22.2" rx="16.6" ry="2.9" fill="var(--hw-hat)" />
        <path d="M26 22.4 Q42 25.6 58.4 22.2" stroke="var(--hw-hat-hi)" strokeWidth="0.7" fill="none" />
        {/* a spider dangling off the brim's right edge */}
        <g className="hw-mascot-spider">
          <line x1="57.4" y1="22.6" x2="57.4" y2="33" stroke="var(--hw-web)" strokeWidth="0.35" />
          <ellipse cx="57.4" cy="34.2" rx="1.6" ry="1.9" fill="var(--hw-spider)" />
          <g stroke="var(--hw-spider)" strokeWidth="0.45" fill="none" strokeLinecap="round">
            <path d="M56.1 33.6 L54.4 32.6 M56.1 34.4 L54.2 34.8 M56.2 35.1 L54.8 36.6" />
            <path d="M58.7 33.6 L60.4 32.6 M58.7 34.4 L60.6 34.8 M58.6 35.1 L60 36.6" />
          </g>
        </g>
      </g>
    </g>
  );
}

/** A small lit jack-o'-lantern by the mascot's left foot. */
export function MascotPumpkin({ groundY }: { groundY: number }) {
  const y = groundY - 13;
  return (
    <g className="hw-mascot-pumpkin" transform={`translate(9 ${y})`}>
      <path d="M7.4 2.6 C7.2 1.2 7.6 0.4 8.8 -0.4 C9 0.6 8.8 1.6 8.4 2.6 Z" fill="var(--hw-stem)" />
      <ellipse cx="4.6" cy="7.6" rx="3.8" ry="5" fill="var(--hw-pumpkin-lo)" />
      <ellipse cx="11.4" cy="7.6" rx="3.8" ry="5" fill="var(--hw-pumpkin-lo)" />
      <ellipse cx="6.4" cy="7.6" rx="3.6" ry="5.3" fill="var(--hw-pumpkin)" />
      <ellipse cx="9.6" cy="7.6" rx="3.6" ry="5.3" fill="var(--hw-pumpkin)" />
      <g className="hw-pumpkin-face" fill="var(--hw-ember)">
        <path d="M4.4 6.2 L6.2 5 L6.6 7 Z M11.6 6.2 L9.8 5 L9.4 7 Z" />
        <path d="M4 9 Q8 12.6 12 9 L10.8 9.6 L10 8.9 L9 10 L8 9 L7 10 L6 8.9 L5.2 9.6 Z" />
      </g>
    </g>
  );
}

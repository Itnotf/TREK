import { lazy, Suspense, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { useActiveScheme } from '../../hooks/useActiveScheme';

const HalloweenLayer = lazy(() => import('./halloween/HalloweenLayer'));

/**
 * Mounts a special theme's decor while its scheme is on `<html>`. The decor and
 * its stylesheet are their own chunk, so nobody downloads bats they never see.
 *
 * `intro` is true right after the theme was switched on during this visit,
 * which plays the transformation once.
 *
 * Nothing is drawn over a map. The Atlas world map gets no decor at all; the
 * trip planner keeps its map clear and dresses only its side panels (CSS in
 * halloween.css, which still has to load there).
 */
const NO_DECOR = [/^\/atlas(\/|$)/];
const PANELS_ONLY = [/^\/trips\/[^/]+\/?$/];
export default function SpecialThemeLayer() {
  const scheme = useActiveScheme();
  // Armed while another scheme is on; switching to Halloween then plays the
  // transformation once (not on a page load that starts in costume, and not
  // again every time a map page hands the layer back).
  const [armed, setArmed] = useState(scheme !== 'halloween');
  if (scheme !== 'halloween' && !armed) setArmed(true);
  const onIntro = useCallback(() => setArmed(false), []);
  const { pathname } = useLocation();
  if (scheme !== 'halloween') return null;
  if (NO_DECOR.some((re) => re.test(pathname))) return null;
  const panelsOnly = PANELS_ONLY.some((re) => re.test(pathname));
  return (
    <Suspense fallback={null}>
      <HalloweenLayer panelsOnly={panelsOnly} intro={armed && !panelsOnly} onIntro={onIntro} />
    </Suspense>
  );
}

import { useEffect, useState } from 'react';

const read = (): string =>
  (typeof document !== 'undefined' && document.documentElement.getAttribute('data-scheme')) || 'default';

/**
 * The scheme currently on `<html data-scheme>`, as `applyAppearance()` and the
 * pre-paint boot script wrote it. Same contract as `useIsDark`: components read
 * the DOM, never the appearance config, so shared pages (which drop the
 * attribute) and the live preview in settings are covered for free.
 *
 * Only for decor that has to exist in the DOM, like a special theme's overlay
 * or the mascot's hat. Colours belong on tokens.
 */
export function useActiveScheme(): string {
  const [scheme, setScheme] = useState<string>(read);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const mo = new MutationObserver(() => setScheme(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });
    return () => mo.disconnect();
  }, []);

  return scheme;
}

import { useEffect, useLayoutEffect, useRef } from 'react';

const MARK = 'trekBackLayer';
type Layer = { back: () => void; priority: number };
const layers: Layer[] = [];
let entryUrl = '';
let baseUrl = '';
let entryState: unknown;
let baseState: unknown;
const replacements = new Map<string, { from: string; to: string; state: unknown }>();
let removing = false;
let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
let restoreHistory: (() => void) | undefined;
let restoreEntry: (() => void) | undefined;
let initialized = false;

const ownsEntry = () => window.history.state?.[MARK] === true;
const historyKey = (state: unknown) => {
  const entry = state as { idx?: number; key?: string } | null;
  return JSON.stringify([entry?.idx, entry?.key]);
};
const topLayer = () => layers.reduce<Layer | undefined>((top, layer) =>
  !top || layer.priority >= top.priority ? layer : top, undefined);

function pushEntry() {
  if (ownsEntry()) return;
  entryUrl = window.location.href;
  baseUrl = entryUrl;
  entryState = window.history.state;
  baseState = entryState;
  window.history.pushState({ ...window.history.state, [MARK]: true }, '');
}

function onPop(event: PopStateEvent) {
  const key = historyKey(window.history.state);
  const replacement = replacements.get(key);
  if (replacement && window.location.href === replacement.from) {
    window.history.replaceState(replacement.state, '', replacement.to);
    replacements.delete(key);
  }
  if (!restoreHistory) return;
  if (window.location.href !== baseUrl) return;
  // A temporary UI step must not make the router remount the page below it.
  event.stopImmediatePropagation();
  // A route may replace its search parameters while a surface is open.
  // Closing that surface must preserve the route's latest URL and router state.
  restoreEntry?.();
  if (removing) {
    removing = false;
    if (layers.length) pushEntry();
    else finish();
    return;
  }
  const top = topLayer();
  if (!top) return;
  // Keep the step until React commits the close, including a dirty-form question.
  pushEntry();
  top.back();
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  const top = topLayer();
  if (!top) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  top.back();
}

function finish() {
  window.removeEventListener('keydown', onKey);
  restoreHistory?.();
  restoreHistory = undefined;
  restoreEntry = undefined;
}

function start() {
  initializeMobileBack();
  const originalPush = window.history.pushState;
  const originalReplace = window.history.replaceState;
  restoreEntry = () => originalReplace.call(window.history, entryState, '', entryUrl);
  // Choosing a destination from a sheet consumes its temporary entry. Otherwise
  // Back would return to a closed menu's duplicate URL before the real page.
  window.history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
    if (ownsEntry()) {
      // A previous replace also belongs to the page we will return to.
      if (entryState !== baseState || entryUrl !== baseUrl) {
        replacements.set(historyKey(baseState), { from: baseUrl, to: entryUrl, state: entryState });
      }
      originalReplace.call(this, data, unused, url);
    }
    else originalPush.call(this, data, unused, url);
  };
  window.history.replaceState = function (data: unknown, unused: string, url?: string | URL | null) {
    if (ownsEntry()) {
      entryState = data;
      originalReplace.call(this, { ...(data as object | null), [MARK]: true }, unused, url);
      entryUrl = window.location.href;
    } else originalReplace.call(this, data, unused, url);
  };
  restoreHistory = () => {
    window.history.pushState = originalPush;
    window.history.replaceState = originalReplace;
  };
  // Inline editors get Escape first, before it dismisses their containing sheet.
  window.addEventListener('keydown', onKey);
}

/** Register before BrowserRouter: Chrome runs window popstate listeners in registration order. */
export function initializeMobileBack(): void {
  if (initialized) return;
  initialized = true;
  window.addEventListener('popstate', onPop, true);
}

/** One shared browser-Back step; the foremost mobile surface handles it first. */
export function useBackLayer(open: boolean, onBack: () => void, priority = 40): void {
  const back = useRef(onBack);
  useLayoutEffect(() => { back.current = onBack; });

  useEffect(() => {
    if (!open) return;
    clearTimeout(cleanupTimer);
    if (!restoreHistory) start();
    const layer = { back: () => back.current(), priority };
    layers.push(layer);
    if (!removing) pushEntry();
    return () => {
      layers.splice(layers.indexOf(layer), 1);
      // Defer so a replacement sheet, navigation, or StrictMode setup can finish.
      cleanupTimer = setTimeout(() => {
        if (layers.length || removing) return;
        if (ownsEntry()) {
          removing = true;
          window.history.back();
        } else finish();
      }, 0);
    };
  }, [open, priority]);
}

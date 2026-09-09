"use client";

import { useCallback, useSyncExternalStore } from "react";

// Generic localStorage-backed list of property ids, shared by the
// favorites, compare and recently-viewed features. Logged-out visitors get
// full functionality client-side; a logged-in account could later sync the
// same ids server-side (Favorite model already supports userId).
//
// Built on useSyncExternalStore rather than useState+useEffect: localStorage
// is an external store, and this is the store's actual value at read time —
// not state React owns — so subscribing is the correct primitive (and avoids
// the "setState synchronously in an effect" anti-pattern).
//
// getSnapshot must return a referentially stable value when nothing changed —
// JSON.parse allocates a new array on every call, which made React see a
// "changed" snapshot on every render and re-render forever (React error #185,
// crashing the tab). This cache returns the same array reference until the
// underlying raw string actually changes.
const snapshotCache = new Map<string, { raw: string | null; ids: string[] }>();

function readIds(key: string): string[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.ids;
  }

  let ids: string[];
  try {
    ids = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    ids = [];
  }
  snapshotCache.set(key, { raw, ids });
  return ids;
}

function writeIds(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(`bok:${key}`, { detail: ids }));
  } catch {
    // localStorage unavailable (private mode, etc.) — fail silently
  }
}

const emptySnapshot: string[] = [];

function subscribe(key: string, onStoreChange: () => void) {
  window.addEventListener(`bok:${key}`, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(`bok:${key}`, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useLocalIds(key: string, max?: number) {
  const ids = useSyncExternalStore(
    (onStoreChange) => subscribe(key, onStoreChange),
    () => readIds(key),
    () => emptySnapshot
  );

  const add = useCallback(
    (id: string) => {
      const prev = readIds(key);
      if (prev.includes(id)) return;
      const next = max ? [...prev, id].slice(-max) : [...prev, id];
      writeIds(key, next);
    },
    [key, max]
  );

  const remove = useCallback(
    (id: string) => {
      const next = readIds(key).filter((x) => x !== id);
      writeIds(key, next);
    },
    [key]
  );

  const toggle = useCallback(
    (id: string) => {
      const prev = readIds(key);
      const exists = prev.includes(id);
      const next = exists
        ? prev.filter((x) => x !== id)
        : max
        ? [...prev, id].slice(-max)
        : [...prev, id];
      writeIds(key, next);
    },
    [key, max]
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, add, remove, toggle, has };
}

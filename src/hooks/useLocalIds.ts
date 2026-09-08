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
function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
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

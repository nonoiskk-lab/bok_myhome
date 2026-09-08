"use client";

import { useLocalIds } from "@/hooks/useLocalIds";
import { MAX_COMPARE_PROPERTIES } from "@/lib/constants";

export function useCompare() {
  const { ids, toggle, has, remove } = useLocalIds("compare", MAX_COMPARE_PROPERTIES);
  return {
    compareIds: ids,
    toggleCompare: toggle,
    isComparing: has,
    removeFromCompare: remove,
    isFull: ids.length >= MAX_COMPARE_PROPERTIES,
  };
}

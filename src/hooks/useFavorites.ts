"use client";

import { useLocalIds } from "@/hooks/useLocalIds";

export function useFavorites() {
  const { ids, toggle, has, remove } = useLocalIds("favorites");
  return { favoriteIds: ids, toggleFavorite: toggle, isFavorite: has, removeFavorite: remove };
}

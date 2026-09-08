"use client";

import { useEffect } from "react";
import { useLocalIds } from "@/hooks/useLocalIds";

const MAX_RECENT = 8;

export function useRecentlyViewed() {
  return useLocalIds("recently-viewed", MAX_RECENT);
}

export function useTrackRecentlyViewed(propertyId: string) {
  const { add } = useRecentlyViewed();
  useEffect(() => {
    add(propertyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);
}

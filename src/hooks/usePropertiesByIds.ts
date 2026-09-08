"use client";

import { useEffect, useState } from "react";
import type { PropertyCardData } from "@/lib/types";

export function usePropertiesByIds(ids: string[]) {
  const [fetched, setFetched] = useState<{ key: string; properties: PropertyCardData[] } | null>(
    null
  );
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/properties?ids=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFetched({ key, properties: data.properties ?? [] });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) {
    return { properties: [] as PropertyCardData[], loading: false };
  }

  return {
    properties: fetched?.key === key ? fetched.properties : [],
    loading: fetched?.key !== key,
  };
}

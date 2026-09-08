"use client";

import { useTrackRecentlyViewed } from "@/hooks/useRecentlyViewed";

export function RecentlyViewedTracker({ propertyId }: { propertyId: string }) {
  useTrackRecentlyViewed(propertyId);
  return null;
}

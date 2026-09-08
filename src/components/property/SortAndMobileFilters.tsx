"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterPanel } from "@/components/property/FilterPanel";

export function SortAndMobileFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sort = searchParams.get("sort") ?? "newest";

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-full border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <span className="hidden text-sm text-slate-500 lg:inline">{resultCount} results</span>
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="ml-auto rounded-full border border-navy-950/15 px-4 py-2 text-sm font-medium text-navy-950 lg:ml-0"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="area-desc">Largest Area</option>
        </select>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-cream-50 p-5 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-navy-950">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

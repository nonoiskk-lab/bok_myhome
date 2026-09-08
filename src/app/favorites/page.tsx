"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { usePropertiesByIds } from "@/hooks/usePropertiesByIds";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const { properties, loading } = usePropertiesByIds(favoriteIds);
  const { toggleCompare, isComparing, isFull } = useCompare();

  return (
    <div className="container-page py-10">
      <h1 className="font-serif text-2xl text-navy-950 sm:text-3xl">Saved Properties</h1>
      <p className="mt-1 text-sm text-slate-600">
        Properties you&apos;ve saved on this device. Add up to 4 to compare side by side.
      </p>

      {!loading && properties.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-navy-950/15 bg-white p-12 text-center">
          <Heart className="h-8 w-8 text-slate-300" />
          <h2 className="font-semibold text-navy-950">No saved properties yet</h2>
          <p className="max-w-sm text-sm text-slate-500">
            Tap the heart icon on any property to save it here for quick access later.
          </p>
          <ButtonLink href="/properties" variant="primary">
            Browse Properties
          </ButtonLink>
        </div>
      )}

      {properties.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-slate-500">{properties.length} saved</span>
            <Link href="/compare" className="text-sm font-semibold text-navy-950 hover:text-gold-600">
              Go to Compare →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <div key={p.id} className="relative">
                <PropertyCard property={p} />
                <button
                  onClick={() => toggleCompare(p.id)}
                  disabled={!isComparing(p.id) && isFull}
                  className="mt-2 w-full rounded-full border border-navy-950/15 py-2 text-xs font-semibold text-navy-950 hover:border-navy-950 disabled:opacity-40"
                >
                  {isComparing(p.id) ? "Remove from Compare" : "Add to Compare"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

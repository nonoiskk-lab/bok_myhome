"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, BedDouble, Square, Share2, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { formatArea, formatIndianPrice } from "@/lib/format";
import { propertyWhatsAppMessage } from "@/lib/whatsapp";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from "@/lib/constants";
import type { PropertyCardData } from "@/lib/types";
import { clsx } from "clsx";

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare, isFull } = useCompare();
  const cover = property.images.find((i) => i.isCover) ?? property.images[0];
  const fav = isFavorite(property.id);
  const comparing = isComparing(property.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-navy-950/8 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/properties/${property.slug}`} aria-label={property.title} className="relative block h-full w-full">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-navy-100" />
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.featured && <Badge tone="gold">Featured</Badge>}
          {property.verified && <Badge tone="green">✓ Verified</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            aria-label={fav ? "Remove from favorites" : "Save to favorites"}
            onClick={() => toggleFavorite(property.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-sm transition-colors hover:bg-white"
          >
            <Heart className={clsx("h-4 w-4", fav && "fill-red-500 text-red-500")} />
          </button>
          <button
            type="button"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            onClick={() => toggleCompare(property.id)}
            disabled={!comparing && isFull}
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors disabled:opacity-40",
              comparing ? "bg-navy-950 text-cream-50" : "bg-white/90 text-navy-950 hover:bg-white"
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share property"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  url: `${window.location.origin}/properties/${property.slug}`,
                });
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-sm transition-colors hover:bg-white"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <Badge tone="navy">
            {TRANSACTION_TYPE_LABELS[property.transactionType as TransactionTypeValue] ??
              property.transactionType}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={`/properties/${property.slug}`}>
            <h3 className="line-clamp-2 font-semibold text-navy-950 hover:text-gold-600">
              {property.title}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.location.locality}, {property.location.city}
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-navy-950">
            {formatIndianPrice(property.price)}
            {property.transactionType === "RENT" && (
              <span className="text-xs font-medium text-slate-500">/mo</span>
            )}
          </span>
          {property.pricePerSqft ? (
            <span className="text-xs text-slate-500">₹{Math.round(property.pricePerSqft)}/sqft</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          {property.bedrooms ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {property.bedrooms} BHK
            </span>
          ) : null}
          {property.builtupArea ? (
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4" /> {formatArea(property.builtupArea)}
            </span>
          ) : null}
          <span className="text-slate-400">
            {PROPERTY_TYPE_LABELS[property.propertyType as PropertyTypeValue] ?? property.propertyType}
          </span>
        </div>

        {PROPERTY_STATUS_LABELS[property.status as PropertyStatusValue] !==
          TRANSACTION_TYPE_LABELS[property.transactionType as TransactionTypeValue] && (
          <div className="mt-1">
            <Badge tone="slate">
              {PROPERTY_STATUS_LABELS[property.status as PropertyStatusValue] ?? property.status}
            </Badge>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            href={`/properties/${property.slug}`}
            className="flex-1 rounded-full bg-navy-950 px-4 py-2 text-center text-sm font-semibold text-cream-50 transition-colors hover:bg-navy-800"
          >
            View Details
          </Link>
          <WhatsAppButton
            size="sm"
            label=""
            className="!px-3"
            message={propertyWhatsAppMessage({
              propertyId: property.propertyId,
              title: property.title,
              locality: property.location.locality,
            })}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Scale } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { usePropertiesByIds } from "@/hooks/usePropertiesByIds";
import { ButtonLink } from "@/components/ui/Button";
import { formatArea, formatIndianNumber, formatIndianPrice } from "@/lib/format";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from "@/lib/constants";
import type { PropertyCardData } from "@/lib/types";

type CompareRow = PropertyCardData & { amenities?: { amenity: { id: string; name: string } }[] };

export default function ComparePage() {
  const { compareIds, removeFromCompare } = useCompare();
  const { properties, loading } = usePropertiesByIds(compareIds);
  const rows = properties as CompareRow[];

  if (!loading && rows.length === 0) {
    return (
      <div className="container-page py-10">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-navy-950/15 bg-white p-12 text-center">
          <Scale className="h-8 w-8 text-slate-300" />
          <h2 className="font-semibold text-navy-950">Nothing to compare yet</h2>
          <p className="max-w-sm text-sm text-slate-500">
            Add up to 4 properties from search results or your saved list to compare them side by side.
          </p>
          <ButtonLink href="/properties" variant="primary">
            Browse Properties
          </ButtonLink>
        </div>
      </div>
    );
  }

  const specs: { label: string; render: (p: CompareRow) => React.ReactNode }[] = [
    { label: "Price", render: (p) => <span className="font-semibold text-navy-950">{formatIndianPrice(p.price)}</span> },
    { label: "Price/Sq.ft", render: (p) => (p.pricePerSqft ? `₹${formatIndianNumber(p.pricePerSqft)}` : "-") },
    { label: "Location", render: (p) => `${p.location.locality}, ${p.location.city}` },
    { label: "Type", render: (p) => PROPERTY_TYPE_LABELS[p.propertyType as PropertyTypeValue] ?? p.propertyType },
    { label: "Transaction", render: (p) => TRANSACTION_TYPE_LABELS[p.transactionType as TransactionTypeValue] ?? p.transactionType },
    { label: "Bedrooms", render: (p) => (p.bedrooms ? `${p.bedrooms} BHK` : "-") },
    { label: "Built-up Area", render: (p) => formatArea(p.builtupArea) },
    { label: "Floor", render: (p) => (p.floor != null ? `${p.floor} of ${p.totalFloors ?? "-"}` : "-") },
    { label: "Parking", render: (p) => (p.parking != null ? String(p.parking) : "-") },
    { label: "Property Age", render: (p) => (p.propertyAge != null ? `${p.propertyAge} yrs` : "-") },
    { label: "Status", render: (p) => PROPERTY_STATUS_LABELS[p.status as PropertyStatusValue] ?? p.status },
    { label: "Amenities", render: (p) => `${p.amenities?.length ?? 0} available` },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="font-serif text-2xl text-navy-950 sm:text-3xl">Compare Properties</h1>
      <p className="mt-1 text-sm text-slate-600">Comparing {rows.length} of up to 4 properties.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-950/8 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 border-b border-navy-950/8 p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Property
              </th>
              {rows.map((p) => {
                const cover = p.images.find((i) => i.isCover) ?? p.images[0];
                return (
                  <th key={p.id} className="min-w-[220px] border-b border-navy-950/8 p-4 text-left">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        aria-label="Remove"
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-950 text-cream-50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="relative h-28 w-full overflow-hidden rounded-lg">
                        {cover && <Image src={cover.url} alt={p.title} fill className="object-cover" />}
                      </div>
                      <Link href={`/properties/${p.slug}`} className="mt-2 line-clamp-2 block font-semibold text-navy-950 hover:text-gold-600">
                        {p.title}
                      </Link>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.label} className="odd:bg-cream-50">
                <td className="border-b border-navy-950/8 p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {spec.label}
                </td>
                {rows.map((p) => (
                  <td key={p.id} className="border-b border-navy-950/8 p-4 text-navy-950">
                    {spec.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import {
  AMENITIES_LIST,
  BEDROOM_OPTIONS,
  FACING_LABELS,
  FACING_OPTIONS,
  FURNISHING_LABELS,
  FURNISHING_OPTIONS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  type FacingValue,
  type FurnishingValue,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from "@/lib/constants";

function toggleInList(current: string, value: string): string {
  const values = current ? current.split(",") : [];
  const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  return next.join(",");
}

export function FilterPanel({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") ?? "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") ?? "");

  const type = searchParams.get("type") ?? "";
  const transaction = searchParams.get("transaction") ?? "";
  const status = searchParams.get("status") ?? "";
  const bedrooms = searchParams.get("bedrooms") ?? "";
  const furnishing = searchParams.get("furnishing") ?? "";
  const facing = searchParams.get("facing") ?? "";
  const amenities = searchParams.get("amenities") ?? "";
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/properties?${params.toString()}`);
  }

  function applyRange() {
    const params = new URLSearchParams(searchParams.toString());
    const set = (k: string, v: string) => (v ? params.set(k, v) : params.delete(k));
    set("minPrice", minPrice);
    set("maxPrice", maxPrice);
    set("minArea", minArea);
    set("maxArea", maxArea);
    router.push(`/properties?${params.toString()}`);
  }

  function clearAll() {
    router.push("/properties");
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-1">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-semibold text-navy-950">Filters</h3>
        <button onClick={onClose} aria-label="Close filters">
          <X className="h-5 w-5" />
        </button>
      </div>

      <FilterGroup title="Transaction Type">
        <div className="flex flex-wrap gap-2">
          {TRANSACTION_TYPES.map((t) => (
            <Chip
              key={t}
              active={transaction === t}
              onClick={() => update("transaction", transaction === t ? "" : t)}
            >
              {TRANSACTION_TYPE_LABELS[t as TransactionTypeValue]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Property Type">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <Chip key={t} active={type.split(",").includes(t)} onClick={() => update("type", toggleInList(type, t))}>
              {PROPERTY_TYPE_LABELS[t as PropertyTypeValue]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Budget (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyRange}
            className="w-full rounded-lg border border-navy-950/10 px-3 py-2 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyRange}
            className="w-full rounded-lg border border-navy-950/10 px-3 py-2 text-sm"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((b) => (
            <Chip
              key={b}
              active={bedrooms.split(",").includes(String(b))}
              onClick={() => update("bedrooms", toggleInList(bedrooms, String(b)))}
            >
              {b === 5 ? "5+ BHK" : `${b} BHK`}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Area (sq.ft)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            onBlur={applyRange}
            className="w-full rounded-lg border border-navy-950/10 px-3 py-2 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            onBlur={applyRange}
            className="w-full rounded-lg border border-navy-950/10 px-3 py-2 text-sm"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Property Status">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_STATUSES.map((s) => (
            <Chip key={s} active={status.split(",").includes(s)} onClick={() => update("status", toggleInList(status, s))}>
              {PROPERTY_STATUS_LABELS[s as PropertyStatusValue]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Furnishing">
        <div className="flex flex-wrap gap-2">
          {FURNISHING_OPTIONS.map((f) => (
            <Chip
              key={f}
              active={furnishing.split(",").includes(f)}
              onClick={() => update("furnishing", toggleInList(furnishing, f))}
            >
              {FURNISHING_LABELS[f as FurnishingValue]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Facing">
        <div className="flex flex-wrap gap-2">
          {FACING_OPTIONS.map((f) => (
            <Chip key={f} active={facing.split(",").includes(f)} onClick={() => update("facing", toggleInList(facing, f))}>
              {FACING_LABELS[f as FacingValue]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => (
            <Chip key={a} active={amenities.split(",").includes(a)} onClick={() => update("amenities", toggleInList(amenities, a))}>
              {a}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <label className="flex items-center gap-2 text-sm text-navy-950">
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => update("verifiedOnly", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-navy-950/20"
        />
        Verified properties only
      </label>

      <button
        onClick={clearAll}
        className="mt-2 rounded-full border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950 hover:border-navy-950"
      >
        Clear All Filters
      </button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-navy-950">{title}</h4>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-navy-950 px-3 py-1.5 text-xs font-semibold text-cream-50"
          : "rounded-full border border-navy-950/15 px-3 py-1.5 text-xs font-medium text-navy-950 hover:border-navy-950"
      }
    >
      {children}
    </button>
  );
}

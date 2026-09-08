"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import {
  BEDROOM_OPTIONS,
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  type PropertyStatusValue,
  type PropertyTypeValue,
} from "@/lib/constants";

const TABS = [
  { key: "BUY", label: "Buy" },
  { key: "RESALE", label: "Resale" },
  { key: "RENT", label: "Rent" },
] as const;

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("BUY");
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("transaction", tab);
    if (locality) params.set("q", locality);
    if (type) params.set("type", type);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (status) params.set("status", status);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur">
      <div className="flex gap-1 p-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.key ? "bg-navy-950 text-cream-50" : "text-navy-950/60 hover:bg-navy-950/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Location, locality or landmark"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className="col-span-1 rounded-xl border border-navy-950/10 bg-cream-50 px-4 py-3 text-sm text-navy-950 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none sm:col-span-2 lg:col-span-1"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-navy-950/10 bg-cream-50 px-4 py-3 text-sm text-navy-950 focus:border-gold-500 focus:outline-none"
        >
          <option value="">Property Type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t as PropertyTypeValue]}
            </option>
          ))}
        </select>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="rounded-xl border border-navy-950/10 bg-cream-50 px-4 py-3 text-sm text-navy-950 focus:border-gold-500 focus:outline-none"
        >
          <option value="">Budget</option>
          <option value="0-2500000">Under ₹25 Lakh</option>
          <option value="2500000-5000000">₹25 - 50 Lakh</option>
          <option value="5000000-10000000">₹50 Lakh - 1 Cr</option>
          <option value="10000000-25000000">₹1 Cr - 2.5 Cr</option>
          <option value="25000000-">Above ₹2.5 Cr</option>
        </select>

        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="rounded-xl border border-navy-950/10 bg-cream-50 px-4 py-3 text-sm text-navy-950 focus:border-gold-500 focus:outline-none"
        >
          <option value="">Bedrooms</option>
          {BEDROOM_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 5 ? "5+ BHK" : `${b} BHK`}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-navy-950/10 bg-cream-50 px-4 py-3 text-sm text-navy-950 focus:border-gold-500 focus:outline-none"
        >
          <option value="">Status</option>
          {PROPERTY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PROPERTY_STATUS_LABELS[s as PropertyStatusValue]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="col-span-1 flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-400 sm:col-span-2 lg:col-span-5"
        >
          <Search className="h-4 w-4" /> Search Property
        </button>
      </form>
    </div>
  );
}

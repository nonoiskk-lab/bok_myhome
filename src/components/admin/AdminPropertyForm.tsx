"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
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

const schema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().min(10, "Add a short description"),
  propertyType: z.enum(PROPERTY_TYPES),
  transactionType: z.enum(TRANSACTION_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.string().trim().min(1, "Price is required"),
  bedrooms: z.string().trim().optional().or(z.literal("")),
  bathrooms: z.string().trim().optional().or(z.literal("")),
  builtupArea: z.string().trim().optional().or(z.literal("")),
  carpetArea: z.string().trim().optional().or(z.literal("")),
  floor: z.string().trim().optional().or(z.literal("")),
  totalFloors: z.string().trim().optional().or(z.literal("")),
  propertyAge: z.string().trim().optional().or(z.literal("")),
  facing: z.string().trim().optional().or(z.literal("")),
  furnishing: z.string().trim().optional().or(z.literal("")),
  parking: z.string().trim().optional().or(z.literal("")),
  addressLine: z.string().trim().optional().or(z.literal("")),
  locality: z.string().trim().min(2, "Locality is required"),
  city: z.string().trim().min(2, "City is required"),
  imageUrls: z.string().trim().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
  verified: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminPropertyForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: "Dhanbad", propertyType: "APARTMENT", transactionType: "BUY", status: "READY_TO_MOVE" },
  });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          price: Number(values.price),
          bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
          bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
          builtupArea: values.builtupArea ? Number(values.builtupArea) : undefined,
          carpetArea: values.carpetArea ? Number(values.carpetArea) : undefined,
          floor: values.floor ? Number(values.floor) : undefined,
          totalFloors: values.totalFloors ? Number(values.totalFloors) : undefined,
          propertyAge: values.propertyAge ? Number(values.propertyAge) : undefined,
          parking: values.parking ? Number(values.parking) : undefined,
          facing: values.facing || undefined,
          furnishing: values.furnishing || undefined,
          imageUrls: values.imageUrls
            ? values.imageUrls.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
            : undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ? JSON.stringify(json.error) : "Failed to create property");
      }
      const json = await res.json();
      router.push(`/properties/${json.slug}`);
      router.refresh();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 rounded-2xl border border-navy-950/8 bg-white p-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Title" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Description" error={errors.description?.message}>
          <textarea rows={4} {...register("description")} className={inputClass} />
        </Field>
      </div>

      <Field label="Property Type">
        <select {...register("propertyType")} className={inputClass}>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t as PropertyTypeValue]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Transaction Type">
        <select {...register("transactionType")} className={inputClass}>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABELS[t as TransactionTypeValue]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select {...register("status")} className={inputClass}>
          {PROPERTY_STATUSES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_STATUS_LABELS[t as PropertyStatusValue]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Price (₹)" error={errors.price?.message}>
        <input {...register("price")} className={inputClass} />
      </Field>

      <Field label="Bedrooms"><input {...register("bedrooms")} className={inputClass} /></Field>
      <Field label="Bathrooms"><input {...register("bathrooms")} className={inputClass} /></Field>
      <Field label="Built-up Area (sq.ft)"><input {...register("builtupArea")} className={inputClass} /></Field>
      <Field label="Carpet Area (sq.ft)"><input {...register("carpetArea")} className={inputClass} /></Field>
      <Field label="Floor"><input {...register("floor")} className={inputClass} /></Field>
      <Field label="Total Floors"><input {...register("totalFloors")} className={inputClass} /></Field>
      <Field label="Property Age (yrs)"><input {...register("propertyAge")} className={inputClass} /></Field>
      <Field label="Parking"><input {...register("parking")} className={inputClass} /></Field>

      <Field label="Facing">
        <select {...register("facing")} className={inputClass}>
          <option value="">-</option>
          {FACING_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {FACING_LABELS[f as FacingValue]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Furnishing">
        <select {...register("furnishing")} className={inputClass}>
          <option value="">-</option>
          {FURNISHING_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {FURNISHING_LABELS[f as FurnishingValue]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Locality" error={errors.locality?.message}>
        <input {...register("locality")} className={inputClass} />
      </Field>
      <Field label="City" error={errors.city?.message}>
        <input {...register("city")} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Address (optional)">
          <input {...register("addressLine")} className={inputClass} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label="Image URLs (one per line — use /images/properties/prop-N.svg placeholders, or real photo URLs)">
          <textarea rows={3} {...register("imageUrls")} className={inputClass} />
        </Field>
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" {...register("featured")} className="h-4 w-4" /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" {...register("premium")} className="h-4 w-4" /> Premium
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-950">
          <input type="checkbox" {...register("verified")} className="h-4 w-4" /> Verified
        </label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Publishing..." : "Publish Property"}
        </Button>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

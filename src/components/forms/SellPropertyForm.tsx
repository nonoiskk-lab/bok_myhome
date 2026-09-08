"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, type PropertyTypeValue } from "@/lib/constants";

const MAX_IMAGES = 5;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  listingIntent: z.enum(["SELL", "RENT"]),
  propertyType: z.enum(PROPERTY_TYPES),
  locality: z.string().trim().min(2, "Please enter a locality"),
  city: z.string().trim().min(2),
  address: z.string().trim().optional().or(z.literal("")),
  expectedPrice: z
    .string()
    .trim()
    .min(1, "Enter the expected price")
    .refine((v) => Number(v) > 0, "Enter a valid price"),
  area: z.string().trim().optional().or(z.literal("")),
  bedrooms: z.string().trim().optional().or(z.literal("")),
  propertyAge: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SellPropertyForm() {
  const [images, setImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resultId, setResultId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { listingIntent: "SELL", city: "Dhanbad" },
  });

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setImageError(null);
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setImageError(`${file.name} is larger than 2MB and was skipped.`);
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      setImages((prev) => [...prev, { name: file.name, dataUrl }]);
    }
  }

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    try {
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expectedPrice: Number(values.expectedPrice),
          area: values.area ? Number(values.area) : undefined,
          bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
          propertyAge: values.propertyAge ? Number(values.propertyAge) : undefined,
          images: images.map((i) => i.dataUrl),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setResultId(json.propertyId);
      setStatus("success");
      reset();
      setImages([]);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-500/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-700">Property Submitted!</h3>
        <p className="mt-1 text-sm text-green-700/80">
          Reference ID <strong>{resultId}</strong>. Our team will review your details and contact you
          within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField label="Full Name" error={errors.name?.message}>
        <input {...register("name")} className={inputClass} />
      </TextField>
      <TextField label="Phone Number" error={errors.phone?.message}>
        <input {...register("phone")} className={inputClass} />
      </TextField>
      <TextField label="Email (optional)" error={errors.email?.message}>
        <input {...register("email")} className={inputClass} />
      </TextField>
      <TextField label="I want to">
        <select {...register("listingIntent")} className={inputClass}>
          <option value="SELL">Sell my property</option>
          <option value="RENT">Rent out my property</option>
        </select>
      </TextField>

      <TextField label="Property Type">
        <select {...register("propertyType")} className={inputClass}>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t as PropertyTypeValue]}
            </option>
          ))}
        </select>
      </TextField>
      <TextField label="Locality" error={errors.locality?.message}>
        <input {...register("locality")} placeholder="e.g. Hirapur" className={inputClass} />
      </TextField>
      <TextField label="City">
        <input {...register("city")} className={inputClass} />
      </TextField>
      <TextField label="Full Address (optional)">
        <input {...register("address")} className={inputClass} />
      </TextField>

      <TextField label="Expected Price (₹)" error={errors.expectedPrice?.message}>
        <input type="number" {...register("expectedPrice")} className={inputClass} />
      </TextField>
      <TextField label="Area (sq.ft)">
        <input type="number" {...register("area")} className={inputClass} />
      </TextField>
      <TextField label="Bedrooms (BHK)">
        <input type="number" {...register("bedrooms")} className={inputClass} />
      </TextField>
      <TextField label="Property Age (years)">
        <input type="number" {...register("propertyAge")} className={inputClass} />
      </TextField>

      <div className="sm:col-span-2">
        <TextField label="Description">
          <textarea rows={4} {...register("description")} className={inputClass} />
        </TextField>
      </div>

      <div className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-slate-600">Photos (up to 5, 2MB each)</span>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-950/25 px-4 py-6 text-sm text-slate-500 hover:border-navy-950/50">
          <Upload className="h-4 w-4" />
          Click to upload photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-navy-950/10">
                {/* Local base64 preview of a not-yet-uploaded file — next/image needs a URL, not a data URI */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy-950/80 text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={status === "loading"} className="w-full" size="lg">
          {status === "loading" ? "Submitting..." : "Submit for Valuation"}
        </Button>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">Something went wrong. Please try again or call us directly.</p>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none";

function TextField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

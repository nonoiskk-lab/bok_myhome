"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LeadSourceValue } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  preferredVisitDate: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function LeadForm({
  source,
  propertyId,
  showVisitDate = false,
  showMessage = true,
  messagePlaceholder = "Anything specific you'd like to know?",
  submitLabel = "Submit",
  onSuccess,
}: {
  source: LeadSourceValue;
  propertyId?: string;
  showVisitDate?: boolean;
  showMessage?: boolean;
  messagePlaceholder?: string;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source, propertyId }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-green-500/10 p-4 text-sm text-green-600">
        Thank you! Our team will get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <input
          {...register("name")}
          placeholder="Full Name"
          className="w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <input
          {...register("phone")}
          placeholder="Phone Number"
          className="w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <input
          {...register("email")}
          placeholder="Email (optional)"
          className="w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {showVisitDate && (
        <input
          type="date"
          {...register("preferredVisitDate")}
          className="w-full rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
      )}

      {showMessage && (
        <textarea
          {...register("message")}
          placeholder={messagePlaceholder}
          rows={3}
          className="w-full resize-none rounded-lg border border-navy-950/15 px-3.5 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
      )}

      <Button type="submit" disabled={status === "loading"} className="mt-1 w-full">
        {status === "loading" ? "Submitting..." : submitLabel}
      </Button>

      {status === "error" && (
        <p className="text-xs text-red-500">Something went wrong. Please try again or call us directly.</p>
      )}
    </form>
  );
}

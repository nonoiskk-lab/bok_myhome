"use client";

import { Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { COMPANY } from "@/lib/constants";

export function CallButton({
  phone = COMPANY.phone,
  label = "Call Now",
  className,
  size = "md",
  variant = "outline",
}: {
  phone?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "solid";
}) {
  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5",
  };
  const variants = {
    outline: "border border-navy-950/20 text-navy-950 hover:border-navy-950",
    solid: "bg-navy-950 text-cream-50 hover:bg-navy-800",
  };
  return (
    <a
      href={`tel:${phone.replace(/\s/g, "")}`}
      data-event="call_click"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        sizes[size],
        variants[variant],
        className
      )}
    >
      <Phone className="h-4 w-4" />
      {label}
    </a>
  );
}

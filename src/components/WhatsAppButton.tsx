"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  message,
  label = "WhatsApp",
  className,
  size = "md",
  onClick,
}: {
  message: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5",
  };
  return (
    <a
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      data-event="whatsapp_click"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-green-500 font-semibold text-white transition-colors hover:bg-green-600",
        sizes[size],
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

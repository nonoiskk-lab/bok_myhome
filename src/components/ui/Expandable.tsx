"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export function Expandable({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-navy-950/8 py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold text-navy-950">{title}</span>
        <ChevronDown className={clsx("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3 text-sm text-slate-600">{children}</div>}
    </div>
  );
}

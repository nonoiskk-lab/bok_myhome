import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "gold" | "green" | "navy" | "slate" | "red";

const tones: Record<Tone, string> = {
  gold: "bg-gold-500/15 text-gold-600 ring-1 ring-inset ring-gold-500/30",
  green: "bg-green-500/10 text-green-600 ring-1 ring-inset ring-green-500/30",
  navy: "bg-navy-950 text-cream-50",
  slate: "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  red: "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20",
};

export function Badge({
  tone = "slate",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

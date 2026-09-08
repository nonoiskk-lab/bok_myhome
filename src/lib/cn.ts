import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx alone concatenates class strings; when two conflicting Tailwind
// utilities are both present (e.g. text-navy-950 and a later text-cream-50
// override), which one wins depends on Tailwind's internal stylesheet order,
// not the order they appear in the class list — a classic source of
// invisible-text bugs. twMerge resolves that by dropping the earlier,
// conflicting utility so the last one specified always wins.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Heart, Scale, Home } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/properties?transaction=BUY", label: "Buy" },
  { href: "/properties?transaction=RESALE", label: "Resale" },
  { href: "/properties?transaction=RENT", label: "Rent" },
  { href: "/properties?type=PLOT,LAND", label: "Plots & Land" },
  { href: "/properties?type=SHOP,OFFICE,COMMERCIAL", label: "Commercial" },
  { href: "/premium", label: "Premium" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-950/8 bg-cream-50/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 text-gold-400">
            <Home className="h-4.5 w-4.5" />
          </span>
          <span className="font-serif text-xl text-navy-950">{COMPANY.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-navy-900/80 transition-colors hover:text-gold-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-900 hover:bg-navy-950/5"
          >
            <Heart className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/compare"
            aria-label="Compare"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-900 hover:bg-navy-950/5"
          >
            <Scale className="h-4.5 w-4.5" />
          </Link>
          <ButtonLink href="/login" variant="ghost" size="sm">
            Login
          </ButtonLink>
          <ButtonLink href="/sell" variant="secondary" size="sm">
            List Your Property
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy-950 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-950/8 bg-cream-50 lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-950/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-2">
              <ButtonLink href="/login" variant="outline" size="sm" className="flex-1">
                Login
              </ButtonLink>
              <ButtonLink href="/sell" variant="secondary" size="sm" className="flex-1">
                List Property
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

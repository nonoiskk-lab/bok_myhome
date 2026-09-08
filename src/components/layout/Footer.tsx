import Link from "next/link";
import { Globe, MessageCircle, Send, Home } from "lucide-react";
import { COMPANY } from "@/lib/constants";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/properties?transaction=BUY", label: "Buy" },
      { href: "/properties?transaction=RESALE", label: "Resale" },
      { href: "/properties?transaction=RENT", label: "Rent" },
      { href: "/properties?type=SHOP,OFFICE,COMMERCIAL", label: "Commercial" },
      { href: "/premium", label: "Premium Properties" },
    ],
  },
  {
    title: "Locations",
    links: [
      { href: "/properties/dhanbad/hirapur", label: "Hirapur" },
      { href: "/properties/dhanbad/bank-more", label: "Bank More" },
      { href: "/properties/dhanbad/saraidhela", label: "Saraidhela" },
      { href: "/properties/dhanbad/digwadih", label: "Digwadih" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/sell", label: "Sell Your Property" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy-policy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms & Conditions" },
      { href: "/legal/disclaimer", label: "Property Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-navy-950 text-cream-100">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-6">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
              <Home className="h-4.5 w-4.5" />
            </span>
            <span className="font-serif text-xl text-cream-50">{COMPANY.name}</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-cream-100/70">
            Trusted local expertise for buying, selling, reselling and renting property across{" "}
            {COMPANY.city}.
          </p>
          <div className="mt-4 flex gap-3">
            {[Globe, MessageCircle, Send].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 hover:bg-gold-500 hover:text-navy-950"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-gold-400">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream-100/70 hover:text-cream-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-100/60 md:flex-row">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p>{COMPANY.address} · {COMPANY.phone}</p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { Home, Handshake, Search, Calculator, FileCheck, Building2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services",
  description: "Buying, selling, resale, rental and site-visit support services from BOK MyHome in Dhanbad.",
};

const SERVICES = [
  { icon: Search, title: "Property Search", body: "Personalised shortlists based on budget, locality and requirements." },
  { icon: Home, title: "Buying Assistance", body: "End-to-end support from shortlisting to final paperwork." },
  { icon: Handshake, title: "Resale & Selling", body: "Fair valuation guidance and connecting sellers with genuine buyers." },
  { icon: Building2, title: "Commercial Leasing", body: "Shops, offices and commercial spaces for rent or purchase." },
  { icon: Calculator, title: "Home Loan Guidance", body: "EMI planning and connections to lending partners." },
  { icon: FileCheck, title: "Site Visits & Documentation", body: "Coordinated visits and help understanding property paperwork." },
];

export default function ServicesPage() {
  return (
    <div className="container-page py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Services</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">How We Help</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        From your first search to the final handshake, our team supports every stage of buying,
        selling or renting property in Dhanbad.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="rounded-2xl border border-navy-950/8 bg-white p-6">
            <s.icon className="h-6 w-6 text-gold-600" />
            <h3 className="mt-3 font-semibold text-navy-950">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <ButtonLink href="/contact" variant="primary" size="lg">
          Talk to a Property Expert
        </ButtonLink>
      </div>
    </div>
  );
}

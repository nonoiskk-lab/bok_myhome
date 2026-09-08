import type { Metadata } from "next";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";
import { SellPropertyForm } from "@/components/forms/SellPropertyForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CallButton } from "@/components/CallButton";
import { sellPropertyWhatsAppMessage } from "@/lib/whatsapp";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sell or Rent Out Your Property",
  description:
    "List your house, flat, villa, plot or commercial property with BOK MyHome. Get a fair valuation and reach verified buyers and tenants in Dhanbad.",
};

export default function SellPage() {
  return (
    <div className="container-page py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">List Your Property</p>
          <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">
            Sell or Rent Your Property with Confidence
          </h1>
          <p className="mt-4 text-slate-600">
            Tell us about your property and our team will review your submission, suggest a fair
            market valuation, and connect you with genuinely interested buyers or tenants across{" "}
            {COMPANY.city}.
          </p>

          <div className="mt-8 space-y-5">
            <Feature icon={ShieldCheck} title="Verified before it goes live" body="Every submission is reviewed by our team before publishing to buyers." />
            <Feature icon={Users} title="Real local buyers" body="Your listing reaches genuinely interested buyers and tenants searching in your locality." />
            <Feature icon={TrendingUp} title="Fair valuation guidance" body="We help you price competitively based on comparable properties nearby." />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton message={sellPropertyWhatsAppMessage()} label="WhatsApp Us Instead" />
            <CallButton label="Call Our Team" />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-950/8 bg-white p-6 sm:p-8">
          <SellPropertyForm />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-semibold text-navy-950">{title}</h3>
        <p className="text-sm text-slate-600">{body}</p>
      </div>
    </div>
  );
}

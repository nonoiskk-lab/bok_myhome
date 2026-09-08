import type { Metadata } from "next";
import { ShieldCheck, Users, MapPin, Award } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${COMPANY.name}, a local real estate team helping buyers, sellers and tenants across Dhanbad.`,
};

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">About Us</p>
        <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">
          Real, local expertise for every property decision in {COMPANY.city}
        </h1>
        <p className="mt-4 text-slate-600">
          {COMPANY.name} was built to make buying, selling, reselling and renting property in{" "}
          {COMPANY.city} simpler and more transparent. We combine local market knowledge with a
          straightforward, verified listing process — so you spend less time guessing and more time
          finding the right property.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: "Verified Listings", body: "Every property is reviewed before it's published." },
          { icon: Users, title: "Local Team", body: "Agents who know every locality in Dhanbad street by street." },
          { icon: MapPin, title: "City-focused", body: "We specialise in Dhanbad rather than spreading thin nationally." },
          { icon: Award, title: "Honest Guidance", body: "Clear pricing, realistic timelines, no false promises." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-navy-950/8 bg-white p-6">
            <item.icon className="h-6 w-6 text-gold-600" />
            <h3 className="mt-3 font-semibold text-navy-950">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-navy-950 p-8 text-center">
        <h2 className="font-serif text-2xl text-cream-50">Ready to work with a team that knows Dhanbad?</h2>
        <div className="mt-4 flex justify-center gap-3">
          <ButtonLink href="/properties" variant="secondary">
            Browse Properties
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" className="border-cream-50/30 text-cream-50 hover:border-cream-50">
            Contact Us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

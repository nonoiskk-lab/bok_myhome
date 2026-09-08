import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/property/PropertyCard";
import { propertyCardInclude } from "@/lib/types";
import { ACTIVE_LISTING_STATUSES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Premium Properties",
  description: "Luxury apartments, premium villas and high-end resale homes in Dhanbad's most sought-after localities.",
};

export default async function PremiumPage() {
  const properties = await prisma.property.findMany({
    where: { premium: true, listingStatus: { in: ACTIVE_LISTING_STATUSES } },
    include: propertyCardInclude,
    orderBy: { price: "desc" },
  });

  return (
    <div>
      <section className="bg-navy-950 py-20">
        <div className="container-page text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">The Collection</p>
          <h1 className="mt-3 font-serif text-4xl text-cream-50 sm:text-5xl">Premium Properties</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream-100/70">
            Luxury apartments, premium villas, designer homes and high-end resale properties for the
            discerning buyer in Dhanbad.
          </p>
        </div>
      </section>

      <div className="container-page py-16">
        {properties.length === 0 ? (
          <p className="text-center text-slate-500">No premium properties published yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

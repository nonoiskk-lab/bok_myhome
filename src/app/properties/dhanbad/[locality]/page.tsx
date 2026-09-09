import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/property/PropertyCard";
import { propertyCardInclude } from "@/lib/types";
import { ACTIVE_LISTING_STATUSES, COMPANY } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

async function getLocation(slug: string) {
  return prisma.location.findUnique({ where: { slug } });
}

// Rendered on demand rather than pre-generated at build time — avoids
// requiring database access during the build step, and location listings
// (property counts) can change without a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locality: string }>;
}): Promise<Metadata> {
  const { locality } = await params;
  const location = await getLocation(locality);
  if (!location) return {};
  return {
    title: `Properties in ${location.locality}, ${location.city}`,
    description: `Flats, houses, villas and resale properties for sale in ${location.locality}, ${location.city}. Browse verified listings with BOK MyHome.`,
    alternates: { canonical: `/properties/dhanbad/${location.slug}` },
  };
}

export default async function LocationLandingPage({
  params,
}: {
  params: Promise<{ locality: string }>;
}) {
  const { locality } = await params;
  const location = await getLocation(locality);
  if (!location) notFound();

  const properties = await prisma.property.findMany({
    where: { locationId: location.id, listingStatus: { in: ACTIVE_LISTING_STATUSES } },
    include: propertyCardInclude,
    orderBy: { createdAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${location.locality} a good place to buy property in ${location.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${location.locality} is a well-connected part of ${location.city}. ${location.description ?? ""}`,
        },
      },
    ],
  };

  return (
    <div className="container-page py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{COMPANY.city}</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-950 sm:text-4xl">
        Properties in {location.locality}, {location.city}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        {location.description ??
          `Explore verified houses, flats, villas and plots for sale, resale and rent in ${location.locality}.`}
      </p>

      <div className="mt-6">
        <ButtonLink href={`/properties?q=${encodeURIComponent(location.locality)}`} variant="outline">
          Search All Filters for {location.locality}
        </ButtonLink>
      </div>

      <div className="mt-8">
        {properties.length === 0 ? (
          <p className="text-slate-500">No active listings in {location.locality} right now — check back soon.</p>
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

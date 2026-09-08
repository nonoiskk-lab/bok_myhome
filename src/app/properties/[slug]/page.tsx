import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, Bath, Square, Layers, Compass, Car, Calendar, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { propertyDetailInclude, propertyCardInclude } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Expandable } from "@/components/ui/Expandable";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyCTABar } from "@/components/property/PropertyCTABar";
import { EMICalculator } from "@/components/property/EMICalculator";
import { NearbyPlaces } from "@/components/property/NearbyPlaces";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LeadForm } from "@/components/forms/LeadForm";
import { RecentlyViewedTracker } from "@/components/property/RecentlyViewedTracker";
import { formatArea, formatIndianNumber, formatIndianPrice } from "@/lib/format";
import {
  FACING_LABELS,
  FURNISHING_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  type FacingValue,
  type FurnishingValue,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from "@/lib/constants";

async function getProperty(slug: string) {
  return prisma.property.findUnique({ where: { slug }, include: propertyDetailInclude });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};

  const title = `${property.title} | ${formatIndianPrice(property.price)} in ${property.location.locality}, ${property.location.city}`;
  const description = property.description.slice(0, 155);
  const cover = property.images.find((i) => i.isCover) ?? property.images[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover.url }] : undefined,
    },
    alternates: { canonical: `/properties/${property.slug}` },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const similar = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      propertyType: property.propertyType,
      listingStatus: property.listingStatus,
    },
    include: propertyCardInclude,
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://www.bokmyhome.com/properties/${property.slug}`,
    image: property.images.map((i) => i.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location.locality,
      addressRegion: property.location.city,
      postalCode: property.location.pincode ?? undefined,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@position": 1, name: "Home", item: "https://www.bokmyhome.com/" },
      { "@position": 2, name: "Properties", item: "https://www.bokmyhome.com/properties" },
      {
        "@position": 3,
        name: property.location.locality,
        item: `https://www.bokmyhome.com/properties/dhanbad/${property.location.slug}`,
      },
      { "@position": 4, name: property.title, item: `https://www.bokmyhome.com/properties/${property.slug}` },
    ],
  };

  return (
    <div className="container-page py-8">
      <RecentlyViewedTracker propertyId={property.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/">Home</Link> / <Link href="/properties">Properties</Link> /{" "}
        <Link href={`/properties/dhanbad/${property.location.slug}`}>{property.location.locality}</Link> /{" "}
        <span className="text-navy-950">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {property.verified && <Badge tone="green">✓ Verified Property</Badge>}
            {property.featured && <Badge tone="gold">Featured</Badge>}
            <Badge tone="navy">
              {TRANSACTION_TYPE_LABELS[property.transactionType as TransactionTypeValue]}
            </Badge>
            {PROPERTY_STATUS_LABELS[property.status as PropertyStatusValue] !==
              TRANSACTION_TYPE_LABELS[property.transactionType as TransactionTypeValue] && (
              <Badge tone="slate">
                {PROPERTY_STATUS_LABELS[property.status as PropertyStatusValue]}
              </Badge>
            )}
            <span className="ml-auto text-xs text-slate-400">Property ID: {property.propertyId}</span>
          </div>

          <h1 className="mt-3 font-serif text-2xl text-navy-950 sm:text-3xl">{property.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {property.addressLine ?? `${property.location.locality}, ${property.location.city}`}
          </p>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-navy-950">{formatIndianPrice(property.price)}</span>
            {property.transactionType === "RENT" && <span className="text-sm text-slate-500">/month</span>}
            {property.priceNegotiable && <Badge tone="slate">Negotiable</Badge>}
            {property.pricePerSqft && (
              <span className="text-sm text-slate-500">
                ₹{formatIndianNumber(property.pricePerSqft)}/sq.ft
              </span>
            )}
          </div>

          <div className="mt-6">
            <PropertyCTABar
              propertyId={property.propertyId}
              propertyDbId={property.id}
              title={property.title}
              locality={property.location.locality}
            />
          </div>

          {/* Key facts */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-navy-950/8 bg-white p-6 sm:grid-cols-4">
            {property.bedrooms ? <Fact icon={BedDouble} label="Bedrooms" value={`${property.bedrooms} BHK`} /> : null}
            {property.bathrooms ? <Fact icon={Bath} label="Bathrooms" value={String(property.bathrooms)} /> : null}
            {property.builtupArea ? <Fact icon={Square} label="Built-up Area" value={formatArea(property.builtupArea)} /> : null}
            {property.carpetArea ? <Fact icon={Square} label="Carpet Area" value={formatArea(property.carpetArea)} /> : null}
            {property.floor != null ? <Fact icon={Layers} label="Floor" value={`${property.floor} of ${property.totalFloors ?? "-"}`} /> : null}
            {property.facing ? <Fact icon={Compass} label="Facing" value={FACING_LABELS[property.facing as FacingValue]} /> : null}
            {property.parking != null ? <Fact icon={Car} label="Parking" value={String(property.parking)} /> : null}
            {property.propertyAge != null ? <Fact icon={Calendar} label="Age" value={`${property.propertyAge} yrs`} /> : null}
          </div>

          {/* Expandable sections */}
          <div className="mt-8 rounded-2xl border border-navy-950/8 bg-white p-6">
            <Expandable title="Overview & Description" defaultOpen>
              <p className="whitespace-pre-line leading-relaxed">{property.description}</p>
            </Expandable>

            <Expandable title="Property Details">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                <DetailRow label="Property Type" value={PROPERTY_TYPE_LABELS[property.propertyType as PropertyTypeValue]} />
                <DetailRow label="Transaction" value={TRANSACTION_TYPE_LABELS[property.transactionType as TransactionTypeValue]} />
                <DetailRow label="Status" value={PROPERTY_STATUS_LABELS[property.status as PropertyStatusValue]} />
                {property.furnishing && (
                  <DetailRow label="Furnishing" value={FURNISHING_LABELS[property.furnishing as FurnishingValue]} />
                )}
                {property.ownership && <DetailRow label="Ownership" value={property.ownership} />}
                {property.possessionOn && (
                  <DetailRow label="Possession" value={new Date(property.possessionOn).toLocaleDateString("en-IN")} />
                )}
              </dl>
            </Expandable>

            {property.amenities.length > 0 && (
              <Expandable title="Amenities">
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(({ amenity }) => (
                    <Badge key={amenity.id} tone="slate">
                      {amenity.name}
                    </Badge>
                  ))}
                </div>
              </Expandable>
            )}

            <Expandable title="Location & Nearby Places">
              <p className="mb-3">
                {property.location.description ??
                  `${property.location.locality} is a well-connected part of ${property.location.city}.`}
              </p>
              <NearbyPlaces />
            </Expandable>

            <Expandable title="Legal & Verification">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <p>
                  {property.verified
                    ? "This listing has been reviewed by our team for basic accuracy of details and photographs. Buyers should still independently verify title documents before making any payment."
                    : "This listing is pending our verification process. Please independently verify all documents before proceeding."}
                </p>
              </div>
            </Expandable>
          </div>

          {/* Similar properties */}
          {similar.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy-950">You May Also Like</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {property.agent && (
            <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Listed By</p>
              <p className="mt-2 font-semibold text-navy-950">{property.agent.user.name}</p>
              <p className="text-sm text-slate-500">{property.agent.designation}</p>
            </div>
          )}

          <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
            <h3 className="font-semibold text-navy-950">Request More Information</h3>
            <p className="mt-1 text-sm text-slate-500">Get price details, availability and documents.</p>
            <div className="mt-4">
              <LeadForm source="WEBSITE_FORM" propertyId={property.id} submitLabel="Get Price Details" />
            </div>
          </div>

          <EMICalculator propertyPrice={property.price} />
        </aside>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-navy-950">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-navy-950">{value}</dd>
    </div>
  );
}

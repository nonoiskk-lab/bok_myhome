import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  Handshake,
  TrendingUp,
  MapPin,
  Building2,
  Home as HomeIcon,
  Trees,
  Store,
  Landmark,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { HeroSearch } from "@/components/home/HeroSearch";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { propertyCardInclude } from "@/lib/types";
import { ACTIVE_LISTING_STATUSES, COMPANY } from "@/lib/constants";

export const revalidate = 60;

const CATEGORY_ICONS: Record<string, typeof HomeIcon> = {
  APARTMENT: Building2,
  FLAT: Building2,
  VILLA: HomeIcon,
  HOUSE: HomeIcon,
  PLOT: Trees,
  LAND: Trees,
  SHOP: Store,
  OFFICE: Landmark,
  COMMERCIAL: Landmark,
};

async function getHomeData() {
  const baseWhere = { listingStatus: { in: ACTIVE_LISTING_STATUSES } };

  const [featured, recent, premium, resale, locations, posts, propertyCounts] = await Promise.all([
    prisma.property.findMany({
      where: { ...baseWhere, featured: true },
      include: propertyCardInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.property.findMany({
      where: baseWhere,
      include: propertyCardInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.property.findMany({
      where: { ...baseWhere, premium: true },
      include: propertyCardInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.property.findMany({
      where: { ...baseWhere, transactionType: "RESALE" },
      include: propertyCardInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.location.findMany({ include: { _count: { select: { properties: true } } } }),
    prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.property.groupBy({
      by: ["propertyType"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  return { featured, recent, premium, resale, locations, posts, propertyCounts };
}

export default async function HomePage() {
  const { featured, recent, premium, resale, locations, posts, propertyCounts } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/misc/hero.svg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        </div>

        <div className="container-page flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <div className="animate-fade-in-up">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              {COMPANY.city} · Buy · Sell · Resell · Rent
            </p>
            <h1 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-cream-50 sm:text-5xl lg:text-6xl">
              {COMPANY.tagline}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-cream-100/80">
              Verified houses, flats, villas, plots and commercial spaces across Dhanbad —
              with real local support from search to sale.
            </p>
          </div>

          <HeroSearch />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/sell" variant="secondary" size="md">
              List Your Property
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="md" className="border-cream-50/30 text-cream-50 hover:border-cream-50">
              Talk to Expert
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Popular locations */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Explore"
          title="Popular Locations in Dhanbad"
          subtitle="Browse properties by the localities buyers search for most."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/properties/dhanbad/${loc.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-navy-950/8 bg-white p-5 text-center transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/5 text-navy-950 group-hover:bg-gold-500/20">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-navy-950">{loc.locality}</span>
              <span className="text-xs text-slate-500">{loc._count.properties} properties</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      {featured.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Handpicked"
              title="Featured Properties"
              subtitle="Our most in-demand listings this week."
              viewAllHref="/properties"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently added */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Fresh"
          title="Recently Added"
          subtitle="The newest listings on BOK MyHome."
          viewAllHref="/properties?sort=newest"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-navy-950 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Browse"
            title="Property Categories"
            subtitle="Every property type in one marketplace."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {propertyCounts.map((c) => {
              const Icon = CATEGORY_ICONS[c.propertyType] ?? Building2;
              return (
                <Link
                  key={c.propertyType}
                  href={`/properties?type=${c.propertyType}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-cream-50/10 bg-cream-50/5 p-6 text-center transition-colors hover:bg-cream-50/10"
                >
                  <Icon className="h-6 w-6 text-gold-400" />
                  <span className="text-sm font-semibold text-cream-50">
                    {c.propertyType.charAt(0) + c.propertyType.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-cream-100/60">{c._count._all} listings</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-page py-16">
        <SectionHeading eyebrow="Why BOK MyHome" title="Built Around Trust, Not Just Listings" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Verified Listings", body: "Every published property is reviewed before it goes live." },
            { icon: Users, title: "Local Expertise", body: "Our team knows every locality in Dhanbad, street by street." },
            { icon: Handshake, title: "Site Visit Support", body: "We coordinate visits and negotiations end to end." },
            { icon: TrendingUp, title: "Transparent Pricing", body: "Clear pricing and price-per-sqft on every listing." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-navy-950/8 bg-white p-6">
              <item.icon className="h-6 w-6 text-gold-600" />
              <h3 className="mt-3 font-semibold text-navy-950">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium properties */}
      {premium.length > 0 && (
        <section className="bg-navy-950 py-20">
          <div className="container-page">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
                The Collection
              </p>
              <h2 className="mt-2 font-serif text-3xl text-cream-50 sm:text-4xl">
                Premium Properties
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-cream-100/70">
                Luxury apartments, premium villas and high-end resale homes for the discerning buyer.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {premium.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <ButtonLink href="/premium" variant="secondary">
                Explore Premium Collection
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* Resale */}
      {resale.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Ready to Move"
            title="Resale Properties"
            subtitle="Skip the wait — move in sooner with a verified resale home."
            viewAllHref="/properties?transaction=RESALE"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {resale.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* Investment opportunities */}
      <section className="bg-cream-100 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="For Investors"
            title="Investment Opportunities"
            subtitle="Properties in high-growth Dhanbad localities, based on available market information."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { area: "Saraidhela", note: "Estimated high rental demand from young families and new project launches." },
              { area: "Kenduadih", note: "Emerging locality with new-launch projects and improving connectivity." },
              { area: "Bank More", note: "Established commercial corridor with steady footfall for retail investments." },
            ].map((item) => (
              <div key={item.area} className="rounded-2xl border border-navy-950/8 bg-white p-6">
                <h3 className="font-semibold text-navy-950">{item.area}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                <p className="mt-3 text-xs italic text-slate-400">
                  Potential estimate only — not a guaranteed return.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Insights"
            title="From the Blog"
            subtitle="Buying guides, home loan tips and local market updates."
            viewAllHref="/blog"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-navy-950/8 bg-white p-6 transition-shadow hover:shadow-md"
              >
                {post.category && (
                  <span className="text-xs font-bold uppercase tracking-wide text-gold-600">
                    {post.category.name}
                  </span>
                )}
                <h3 className="mt-2 font-semibold text-navy-950 group-hover:text-gold-600">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-navy-950 py-16">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-xl font-serif text-3xl text-cream-50">
            Ready to find your next property — or sell the one you have?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/properties" variant="secondary" size="lg">
              Search Properties
            </ButtonLink>
            <ButtonLink
              href="/sell"
              variant="outline"
              size="lg"
              className="border-cream-50/30 text-cream-50 hover:border-cream-50"
            >
              List Your Property
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

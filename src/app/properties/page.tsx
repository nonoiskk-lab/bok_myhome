import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/property/PropertyCard";
import { FilterPanel } from "@/components/property/FilterPanel";
import { SortAndMobileFilters } from "@/components/property/SortAndMobileFilters";
import { propertyCardInclude, type PropertyCardData } from "@/lib/types";
import { buildPropertyOrderBy, buildPropertyWhere, type PropertySearchParams } from "@/lib/property-query";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Search Properties in ${COMPANY.city}`,
  description:
    "Search verified houses, flats, villas, plots and commercial properties for sale, resale and rent in Dhanbad.",
};

const PAGE_SIZE = 12;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params: PropertySearchParams = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const where = buildPropertyWhere(params);
  const orderBy = buildPropertyOrderBy(params.sort);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyCardInclude,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.property.count({ where }),
  ]);

  let fallback: PropertyCardData[] = [];
  if (properties.length === 0) {
    fallback = await prisma.property.findMany({
      where: { listingStatus: where.listingStatus },
      include: propertyCardInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-navy-950 sm:text-3xl">
          {total} {total === 1 ? "Property" : "Properties"} Found
        </h1>
        <p className="mt-1 text-sm text-slate-600">Buy, resell or rent verified properties across Dhanbad.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-navy-950/8 bg-white p-5">
            <Suspense fallback={null}>
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        <div>
          <Suspense fallback={null}>
            <SortAndMobileFilters resultCount={total} />
          </Suspense>

          {properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-950/15 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-navy-950">No exact matches found.</h2>
              <p className="mt-1 text-sm text-slate-600">
                Try widening your budget or bedroom filters. Here are some similar properties you might like:
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                {fallback.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} searchParams={raw} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page") continue;
      if (typeof v === "string") params.set(k, v);
    }
    params.set("page", String(p));
    return `/properties?${params.toString()}`;
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
        .map((p) => (
          <a
            key={p}
            href={hrefFor(p)}
            className={
              p === page
                ? "flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 text-sm font-semibold text-cream-50"
                : "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-navy-950 hover:bg-navy-950/5"
            }
          >
            {p}
          </a>
        ))}
    </nav>
  );
}
